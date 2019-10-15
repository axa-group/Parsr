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
import { Line } from './Line';
import { Text } from './Text';
import { Word } from './Word';

type LineInfo = {
	line: Line;
	lineBreak: Boolean;
	firstWordStyle: String;
	lastWordStyle: String;
};

/**
 * The Paragraph class represents a collection of lines, fused together to represent a block of text
 * which potentially represents a symantic grouping.
 */
export class Paragraph extends Text {
	private _content: Line[];
	private _language: string;

	constructor(boundingBox: BoundingBox, content: Line[] = []) {
		super(boundingBox);
		this.content = content;
	}

	/**
	 * Converts the entire paragraph into a string form, with linebreaks between lines and spaces between
	 * words.
	 */
	public toString(): string {
		const content: string[] = this.content.map(l => l.toString());
		if (content.length !== 0) {
			return content.reduce((l1, l2) => l1 + ' ' + l2, '').trim(); // TODO better carriage return handling
		} else {
			return '';
		}
	}

	/**
	 * Converts the entire paragraph into a string form with formatting, with spaces between words.
	 */
	public toMarkdown(): string {
		const lines: LineInfo[] = this.getLinesInfo();
		let output: string = '';
		let prevLine: LineInfo = null;
		lines.forEach((line, index) => {
			let mergedStyles = { paragraphOutput: output, lineOutput: this.lineToMarkDown(line.line) };
			this.mergeStyleLines(prevLine, line, mergedStyles);
			output = mergedStyles.paragraphOutput;
			output += mergedStyles.lineOutput;
			if (line.lineBreak) {
				output += '  \n';
			} else if (index + 1 < lines.length) {
				output += ' ';
			}
			prevLine = line;
		});
		return this.normalizeFontStyles(output);
	}

	private mergeStyleLines(prevLine: LineInfo, line: LineInfo, output: any) {
		if (!prevLine) {
			return;
		}

		if (line.lineBreak) {
			return;
		}

		if (prevLine.lastWordStyle && prevLine.lastWordStyle === line.firstWordStyle) {
			const end = output.paragraphOutput.length - (prevLine.lastWordStyle.length + 1);
			output.paragraphOutput = output.paragraphOutput.slice(0, end) + ' ';
			output.lineOutput = output.lineOutput.slice(prevLine.lastWordStyle.length);
		}
	}

	private normalizeFontStyles(input: string): string {
		['*** ***', '** **', '* *'].forEach(style => input.split(style).join(''));
		return input;
	}

	private lineToMarkDown(line: Line) {
		const words: Word[] = line.content;
		let biWordsIdx: number[][] = Array<number[]>(1).fill([]);
		let bWordsIdx: number[][] = Array<number[]>(1).fill([]);
		let iWordsIdx: number[][] = Array<number[]>(1).fill([]);
		words.forEach((w, index) => {
			const style = this.wordStyle(w);
			if (style === '***') {
				biWordsIdx[0].push(index);
			} else if (style === '**') {
				bWordsIdx[0].push(index);
			} else if (style === '*') {
				iWordsIdx[0].push(index);
			}
		});
		biWordsIdx = utils.groupConsecutiveNumbersInArray(biWordsIdx[0]).filter(p => p.length !== 0);
		bWordsIdx = utils.groupConsecutiveNumbersInArray(bWordsIdx[0]).filter(p => p.length !== 0);
		iWordsIdx = utils.groupConsecutiveNumbersInArray(iWordsIdx[0]).filter(p => p.length !== 0);

		// prepare the result
		const result: string[] = words.map(w => w.toMarkDown());

		biWordsIdx.forEach(idGroup => {
			result[idGroup[0]] = '***' + result[idGroup[0]];
			result[idGroup[idGroup.length - 1]] = result[idGroup[idGroup.length - 1]] + '***';
		});

		bWordsIdx.forEach(idGroup => {
			result[idGroup[0]] = '**' + result[idGroup[0]];
			result[idGroup[idGroup.length - 1]] = result[idGroup[idGroup.length - 1]] + '**';
		});

		iWordsIdx.forEach(idGroup => {
			result[idGroup[0]] = '*' + result[idGroup[0]];
			result[idGroup[idGroup.length - 1]] = result[idGroup[idGroup.length - 1]] + '*';
		});

		return result
			.map(w => w.trim())
			.reduce((w1, w2) => w1 + ' ' + w2, '')
			.trim();
	}

