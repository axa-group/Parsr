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
import { Paragraph } from './Paragraph';

/**
 * The List element is a collection of paragraphs that represent a block of list items in a Document.
 * The boolean attribute isOrdered distinguishes an ordered from an unordered (bulleted) list.
 * The list's level in terms of text indentation can also be specified using the level class attribute.
 */
export class List extends Element {
	private _content: Paragraph[];
	private _isOrdered: boolean;
	private _level: number;

	constructor(boundingBox: BoundingBox, content?: Paragraph[], isOrdered?: boolean) {
		super(boundingBox);
		this._content = content;
		this._isOrdered = isOrdered;
	}

	public addParagraph(paragraph: Paragraph) {
		this.content.push(paragraph);
		this.box = BoundingBox.merge([this.box, paragraph.box]);
	}

	/**
	 * Getter content
	 * @return {Paragraph[]}
	 */
	public get content(): Paragraph[] {
		return this._content;
	}

	/**
	 * Getter isOrdered
	 * @return {boolean}
	 */
	public get isOrdered(): boolean {
		return this._isOrdered;
	}

	/**
	 * Getter level
	 * @return {number}
	 */
	public get level(): number {
		return this._level;
	}

	/**
	 * Setter content
	 * @param {Paragraph[]} value
	 */
	public set content(value: Paragraph[]) {
		this._content = value;
	}

	/**
	 * Setter isOrdered
	 * @param {boolean} value
	 */
	public set isOrdered(value: boolean) {
		this._isOrdered = value;
	}

	/**
	 * Setter level
	 * @param {number} value
	 */
	public set level(value: number) {
		this._level = value;
	}
}
