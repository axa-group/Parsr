/**
 * Copyright 2019 AXA
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

import { BoundingBox } from './BoundingBox';
import { Element } from './Element';
import { TableCell } from './TableCell';
import { TableRow } from './TableRow';

/* table span type: array<[rowNb, colNb, colspan, rowspan]>
 *  ... where the array represents a collection of cells; coordinates represented
 * by rowNb, colNb, having either their colspan or rowspan !== 0,
 */
export type SpanType = Array<[number, number, number, number]>;
export interface TableShapeType {
	rows: number;
	cols: number;
	spans: SpanType;
}
export class Table extends Element {
	/**
	 * Getter rows
	 * @return {TableRow[]}
	 */
	public get content(): TableRow[] {
		return this._content;
	}

	/**
	 * Setter rows
	 * @param {TableRow[]} value
	 */
	public set content(value: TableRow[]) {
		this._content = value;
		this.calculateShape(); // recalculate row at each row setting
	}

	/**
	 * Getter shape
	 * @return {TableShapeType}
	 */
	public get shape(): TableShapeType {
		return this._shape;
	}

	/**
	 * Setter shape
	 * @param {TableShapeType} value
	 */
	public set shape(value: TableShapeType) {
		this._shape = value;
	}
	private _content: TableRow[];
	private _shape: TableShapeType;

	constructor(rows: TableRow[], boundingBox?: BoundingBox) {
		if (!boundingBox) {
			boundingBox = BoundingBox.merge(rows.map(row => row.box));
		}
		super(boundingBox);
		this.content = rows;
	}
	/**
	 * Returns the cell of a table at rowIndex, cellIndex.
	 * @param {rowIndex} number
	 * @param {cellIndex} number
	 * @return {TableCell}
	 */
	public getCellAt(rowIndex: number, cellIndex: number): TableCell {
		return this.getRowAt(rowIndex).content[cellIndex];
	}

	/**
	 * Returns the row of a table at rowIndex.
	 * @param {rowIndex} number
	 * @return {TableRow}
	 */
	public getRowAt(rowIndex: number): TableRow {
		return this.content[rowIndex];
	}

	/**
	 * Returns the col of a table at rowIndex.
	 * @param {colIndex} number
	 * @return {TableCell[]}
	 */
	public getColAt(colIndex: number): TableCell[] {
		const t: TableCell[] = [];
		this.content.forEach(row => {
			if (row.content.length === this.shape.cols) {
				t.push(row.content[colIndex]);
			} else {
				let counter: number = 0;
				for (let i = 0; i !== row.content.length; ++i) {
					const cell: TableCell = row.content[i];
					if (counter !== colIndex) {
						counter += cell.colspan;
					} else if (counter > colIndex) {
						t.push(row.content[i - 1]);
					} else {
						t.push(cell);
					}
				}
			}
		});
		return t;
	}

	/**
	 * Returns a set of rows of a table from rowFrom to rowTo.
	 * @param {rowFrom} number
	 * @param {rowTo} number
	 * @return {TableRow[]}
	 */
	public getRowFromTo(rowFrom: number, rowTo: number): TableRow[] {
		if (rowFrom > this.content.length - 1 || rowTo > this.content.length) {
			return [];
		}
		if (rowFrom < rowTo) {
			return this.content.slice(rowFrom, rowTo);
		} else if (rowFrom === rowTo) {
			return [this.getRowAt(rowFrom)];
		} else {
			return [];
		}
	}

	/**
	 * Gets all the elements inside all the cells of a row
	 * @param {rowIndex} number
	 * @return {Element[]}
	 */
	public getAllElementsInRow(rowIndex: number): Element[] {
		let e: Element[] = [];
		const r: TableRow = this.getRowAt(rowIndex);
		r.content.forEach(cell => {
			e = [...e, ...cell.content];
		});
		return e;
	}

