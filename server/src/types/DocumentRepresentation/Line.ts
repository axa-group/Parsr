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

import * as utils from '../../utils';
import logger from '../../utils/Logger';
import { BoundingBox } from './BoundingBox';
import { Font } from './Font';
import { Text } from './Text';
import { Word } from './Word';

/**
 * The Line represents a text class which contains a group of words representing a horizontal chain
 * of consecutive words. It is to be noted that a Line may or may not be a sentence, as a sentence can span
 * multiple physical Line objects, or, multiple sentences can coexist in a single Line object.
 */
export class Line extends Text {
	private _content: Word[];
	private _language: string;
	private _scaling: number;

	constructor(boundingBox: BoundingBox, content: Word[] = []) {
		super(boundingBox);
		this.content = content;
	}

	public toString(): string {
		return this.content
			.map(w => w.toString().trim())
			.reduce((w1, w2) => w1 + ' ' + w2, '')
			.trim();
	}

	/**
	 * Returns the main font of the line using a basket + voting mechanism. The most used font will be returned
	 * as a valid Font object.
	 */
	public getMainFont(): Font | undefined {
		const result: Font = utils.findMostCommonFont(this.content.map((word: Word) => word.font));
		if (result !== undefined) {
			return result;
		} else {
			logger.debug(`No font found for word id ${this.id}`);
			return undefined;
		}
	}

	/**
	 * Getter content
	 * @return {Word[]}
	 */
	public get content(): Word[] {
		return this._content;
	}

	/**
	 * Getter language
	 * @return {string}
	 */
	public get language(): string {
		return this._language;
	}

	/**
	 * Getter scaling
	 * @return {number}
	 */
	public get scaling(): number {
		return this._scaling;
	}

	/**
	 * Setter content
	 * @param {Word[]} value
	 */
	public set content(value: Word[]) {
		this._content = value;
	}

	/**
	 * Setter language
	 * @param {string} value
	 */
	public set language(value: string) {
		this._language = value;
	}

	/**
	 * Setter scaling
	 * @param {number} value
	 */
	public set scaling(value: number) {
		this._scaling = value;
	}
}
