/**
 * Copyright 2019 AXA Group Operations S.A.
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

export class TableCell extends Element {
	private _content: Element[];
	private _rowspan: number;
	private _colspan: number;

	constructor(boundingBox: BoundingBox, content?: Element[], rowspan?: number, colspan?: number) {
		super(boundingBox);
		this.content = content;

		if (rowspan) {
			this.rowspan = rowspan;
		} else {
			this.rowspan = 1;
		}

		if (colspan) {
			this.colspan = colspan;
		} else {
			this.colspan = 1;
		}
	}

	/**
	 * Getter content
	 * @return {Element[]}
	 */
	public get content(): Element[] {
		return this._content;
	}

	/**
	 * Getter rowspan
	 * @return {number}
	 */
	public get rowspan(): number {
		return this._rowspan;
	}

	/**
	 * Getter colspan
	 * @return {number}
	 */
	public get colspan(): number {
		return this._colspan;
	}

	/**
	 * Setter content
	 * @param {Element[]} value
	 */
	public set content(value: Element[]) {
		this._content = value;
	}

	/**
	 * Setter rowspan
	 * @param {number} value
	 */
	public set rowspan(value: number) {
		this._rowspan = value;
	}

	/**
	 * Setter colspan
	 * @param {number} value
	 */
	public set colspan(value: number) {
		this._colspan = value;
	}

	/**
	 * Converts the entire row into a md code string.
	 */
	public toMarkdown(): string {
		let output: string = '   <td';
		if (this.colspan > 1) {
			output += ' colspan=' + this.colspan;
		}
		if (this.rowspan > 1) {
			output += ' rowspan=' + this.rowspan;
		}

		if (this.isCenterAligned()) {
			output += " align='center'";
		}

		output += '>';

		this.content.forEach(element => {
			output += element.toHTML();
		});
		return output + '</td>  \n';
	}

	private isCenterAligned(): boolean {
		const firstChild = this.content[0];
		if (firstChild && Array.isArray(firstChild.content)) {
			const childContents = firstChild.content as Element[];
			return (
				childContents
					.map(element => {
						const marginLeft = Math.ceil(
							Math.abs(element.left + element.width - this.width - this.left),
						);
						const marginRight = Math.ceil(element.left - this.left);
						return Math.abs(marginLeft - marginRight) < 2;
					})
					.filter(boolCenterAlignment => boolCenterAlignment).length === childContents.length
			);
		}
		return false;
	}
}