	/**
	 * Get every words from the paragraph in a flat array.
	 */
	public getWords(): Word[] {
		return this.content.map(l => l.content).reduce((a, b) => [...a, ...b]);
	}

	private getLinesInfo(): LineInfo[] {
		return this.content.map((l, index) => {
			return {
				line: l,
				lineBreak: this.isLineBreak(index),
				firstWordStyle: this.wordStyle(l.content[0]),
				lastWordStyle: this.wordStyle(l.content[l.content.length - 1]),
			};
		});
	}

	private wordStyle(word: Word): string {
		if (word.font.isItalic && word.font.weight === 'bold') {
			return '***';
		} else if (!word.font.isItalic && word.font.weight === 'bold') {
			return '**';
		} else if (word.font.isItalic && word.font.weight !== 'bold') {
			return '*';
		}
		return null;
	}

	private isLineBreak(index: number): Boolean {
		if (index + 1 >= this.content.length) {
			return false;
		}
		const line: Line = this.content[index];
		const nextLine: Line = this.content[index + 1];
		const availableSpace = this.width - line.width;
		return availableSpace >= nextLine.content[0].width;
	}
	/**
	 * Get every words that compose a paragrah's substring.
	 * @param start Begining of the string
	 * @param length Length of the string
	 */
	public findWordsFromParagraphSubstring(start: number, length: number): Word[] {
		const allWords: Word[] = this.getWords();

		let startIndex: number = 0;
		for (let i = 0; i < allWords.length; i++) {
			if (
				allWords
					.slice(0, i + 1)
					.map(w => w.toString())
					.join(' ').length >= start
			) {
				startIndex = i;
				break;
			}
		}

		let endIndex: number = 0;
		for (let i = startIndex; i < allWords.length; i++) {
			if (
				allWords
					.slice(startIndex, i + 1)
					.map(w => w.toString())
					.join(' ').length >= length
			) {
				endIndex = i;
				break;
			}
		}

		return allWords.slice(startIndex, endIndex + 1);
	}

	/**
	 * Returns the main font of the paragraph using a basket + voting mechanism. The most used font will be returned
	 * as a valid Font object.
	 */
	public getMainFont(): Font | undefined {
		const fonts: Font[] = this.content
			.map((line: Line) => {
				return line.content.map((word: Word) => word.font);
			})
			.reduce((a, b) => a.concat(b), []);

		const baskets: Font[][] = [];

		fonts.forEach((font: Font) => {
			let basketFound: boolean = false;
			baskets.forEach((basket: Font[]) => {
				if (basket.length > 0 && basket[0].isEqual(font)) {
					basket.push(font);
					basketFound = true;
				}
			});

			if (!basketFound) {
				baskets.push([font]);
			}
		});

		baskets.sort((a, b) => {
			return b.length - a.length;
		});

		if (baskets.length > 0 && baskets[0].length > 0) {
			return baskets[0][0];
		} else {
			logger.debug(`No font found for paragraph id ${this.id}`);
			return undefined;
		}
	}

	/**
	 * Getter content
	 * @return {Line[]}
	 */
	public get content(): Line[] {
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
	 * Setter content
	 * @param {Line[]} value
	 */
	public set content(value: Line[]) {
		this._content = value;
	}

	/**
	 * Setter language
	 * @param {string} value
	 */
	public set language(value: string) {
		this._language = value;
	}
}
