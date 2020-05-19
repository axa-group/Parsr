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
  Table,
  TableCell,
  TableRow,
  Word,
} from '../../types/DocumentRepresentation';
import * as utils from '../../utils';
import * as CommandExecuter from '../../utils/CommandExecuter';
import logger from '../../utils/Logger';
import { Module } from '../Module';
import * as defaultConfig from './defaultConfig.json';

export interface Options {
  pages?: number[];
  flavor?: string;
}

const defaultOptions = (defaultConfig as any) as Options;

export interface TableExtractorResult {
  stdout: string;
  stderr: string;
  status: number;
}

export interface TableExtractor {
  readTables(inputFile: string, options: Options): Promise<TableExtractorResult>;
}

const defaultExtractor: TableExtractor = {
  readTables(inputFile: string, options: Options): Promise<TableExtractorResult> {
    let pages: string = 'all';
    if (options.pages.length !== 0) {
      pages = options.pages.toString();
    }
    return CommandExecuter.detectTables2(inputFile, pages)
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

export class TableDetection2Module extends Module<Options> {
  public static moduleName = 'table-detection-2';
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
        this.removeWordsUsedInCells(doc);
      }
    }
    return doc;
  }

  private addTables(tablesData: any, doc: Document) {
    tablesData.map(pageData => {
      pageData.tables.map(table => {
        this.addTable(table, doc.pages[pageData.page - 1]);
      });
    });
  }

  private addTable(tableData: any, page: Page) {
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

  private isFalseTable(table: Table): boolean {
    // this detects 1x1 tables with no content
    const is1x1 =
      table.content.length === 1 &&
      table.content[0].content.length === 1 &&
      table.content[0].content[0].content.length === 0;

    const isFalse = table.content.some((_, index) => !this.existAdjacentRow(index, table));

    return is1x1 || isFalse;
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

  private createTable(tableData: any, pageHeight: number): Table {
    const tableBounds = new BoundingBox(
      tableData.location.x,
      pageHeight - tableData.location.y,
      tableData.size.width,
      tableData.size.height,
    );
    return new Table([], tableBounds);
  }

  private createRows(tableData: any, page: Page): TableRow[] {
    const pageWords = page.getElementsOfType<Word>(Word);
    return tableData.cells.map(row => {
      const tableCells: TableCell[] = this.createRowCells(row, page.box.height, pageWords);
      const rowWidth = tableCells.map(cell => cell.box.width).reduce((a, b) => a + b, 0);
      return new TableRow(
        tableCells,
        new BoundingBox(
          tableCells[0].box.left,
          tableCells[0].box.top,
          rowWidth,
          tableCells[0].box.height,
        ),
      );
    });
  }

  private createRowCells(row: any, pageHeight: number, pageWords: Word[]): TableCell[] {
    return row.map(col => {
      const cellBounds = new BoundingBox(
        col.location.x,
        pageHeight - col.location.y,
        col.size.width,
        col.size.height,
      );
      const cell: TableCell = new TableCell(cellBounds);
      if (col.colSpan) {
        cell.colspan = col.colSpan;
      }
      if (col.rowSpan) {
        cell.rowspan = col.rowSpan;
      }
      cell.content = this.wordsInCellBox(cellBounds, pageWords);
      return cell;
    });
  }

  private wordsInCellBox(cellBounds: BoundingBox, pageWords: Word[]): Word[] {
    return pageWords.filter(
      w => BoundingBox.getOverlap(w.box, cellBounds).box1OverlapProportion > 0.8,
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
}
