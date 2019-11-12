import * as child_process from 'child_process';
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
import logger from '../../utils/Logger';
import { Module } from '../Module';
import * as defaultConfig from './defaultConfig.json';

export interface Options {
  pages?: number[];
  flavor?: string;
  table_areas?: string[];
}

const defaultOptions = (defaultConfig as any) as Options;

export interface TableExtractorResult {
  stdout: string;
  stderr: string;
  status: number;
}

export interface TableExtractor {
  readTables(inputFile: string, options: Options): TableExtractorResult;
}

const defaultExtractor: TableExtractor = {
  readTables(inputFile: string, options: Options): TableExtractorResult {
    let pages: string = 'all';
    let flavor: string = 'lattice';
    const lineScale: string = '70';
    if (options.pages.length !== 0) {
      pages = options.pages.toString();
    }
    if (!options.flavor.includes(options.flavor)) {
      logger.warn(
        `table detection flavor asked for: ${options.flavor} is not a possibility. defaulting to 'lattice'`,
      );
    } else {
      flavor = options.flavor;
    }

    // find python executable name
    const pythonLocation: string = utils.getPythonLocation();
    if (pythonLocation === "") {
      return {
        stdout: '',
        stderr: 'Unable to find python on the system. Are you sure it is installed?',
        status: 10,
      };
    }

    const scriptArgs = [
      __dirname + '/../../../assets/TableDetectionScript.py',
      inputFile,
      flavor,
      lineScale,
      pages,
    ];

    if ((options.table_areas || []).length > 0) {
      scriptArgs.push(options.table_areas.join(';'));
    }

    const tableExtractor = child_process.spawnSync(pythonLocation, scriptArgs);

    if (!tableExtractor.stdout || !tableExtractor.stderr) {
      return {
        stdout: '',
        stderr: 'Unable to run python script. Are you sure camelot-py[cv] is installed?',
        status: 10,
      };
    }

    return {
      stdout: tableExtractor.stdout.toString(),
      stderr: tableExtractor.stderr.toString(),
      status: tableExtractor.status,
    };
  },
};

export class TableDetectionModule extends Module<Options> {
  public static moduleName = 'table-detection';
  private extractor: TableExtractor;

  constructor(options?: Options, tableExtractor: TableExtractor = defaultExtractor) {
    super(options, defaultOptions);
    this.extractor = tableExtractor;
  }

  public main(doc: Document): Document {
    const fileType: { ext: string; mime: string } = filetype(fs.readFileSync(doc.inputFile));
    if (fileType === null || fileType.ext !== 'pdf') {
      logger.warn(
        `Warning: The input file ${doc.inputFile} is not a PDF; Not performing table detection.`,
      );
      return doc;
    }
    if (doc.getElementsOfType<Table>(Table).length !== 0) {
      logger.warn(
        'Warning: document already has tables extracted by the extractor. Not performing table detection.',
      );
      return doc;
    }

    try {
      if (fs.existsSync(doc.inputFile)) {
        logger.info(
          `Attempting table detection on ${doc.inputFile}..`,
        );
      } else {
        logger.warn(
          `Warning: The configured input filename ${doc.inputFile} cannot be found. Not performing table detection.`,
        );
        return doc;
      }
    } catch (err) {
      logger.error(`Could not check if the input file ${doc.inputFile} exists: ${err}..`);
      return doc;
    }

    this.options.pageConfig.forEach((config, n) => {
      const tableExtractor = this.extractor.readTables(doc.inputFile, config);
      if (tableExtractor.status !== 0) {
        logger.error(`there was a problem executing table config no. ${n + 1}: ${JSON.stringify(config)}`);
        logger.error(tableExtractor.stderr);
      } else {
        const tablesData = JSON.parse(tableExtractor.stdout);
        this.addTables(tablesData, doc);
        this.removeWordsUsedInCells(doc);
      }
    });
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
    if (!this.isFalseTable(table)) {
      page.elements = page.elements.concat(table);
    }
  }

  private isFalseTable(table: Table): boolean {
    let isFalse = false;
    table.content.forEach((_, index) => {
      if (!this.existAdjacentRow(index, table)) {
        isFalse = true;
      }
    });
    return isFalse;
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
    return pageWords.filter(w => (BoundingBox.getOverlap(w.box, cellBounds).box1OverlapProportion > 0.80));
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
