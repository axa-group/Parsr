/**
 * Copyright 2020 AXA Group Operations S.A.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import * as filetype from 'file-type';
import * as fs from 'fs';
import {
  BoundingBox,
  Document,
  Page,
  SpannedTableCell,
  Table,
  TableCell,
  TableRow,
  Word,
  Drawing,
  Text,
} from '../../types/DocumentRepresentation';
import * as utils from '../../utils';
import * as CommandExecuter from '../../utils/CommandExecuter';
import logger from '../../utils/Logger';
import { Module } from '../Module';
import * as defaultConfig from './defaultConfig.json';
import { SvgLine } from '../../types/DocumentRepresentation/SvgLine';
import drawingToTable from './DrawingToTableHelper';
import drawingLineMerge from './DrawingLineMergeHelper';
import { json2document } from '../../utils/json2document';

export interface Options {
  pages?: number[];
  flavor?: string;
  table_areas?: string[];
}

export type JsonTableCell = {
  size: {
    width: number;
    height: number;
  },
  location: {
    x: number;
    y: number;
  },
  colSpan: number,
  rowSpan: number,
}

export type JsonTable = {
  size: {
    width: number;
    height: number;
  },
  location: {
    x: number;
    y: number;
  },
  rows: number[][],
  cols: number[][],
  cells: JsonTableCell[][],
  content?: string[][],
  flavor?: string,
}

type JsonTablePage = {
  page: number;
  tables: JsonTable[];
}

const defaultOptions = (defaultConfig as any) as Options;

export interface TableExtractorResult {
  stdout: string;
  stderr: string;
  status: number;
}

type SpannedCellPosition = {
  x: number;
  y: number;
  direction: 'left' | 'top' | 'right';
};

export interface TableExtractor {
  readTables(inputFile: string, options: Options): Promise<TableExtractorResult>;
}

const defaultExtractor: TableExtractor = {
  readTables(inputFile: string, options: Options): Promise<TableExtractorResult> {
    let pages: string = 'all';
    let flavor: string = 'lattice';
    const lineScale: string = '45';
    if (options.pages.length !== 0) {
      pages = options.pages.toString();
    }
    if (!['lattice', 'stream'].includes(options.flavor)) {
      logger.warn(
        `table detection flavor asked for: ${options.flavor} is not a possibility. defaulting to 'lattice'`,
      );
    } else {
      flavor = options.flavor;
    }

    return CommandExecuter.detectTables(
      inputFile,
      flavor,
      lineScale,
      pages,
      options.table_areas || [],
    )
      .then(stdout => ({
        stdout,
        stderr: '',
        status: 0,
      }))
      .catch(({ error }) => {
        return {
          stdout: '',
          stderr: error,
          status: 1,
        };
      });
  },
};

export class TableDetectionModule extends Module<Options> {
  public static moduleName = 'table-detection';
  private extractor: TableExtractor;

  constructor(options?: Options) {
    super(options, defaultOptions);
    this.setExtractor(defaultExtractor);
  }

  public setExtractor(extractor: TableExtractor) {
    this.extractor = extractor;
  }

  public async main(doc: Document): Promise<Document> {
    try {
      if (!fs.existsSync(doc.inputFile)) {
        logger.warn(`Input file ${doc.inputFile} cannot be found. Not performing table detection.`);
        return doc;
      }
    } catch (err) {
      logger.error(`Could not check if the input file ${doc.inputFile} exists: ${err}..`);
      return doc;
    }

    const fileType: { ext: string; mime: string } = filetype(fs.readFileSync(doc.inputFile));
    if (fileType === null || fileType.ext !== 'pdf') {
      logger.warn(`Input file ${doc.inputFile} is not a PDF; Not performing table detection.`);
      return doc;
    }
    if (doc.getElementsOfType<Table>(Table).length !== 0) {
      logger.warn('Document already has tables. Not performing table detection.');
      return doc;
    }

    for (const config of this.options.runConfig) {
      const tableExtractor = await this.extractor.readTables(doc.inputFile, config);
      if (tableExtractor.status === 0) {
        const tablesData = JSON.parse(tableExtractor.stdout);
        this.addTables(tablesData, doc);
      }
    }

    if (this.options.checkDrawings && doc.drawingsFile && fs.existsSync(doc.drawingsFile)) {
      logger.info('Looking for table candidates on Drawings...');
      const drawingTablesData = this.findTablesOnDrawings(doc);
      this.addTables(drawingTablesData, doc);
    }

    this.removeWordsUsedInCells(doc);
    const tableCount = doc.getElementsOfType<Table>(Table).length;
    logger.info(`${tableCount} tables found on document.`);
    return doc;
  }

  private addTables(tablesData: JsonTablePage[], doc: Document) {
    tablesData.map(pageData => {
      pageData.tables.filter(table => table != null).map(table => {
        this.addTable(table, doc.pages[pageData.page - 1]);
      });
    });
  }

  private addTable(tableData: JsonTable, page: Page) {
    const pageHeight = page.box.height;
    const table: Table = this.createTable(tableData, pageHeight);
    table.content = this.createRows(tableData, page);

    if (tableData.content && tableData.flavor === 'stream') {
      table.content = this.joinCellsByContent(table.content, tableData.content);
    }

    if (!this.isFalseTable(table)) {
      page.elements = page.elements.concat(table);
    }
  }

  private joinCellsByContent(tableContent: TableRow[], tableData: string[][]): TableRow[] {
    const mergeCandidateCells = this.getMergeCandidateCellPositions(tableContent, tableData);
    Object.keys(mergeCandidateCells).forEach(cellRow => {
      const groupsToMerge = [];
      mergeCandidateCells[cellRow].forEach(cellColGroup => {
        let cellSubGroup = [cellColGroup[0]];
        for (let i = 0; i < cellColGroup.length; i += 1) {
          const expectedTextInSubGroup = cellSubGroup
            .map(cellCol => tableData[cellRow][cellCol].trim())
            .join(' ')
            .trim();

          const tableContentSubGroup: TableCell[] = tableContent[
            cellRow
          ].content.filter((_, index) => cellSubGroup.includes(index));
          const subgroupText = tableContentSubGroup
            .map(cell => cell.toString().trim())
            .join(' ')
            .trim();

          if (expectedTextInSubGroup === subgroupText) {
            groupsToMerge.push(cellSubGroup);
          }

          if (
            subgroupText.length > expectedTextInSubGroup.length ||
            expectedTextInSubGroup === subgroupText
          ) {
            cellSubGroup = [];
          }

          if (cellColGroup.length > i + 1) {
            cellSubGroup.push(cellColGroup[i + 1]);
          }
        }
      });
      if (groupsToMerge.length > 0) {
        tableContent[cellRow].mergeCells(groupsToMerge);
      }
    });

    return tableContent;
  }

  private getMergeCandidateCellPositions(tableContent: TableRow[], tableData: string[][]): object {
    const mergeCandidateCells = {};

    /*
      having the expected text content in each cell in tableData,
      this looks for cells in tableContent whose text content is different from the expected
      ex:
        tableContent: | this is only one      | cell  |
                      | foo                   | bar   |

        tableData:    | this is only one cell |       |
                      | foo                   | bar   |

        will give mergeCandidateCells = { '0': [0,1] }
        because content in [0,0] and [0,1] is different than the expected
    */
    tableData.forEach((dataRow, nRow) => {
      dataRow.forEach((cellStr, nCol) => {
        const tableCellContent = tableContent[nRow].content[nCol].toString();
        const expectedCellContent = cellStr.toString();
        if (tableCellContent !== expectedCellContent) {
          if (!mergeCandidateCells[nRow]) {
            mergeCandidateCells[nRow] = [];
          }
          mergeCandidateCells[nRow].push(nCol);
        }
      });
    });

    /*
      now I group the candidate Cells by consecutive numbers.
      Grouped results will tell which cells could be joined together into one Cell
      and check if that new content matches the expected content

      For now groups with only one value are not considered (possible vertical join or string encoding problem)
    */
    Object.keys(mergeCandidateCells).forEach(nRow => {
      mergeCandidateCells[nRow] = utils
        .groupConsecutiveNumbersInArray(mergeCandidateCells[nRow])
        .filter(group => group.length > 1);
      if (mergeCandidateCells[nRow].length === 0) {
        delete mergeCandidateCells[nRow];
      }
    });

    return mergeCandidateCells;
  }

  private isFalseTable(table: Table): boolean {
    const isFalse = table.content.some((_, index) => !this.existAdjacentRow(index, table));
    const only1Row = table.content.length === 1;
    const only1Col = table.content.every(row => row.content
      .filter(col => !(col instanceof SpannedTableCell)).length <= 1,
    );

    const rowsHeightSum = table.content.reduce((total, row) => total + row.height, 0);

    const rowRights = table.content.map(row => row.right).sort((a, b) => a - b);
    return isFalse ||
      only1Row ||
      only1Col ||
      Math.ceil(rowsHeightSum) < Math.floor(table.height) ||
      rowRights[rowRights.length - 1] - rowRights[0] > 5;
  }

  private existAdjacentRow(rowIndex: number, table: Table): TableRow {
    if (rowIndex + 1 === table.content.length) {
      return this.existPreviousRow(rowIndex, table);
    }
    const row = table.content[rowIndex];
    const findRowWithTop = Math.ceil(row.box.top + row.box.height);

    return table.content
      .filter(rowToFind => Math.ceil(rowToFind.box.top) === findRowWithTop)
      .shift();
  }

  private existPreviousRow(rowIndex: number, table: Table): TableRow {
    const row = table.content[rowIndex];
    const findRowWithBottom = Math.ceil(row.box.top);

    return table.content
      .filter(
        rowToFind => Math.ceil(rowToFind.box.top + rowToFind.box.height) === findRowWithBottom,
      )
      .shift();
  }

  private createTable(tableData: JsonTable, pageHeight: number): Table {
    const tableBounds = new BoundingBox(
      tableData.location.x,
      pageHeight - tableData.location.y,
      tableData.size.width,
      tableData.size.height,
    );
    return new Table([], tableBounds);
  }

  private createRows(tableData: JsonTable, page: Page): TableRow[] {
    const pageWords = page.getElementsOfType<Word>(Word);

    // this is used to keep track of the position of cells that are merged into another
    const spannedCells: SpannedCellPosition[] = [];
    return tableData.cells.map((row, rowIndex) => {
      const tableCells: TableCell[] =
        this.createRowCells(row, rowIndex, page.box.height, pageWords, spannedCells, tableData.cols, tableData.rows);
      const maxRight = Math.max(...tableCells.filter(tc => !!tc.box).map(tc => tc.right));
      const minLeft = Math.min(...tableCells.filter(tc => !!tc.box).map(tc => tc.left));
      const minTop = Math.min(...tableCells.filter(tc => !!tc.box).map(tc => tc.top));
      const minBottom = Math.min(...tableCells.filter(tc => !!tc.box).map(tc => tc.bottom));
      const rowWidth = maxRight - minLeft;
      const rowHeight = minBottom - minTop;
      return new TableRow(
        tableCells,
        new BoundingBox(
          minLeft,
          minTop,
          rowWidth,
          rowHeight,
        ),
      );
    });
  }

  private createRowCells(
    row: JsonTableCell[],
    rowIndex: number,
    pageHeight: number,
    pageWords: Word[],
    spannedCells: SpannedCellPosition[],
    cols: number[][],
    rows: number[][],
  ): TableCell[] {
    const cells: TableCell[] = [];

    for (let colIndex = 0; colIndex < cols.length; colIndex++) {
      // cell at (colIndex,rowIndex) is spanned, push SpannedTableCell
      const spannedCell = spannedCells.find(sc => sc.x === colIndex && sc.y === rowIndex);
      if (spannedCell) {
        const [x1, x2] = cols[colIndex];
        const [y1, y2] = rows[rowIndex].map(y => pageHeight - y);
        const box = new BoundingBox(x1, y1, x2 - x1, y2 - y1);
        cells.push(new SpannedTableCell(box, spannedCell.direction));
        if (row.length < cols.length) {
          row.splice(colIndex, 0, null);
        }

      } else {
        const cell = row[colIndex];
        if (cell) {
          // detect spanned cells based on colSpan and rowSpan of the current cell
          [...Array(cell.colSpan || 1).keys()].forEach(x => {
            [...Array(cell.rowSpan || 1).keys()].forEach(y => {
              if (x !== 0 || y !== 0) {
                spannedCells.push({
                  x: x + colIndex,
                  y: y + rowIndex,
                  direction: x > 0 ? 'left' : 'top',
                });
              }
            });
          });

          const cellBounds = new BoundingBox(
            cell.location.x,
            pageHeight - cell.location.y,
            cell.size.width,
            cell.size.height,
          );
          const tableCell: TableCell = new TableCell(cellBounds);
          tableCell.colspan = cell.colSpan;
          tableCell.rowspan = cell.rowSpan;
          tableCell.content = this.wordsInCellBox(cellBounds, pageWords);
          cells.push(tableCell);
        }
      }
    }
    return cells;
  }

  private wordsInCellBox(cellBounds: BoundingBox, pageWords: Word[]): Word[] {
    return pageWords.filter(
      w => BoundingBox.getOverlap(w.box, cellBounds).box1OverlapProportion > 0.75,
    );
  }

  private removeWordsUsedInCells(document: Document) {
    document.pages.forEach(page => {
      const cellWordsIds = page
        .getElementsOfType<TableCell>(TableCell)
        .map(cell => cell.content)
        .reduce((a, b) => a.concat(b), [])
        .map(element => element.id);

      page.elements = page.elements.filter(element => {
        const isWord = element instanceof Word;
        const isUsedInCell = cellWordsIds.includes(element.id);
        return (isWord && !isUsedInCell) || !isWord;
      });
    });
  }

  private findTablesOnDrawings(doc: Document): JsonTablePage[] {
    const jsonResult: JsonTablePage[] = [];

    const drawingsJson = JSON.parse(fs.readFileSync(doc.drawingsFile, { encoding: 'utf8' }));
    const drawingsDoc = json2document(drawingsJson);
    drawingsDoc.pages.forEach(drawingPage => {
      const pageDrawings = drawingPage.getElementsOfType<Drawing>(Drawing);
      const docPage = doc.pages.find(p => p.pageNumber === drawingPage.pageNumber);
      const improvedDrawings = pageDrawings
        .filter(d => this.drawingIsTableCandidate(d, docPage))
        .map(drawingLineMerge);

      const tables = improvedDrawings
        .filter(d => this.drawingIsTable(d, docPage))
        .map(d => drawingToTable(d, docPage.height));
      jsonResult.push({ page: docPage.pageNumber, tables });
    });
    return jsonResult;
  }

  private drawingIsTableCandidate(d: Drawing, p: Page): boolean {
    const totalLines = d.content.length;
    const vhLines = (d.content as SvgLine[]).filter(l => l.isVertical() || l.isHorizontal());

    // percentage of lines that are Horizontal or Vertical
    const vhLinesPercentage = totalLines > 0 ? vhLines.length / totalLines : 0;

    // Text elements strictly inside the bounding box of the drawing
    const textInsideDrawing = (p.getElementsSubset(d.box) as Text[]);

    return vhLinesPercentage > 0.4 && textInsideDrawing.length > 0;
  }

  private drawingIsTable(d: Drawing, p: Page): boolean {
    // if there is already a Table in the position of the drawing, skips.
    if (p.getElementsOfType<Table>(Table).some(table => BoundingBox.getOverlap(table.box, d.box).box1OverlapProportion > 0.9)) {
      return false;
    }
    const vhLines = (d.content as SvgLine[]).filter(l => l.isVertical() || l.isHorizontal());

    // Text elements strictly inside the bounding box of the drawing
    const textInsideDrawing = (p.getElementsSubset(d.box) as Text[]);

    // subset of `textInsideDrawing` elements that are overlapping with any h/v SvgLine of the Drawing.
    const overLappingTextInsideDrawing = textInsideDrawing.filter(t =>
      vhLines.some(line => this.lineOverlapsText(line, t)),
    );

    // percentage of text elements inside drawing that are overlapping with any h/v drawing line.
    const overlappingTextPercentage = textInsideDrawing.length > 0 ? overLappingTextInsideDrawing.length / textInsideDrawing.length : 0;

    // horizontal lines that have (almost) the same width than the box of the drawing
    const fullWidthHorizontalLines = (d.content as SvgLine[]).filter(l => {
      const lineW = Math.abs(l.fromX - l.toX);
      // TODO replace 2 with tolerance value
      return l.isHorizontal() && lineW + 2 >= d.width && lineW - 2 <= d.width;
    });

    // vertical lines that have (almost) the same height than the box of the drawing
    const fullHeightVerticalLines = (d.content as SvgLine[]).filter(l => {
      const lineH = Math.abs(l.fromY - l.toY);
      return l.isVertical() && lineH + 1 >= d.height && lineH - 1 <= d.height;
    });

    const verticalLinesInMiddle = (d.content as SvgLine[]).filter(l => {
      const minL = Math.min(l.fromX, l.toX);
      const maxL = Math.max(l.fromX, l.toX);
      return l.isVertical() &&
        Math.floor(minL) > d.left &&
        Math.ceil(maxL) < d.right &&
        Math.abs(l.fromY - l.toY) >= d.height / 3.1;
    });

    // at least a couple of "main" lines have to intersect 
    const mainLinesIntersect = fullWidthHorizontalLines.some(hl =>
      verticalLinesInMiddle.some(vl => vl.intersects(hl)));

    return overlappingTextPercentage < 0.4 &&
      fullWidthHorizontalLines.length >= 3 &&
      fullHeightVerticalLines.length >= 2 &&
      verticalLinesInMiddle.length >= 1 &&
      mainLinesIntersect;
  }

  private lineOverlapsText(line: SvgLine, e: Text): boolean {
    if (!e.box) return false;
    const svgLines = e.box.toSvgLines();
    const bottom = svgLines[2];
    return svgLines.some(boxLine => line.intersects(boxLine)) && bottom.fromY - e.bottom > 3;
  }
}
