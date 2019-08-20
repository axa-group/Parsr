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

import * as clone from 'clone';
import { Element } from './Element';
import { Page } from './Page';

type Margins = {
	top: number;
	left: number;
	bottom: number;
	right: number;
};

/**
 * The Document class which represents a valid document in the Document Representation as a collection
 * of Page elements. Other than that, the class also contains attributes pertaining to document wide information
 * like the top, left, right and bottom margins, which are set by an external module named HeaderFooterDetection.
 */
export class Document {
	/**
	 * Getter inputFile
	 * @return {string}
	 */
	public get inputFile(): string {
		return this._inputFile;
	}

	/**
	 * Getter pages
	 * @return {Page[]}
	 */
	public get pages(): Page[] {
		return this._pages;
	}

	/**
	 * Getter margins
	 * @return {Margins}
	 */
	public get margins(): Margins {
		return this._margins;
	}

	/**
	 * Setter inputFile
	 * @param {string} value
	 */
	public set inputFile(value: string) {
		this._inputFile = value;
	}

	/**
	 * Setter pages
	 * @param {Page[]} value
	 */
	public set pages(value: Page[]) {
		this._pages = value;
	}

	/**
	 * Setter margins
	 * @param {Margins} value
	 */
	public set margins(value: Margins) {
		this._margins = value;
	}

	/**
	 * Generates a valid Document object from an input json.
	 * @param json The input json from which the Document is to be constructed
	 */
	public static fromJson(json: Page[]): Document {
		const copy = clone(json);

		return new Document(copy);
	}
	private _pages: Page[];
	private _inputFile: string;
	private _margins: Margins;

	constructor(pages: Page[] = [], inputFile?: string) {
		this.pages = pages;
		this.inputFile = inputFile;
		this.margins = { top: -1, left: -1, bottom: -1, right: -1 };
	}

	/**
	 * Returns all the elements of a document, traversing all the pages
	 */
	public getAllElements(): Element[] {
		return this.pages.map(p => p.getAllElements()).reduce((acc, val) => acc.concat(val), []);
	}

	/**
	 * Return an element of a particular ID in the Document
	 * @param id the id of the element to be matched to find the corresponding element
	 */
	public getElementById(id: number): Element {
		return this.getAllElements().find(x => x.id === id);
	}

	public getElementsOfType<T extends Element>(type: new (...args: any[]) => T): T[] {
		return this.pages.map(p => p.getElementsOfType(type)).reduce((acc, val) => acc.concat(val), []);
	}
}
