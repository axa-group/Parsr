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

import { BoundingBox, Document, Element, Line, Text, Word } from '../types/DocumentRepresentation';
import * as utils from '../utils';
import logger from '../utils/Logger';
import { Module } from './Module';
import { ReadingOrderDetectionModule } from './ReadingOrderDetectionModule';

interface Options {
	lineHeightUncertainty?: number;
	topUncertainty?: number;
	maximumSpaceBetweenWords?: number;
	mergeTableElements?: boolean;
}

const defaultOptions: Options = {
	lineHeightUncertainty: 1.2, // proportion
	topUncertainty: 0.4, // proportion
	maximumSpaceBetweenWords: 100, // value in px
	mergeTableElements: false,
};

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
			const toBeMerged: Word[][] = [];

			if (page.getElementsOfType<Line>(Line).length > 0) {
				logger.warn('Warning: this page already has some line in it. Not performing line merge.');
				return page;
			}

			const words: Word[] = page
				.getElementsOfType<Word>(Word)
				.filter(Element.hasBoundingBox)
				.sort(utils.sortElementsByOrder);
			const otherElements: Element[] = page.elements.filter(
				element => !(element instanceof Word) || !words.includes(element),
			);

			for (let i = 0; i < words.length; i++) {
				const first = words[i];
				const mergeGroup: Word[] = [first];

				for (let j = i + 1; j < words.length; j++) {
					const prev = words[j - 1];
					const curr = words[j];

					if (
						Math.abs(prev.top - curr.top) <= prev.height * opt.topUncertainty &&
						Math.abs(prev.height - curr.height) <= prev.height * opt.lineHeightUncertainty &&
						curr.left - (prev.left + prev.width) <= opt.maximumSpaceBetweenWords &&
						// FIXME element cannot be a Heading since it is a Word
						// (prev instanceof Heading) === (curr instanceof Heading) &&
						prev.properties.isPageNumber === curr.properties.isPageNumber
						// TODO: handle table elements: (opt.mergeTableElements
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

			const texts: Text[] = [];
			let newOrder = 0;

			toBeMerged.forEach((group: Word[]) => {
				const line: Line = utils.mergeElements<Word, Line>(
					new Line(new BoundingBox(0, 0, 0, 0)),
					...group,
				);
				line.properties.order = newOrder++;
				texts.push(line);
			});

			// FIXME I think this will remove any chars left in the page
			page.elements = otherElements.concat(texts);

			return page;
		});

		return doc;
	}
}
