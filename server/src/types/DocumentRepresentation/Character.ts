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
import { Font } from './Font';
import { Text } from './Text';

/**
 * The Character class is the derived class of the more general Text class which represents a textual
 * element in the Document Represenation set of classes.
 */
export class Character extends Text {
	private _content: string;
	private _font: Font;

	constructor(boundingBox: BoundingBox, content: string = '', font: Font = Font.undefinedFont) {
		super(boundingBox);
		this.content = content;
		this.font = font;
	}

	/**
	 * Returns the Character content as a string.
	 */
	public toString(): string {
		return this.content;
	}

	/**
	 * Getter content
	 * @return {string}
	 */
	public get content(): string {
		return this._content;
	}

	/**
	 * Setter content
	 * @param {string} value
	 */
	public set content(value: string) {
		this._content = value;
	}

	/**
	 * Getter font
	 * @return {Font}
	 */
	public get font(): Font {
		return this._font;
	}

	/**
	 * Setter font
	 * @param {Font} value
	 */
	public set font(value: Font) {
		this._font = value;
	}
}
