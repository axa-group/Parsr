import * as child_process from 'child_process';
import {
	BoundingBox,
	Document,
	Page,
	Table,
	TableCell,
	TableRow,
	Word,
} from '../types/DocumentRepresentation';
import { isInBox } from '../utils';
import logger from '../utils/Logger';
import { Module } from './Module';

export interface Options {
	pages?: string;
	flavor?: string;
}

const defaultOptions: Options = {
	pages: 'all', // Comma-separated page numbers. Example: '1,3,4' or '1,4-end' or 'all'.
	flavor: 'lattice', // The parsing method to use ('lattice' or 'stream'). Lattice is used by default.
};

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
		const tableExtractor = child_process.spawnSync('python3', [
			__dirname + '/../../assets/TableDetectionScript.py',
			inputFile,
			options.pages,
			options.flavor,
		]);
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
		const options: Options = { ...defaultOptions, ...this.options };
		const tableExtractor = this.extractor.readTables(doc.inputFile, options);

		if (tableExtractor.status !== 0) {
			logger.error(tableExtractor.stderr);
		} else {
			const tablesData = JSON.parse(tableExtractor.stdout);
			this.addTables(tablesData, doc);
			this.removeWordsUsedInCells(doc);
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
		page.elements = page.elements.concat(table);
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
			const rowWidth = tableCells.map(cell => cell.box.width).reduce((a, b) => a + b);
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
		return pageWords.filter(word => isInBox(word.box, cellBounds, false));
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