	/**
	 * Slices at a row, returning the set of tables split at each rowIndex
	 * and the content of all elements at each rowIndex.
	 * @param {rowIndex} number
	 * @return {Element[]}
	 */
	public sliceHorizontally(rowIndex: number[]): Element[] {
		let newElements: Element[] = [];

		rowIndex.forEach(rowNb => {
			const e: Element[] = this.getAllElementsInRow(rowNb);
			newElements = [...newElements, ...e];
		});
		const originalContainsZero: boolean = rowIndex.includes(0);

		// pad the list, uniquify it, then sort it
		if (!originalContainsZero) {
			rowIndex.unshift(0);
		}
		rowIndex.push(this.content.length);
		const uniq = rowIndex.filter((item, i, ar) => {
			return ar.indexOf(item) === i;
		});

		uniq.sort((n1, n2) => n1 - n2);
		const rowIndexSorted: number[] = uniq;

		// extract sub-tables
		for (let i = 0; i !== rowIndexSorted.length - 1; ++i) {
			let rowFrom: number;
			if (rowIndexSorted[i] === 0) {
				if (!originalContainsZero) {
					rowFrom = 0;
				} else {
					rowFrom = 1;
				}
			} else {
				rowFrom = rowIndexSorted[i] + 1;
			}
			const rowTo: number = rowIndexSorted[i + 1];
			const t: Table = new Table(this.getRowFromTo(rowFrom, rowTo));
			if (t.content.length !== 0) {
				newElements.push(t);
			}
		}
		return newElements;
	}

	/**
	 * Performs cleaning of the table splits table at ghost cells and returns a set of
	 * elements that better represent the information in the table.
	 *
	 * @return {Element[]}
	 */
	public cleanTable(): Element[] {
		let e: Element[] = [];
		// this.fuseRedundantCells() // TODO add other cleaning algos here
		e = [...e, ...this.splitTableAtGhostRows()];
		return e;
	}

	/**
	 * Fuses redundant cells of the table
	 */
	public fuseRedundantCells() {
		return;
	}

	/**
	 * Split the table at ghost rows, return resulting rows. A ghost row has a single column
	 * @return {Element[]}
	 */
	public splitTableAtGhostRows(): Element[] {
		const ghostRows: number[] = [];
		this.shape.spans.forEach(entry => {
			if (this.content[entry[0]].content.length === 1 && entry[2] === this.shape.cols) {
				ghostRows.push(entry[0]);
			}
		});
		if (ghostRows.length !== 0) {
			return this.sliceHorizontally(ghostRows);
		} else {
			return [this];
		}
	}

	/**
	 * Get table dimensions
	 */
	public getDimensions(): [number, number] {
		let nRow: number = 0;
		let maxCol: number = 0;

		for (const row of this.content) {
			let nCol: number = 0;
			let minRowspan: number = Infinity;

			for (const cell of row.content) {
				nCol += cell.colspan;
				minRowspan = Math.min(minRowspan, cell.rowspan);
			}
			nRow += minRowspan;

			maxCol = Math.max(maxCol, nCol);
		}

		return [nRow, maxCol];
	}

	/**
	 * Transform the table to a bidimensional array
	 */
	public toArray(): string[][] {
		const dim: [number, number] = this.getDimensions();
		const arr: string[][] = new Array(dim[0])
			.fill(undefined)
			.map(() => new Array(dim[1]).fill(undefined));
		let nRow: number = 0;

		for (let i = 0; i < arr.length; i++) {
			const row: TableRow = this.content[nRow];
			let nCol: number = 0;
			let jumpLine: number = Infinity;

			for (let j = 0; j < arr[i].length; j++) {
				if (typeof arr[i][j] === 'undefined') {
					const cell: TableCell = row.content[nCol];

					// hotfix
					if (typeof cell === 'undefined') {
						continue;
					}

					for (let c = 0; c < cell.colspan; c++) {
						for (let r = 0; r < cell.rowspan; r++) {
							if (i + r < arr.length && j + c < arr[i].length) {
								arr[i + r][j + c] = null;
							}
						}
					}

					arr[i][j] = cell.content.toString().trim();
					jumpLine = Math.min(jumpLine, cell.rowspan);

					j += cell.colspan - 1;
					nCol++;
				}
			}

			i += jumpLine - 1;
			nRow++;
		}

		return arr;
	}

	private calculateShape(): void {
		const rowsNb: number = this.content.length;
		const colsNb: number = Math.max(...this.content.map(row => row.content.length));
		const spansNb: SpanType = [];
		for (const i in this.content) {
			const row = this.content[i];
			for (const j in row.content) {
				const cell = row.content[j];
				if (cell.colspan !== 1 || cell.rowspan !== 1) {
					spansNb.push([parseInt(i, 10), parseInt(j, 10), cell.colspan, cell.rowspan]);
				}
			}
		}
		this.shape = {
			cols: colsNb,
			rows: rowsNb,
			spans: spansNb,
		};
	}
}
