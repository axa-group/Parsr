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

/**
 * Stability: Stable
 * Merge text block that are side by side to make lines.
 */
export class WordsToLineModuleNew extends Module {
	public static moduleName = 'words-to-line-new';

	public main(doc: Document): Document {
		doc.pages = doc.pages.map(page => {
			if (page.getElementsOfType<Line>(Line).length > 0) {
				logger.warn('Warning: this page already has some line in it. Not performing line merge.');
				return page;
			}

			const words: Word[] = page
				.getElementsOfType<Word>(Word, false)
				.filter(Element.hasBoundingBox)
				.sort(this.sortWordsByTopLeftPosition);

			// const otherPageElements: Element[] = page.elements.filter(
			// 	element => !(element instanceof Word),
			// );
			const otherElements: Element[] = []; // this.joinWordsInElements(otherPageElements);

			const alignedPageWords: Word[][] = this.joinAlignedWords(words);
			const texts: Text[] = this.mergeWordsIntoTexts(alignedPageWords);

			page.elements = otherElements.concat(texts);

			return page;
		});

		return doc;
	}

	// private joinWordsInElements(elements: Element[]) {
	// 	elements.forEach(element => {
	// 		this.joinWordsFromElement(element);
	// 	});
	// 	return elements;
	// }

	// private joinWordsFromElement(element: Element): Word {
	// 	if (element instanceof Word) {
	// 		return element;
	// 	} else if (
	// 		element.content &&
	// 		typeof element.content !== 'string' &&
	// 		element.content.length !== 0
	// 	) {
	// 		const containedWords: Word[] = [];
	// 		element.content.forEach(el => {
	// 			const containedWord = this.joinWordsFromElement(el);
	// 			if (containedWord) {
	// 				containedWords.push(containedWord);
	// 			}
	// 		});
	// 		if (containedWords.length > 0) {
	// 			this.updateElementContents(element, containedWords);
	// 		}
	// 	}
	// 	return null;
	// }

	// private updateElementContents(element: Element, words: Word[]) {
	// 	const joinedWords = this.joinAlignedWords(words);
	// 	const elementContent = this.mergeWordsIntoTexts(joinedWords);
	// 	element.content = elementContent;
	// }

	private sortWordsByTopLeftPosition(wordA: Word, wordB: Word): number {
		return wordA.box.top - wordB.box.top || wordB.box.left - wordB.box.left;
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
		groups together the words that are at the same vertical position in a page
	*/
	private joinAlignedWords(words: Word[]): Word[][] {
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

			if (!nextWord || Math.abs(nextWord.box.top - word.box.top) > word.box.height * 0.4) {
				lines.push(Object.assign([], line));
				line = [];
			}
		});
		return lines;
	}
}
