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

import {
	BoundingBox,
	Document,
	Element,
	Line,
	Text,
	Word,
} from '../../types/DocumentRepresentation';
import * as utils from '../../utils';
import logger from '../../utils/Logger';
import { Module } from '../Module';
import * as defaultConfig from './defaultConfig.json';

interface Options {
	topUncertainty?: {
		value: number;
		range: {
			min: number;
			max: number;
		};
	};
	maxAverageSpaceCount?: {
		value: number;
		range: {
			min: number;
			max: number;
		};
	};
	maxSpacesBetweenWords?: {
		value: number;
		range: {
			min: number;
			max: number;
		};
	};
}

const defaultOptions = (defaultConfig as any) as Options;

/**
 * Stability: Stable
 * Merge text block that are side by side to make lines.
 */
export class WordsToLineModuleNew extends Module<Options> {
	public static moduleName = 'words-to-line-new';

	constructor(options?: Options) {
		super(options, defaultOptions);
	}

	public main(doc: Document): Document {
		const opt: Options = {};
		Object.assign(opt, defaultOptions, this.options);

		doc.pages = doc.pages.map(page => {
			if (page.getElementsOfType<Line>(Line).length > 0) {
				logger.warn('Warning: this page already has some line in it. Not performing line merge.');
				return page;
			}

			const words: Word[] = page
				.getElementsOfType<Word>(Word, false)
				.filter(Element.hasBoundingBox)
				.sort(this.sortWordsByTopLeftPosition);

			const otherPageElements: Element[] = page.elements.filter(
				element => !(element instanceof Word),
			);
			const otherElements: Element[] = this.joinWordsInElements(otherPageElements, opt);

			const alignedPageWords: Word[][] = this.joinAlignedWords(words, opt);
			const texts: Text[] = this.mergeWordsIntoTexts(alignedPageWords);

			page.elements = otherElements.concat(texts);

			return page;
		});

		return doc;
	}

	/*
		sorts the words by top-left order, without considering columns or any special reading method.
		if two words have a minimal difference in their top positions, I will assume that they are at the same line
	*/
	private sortWordsByTopLeftPosition(wordA: Word, wordB: Word): number {
		const verticalDiff = Math.abs(wordA.box.top - wordB.box.top);

		if (verticalDiff > wordA.box.height * 0.2) {
			return wordA.box.top - wordB.box.top;
		}
		return wordB.box.left - wordA.box.left;
	}

	private joinWordsInElements(elements: Element[], options: Options) {
		elements.forEach(element => {
			this.joinWordsFromElement(element, options);
		});
		return elements;
	}

	private joinWordsFromElement(element: Element, options: Options): Word {
		if (element instanceof Word) {
			return element;
		} else if (
			element.content &&
			typeof element.content !== 'string' &&
			element.content.length !== 0
		) {
			const containedWords: Word[] = [];
			element.content.forEach(el => {
				const containedWord = this.joinWordsFromElement(el, options);
				if (containedWord) {
					containedWords.push(containedWord);
				}
			});
			if (containedWords.length > 0) {
				this.updateElementContents(element, containedWords, options);
			}
		}
		return null;
	}

	private updateElementContents(element: Element, words: Word[], options: Options) {
		const joinedWords = this.joinAlignedWords(words, options);
		const elementContent = this.mergeWordsIntoTexts(joinedWords);
		element.content = elementContent;
	}

	private mergeWordsIntoTexts(alignedWords: Word[][]): Text[] {
		const texts: Text[] = [];
		let newOrder = 0;
		alignedWords.forEach((group: Word[]) => {
			const line: Line = utils.mergeElements<Word, Line>(
				new Line(new BoundingBox(0, 0, 0, 0)),
				...group,
			);
			line.properties.order = newOrder++;
			texts.push(line);
		});
		return texts;
	}

	/*
		groups together the words that are at the same vertical position in a page and near each other
	*/
	private joinAlignedWords(words: Word[], options: Options): Word[][] {
		const lines: Word[][] = [];
		let line: Word[] = [];

		words.forEach((word, i) => {
			line.push(word);
			let nextWord = null;
			try {
				nextWord = words[i + 1];
			} catch (e) {
				/* empty */
			}

			if (
				!nextWord ||
				Math.abs(nextWord.box.top - word.box.top) > word.box.height * options.topUncertainty.value
			) {
				lines.push(line);
				line = [];
			}
		});
		return utils.flat(lines.map(l => this.splitSeparatedWords(l, options)));
	}

	/*
		Takes a line and tries to detect possible disconnected sentences based on word separation.
		Returns an array with the disconnected lines.
	*/
	private splitSeparatedWords(line: Word[], options: Options): Word[][] {
		const spacesBetweenWords: number[] = line
			.map((word, index, words) => {
				if (words.length > index + 1) {
					const nextWord = words[index + 1];
					return word.box.left < nextWord.box.left
						? nextWord.box.left - (word.box.left + word.box.width) // left to right reading
						: word.box.left - (nextWord.box.left + nextWord.box.width); // right to left reading
				}
				return null;
			})
			.filter(w => !!w);

		const averageSpaceForLine: number = spacesBetweenWords.reduce(
			(acc, space) => acc + space / spacesBetweenWords.length,
			0,
		);

		const separatedLines: Word[][] = [];
		let newLine: Word[] = [];
		line.forEach((word, i) => {
			newLine.push(word);
			if (
				spacesBetweenWords[i] >
				Math.min(
					averageSpaceForLine * options.maxAverageSpaceCount.value,
					options.maxSpacesBetweenWords.value,
				)
			) {
				separatedLines.push(Object.assign([], newLine));
				newLine = [];
			}
		});
		separatedLines.push(newLine);

		return separatedLines;
	}
}
