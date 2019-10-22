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
import { ReadingOrderDetectionModule } from '../ReadingOrderDetectionModule/ReadingOrderDetectionModule';
import * as defaultConfig from './defaultConfig.json';

interface Options {
	lineHeightUncertainty?: {
		value: number;
		range: {
			min: number;
			max: number;
			step: number;
		};
	};
	topUncertainty?: {
		value: number;
		range: {
			min: number;
			max: number;
			step: number;
		};
	};
	maximumSpaceBetweenWords?: {
		value: number;
		range: {
			min: number;
			max: number;
		};
	};
	mergeTableElements?: {
		value: number;
	};
}

const defaultOptions = (defaultConfig as any) as Options;

/**
 * Stability: Stable
 * Merge text block that are side by side to make lines.
 */
export class WordsToLineModule extends Module<Options> {
	public static moduleName = 'words-to-line';
	public static dependencies = [ReadingOrderDetectionModule];

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
				.sort(utils.sortElementsByOrder);

			const otherPageElements: Element[] = page.elements.filter(
				element => !(element instanceof Word),
			);
			const otherElements: Element[] = this.joinWordsInElements(otherPageElements, opt);

			const alignedPageWords: Word[][] = this.joinAlignedWords(words, opt);
			const texts: Text[] = this.mergeWordsIntoTexts(alignedPageWords);

			// FIXME I think this will remove any chars left in the page
			page.elements = otherElements.concat(texts);

			return page;
		});

		return doc;
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

	private joinAlignedWords(words: Word[], opt: Options): Word[][] {
		const toBeMerged: Word[][] = [];
		for (let i = 0; i < words.length; i++) {
			const first = words[i];
			const mergeGroup: Word[] = [first];

			for (let j = i + 1; j < words.length; j++) {
				const prev = words[j - 1];
				const curr = words[j];

				if (
					Math.abs(prev.top - curr.top) <= prev.height * opt.topUncertainty.value &&
					Math.abs(prev.height - curr.height) <=
						prev.height * (1 + opt.lineHeightUncertainty.value) &&
					curr.left - (prev.left + prev.width) <= opt.maximumSpaceBetweenWords.value &&
					// FIXME element cannot be a Heading since it is a Word
					// (prev instanceof Heading) === (curr instanceof Heading) &&
					prev.properties.isPageNumber === curr.properties.isPageNumber
					// TODO: handle table elements: (opt.mergeTableElements.value
					// || (!prev.metadata.tableElement && !curr.metadata.tableElement))
				) {
					mergeGroup.push(curr);
					i++;
				} else {
					break;
				}
			}

			toBeMerged.push(mergeGroup);
		}
		return toBeMerged;
	}
}
