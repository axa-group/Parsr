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

import { Document, Page, Text, Word } from '../../types/DocumentRepresentation';
import * as utils from '../../utils';
import logger from '../../utils/Logger';
import { Module } from '../Module';
import * as defaultConfig from './defaultConfig.json';

interface Options {
	minOverlap?: {
		value: number;
		range: {
			min: number;
			max: number;
		};
	};
	minimumPages?: {
		value: number;
	};
}

const defaultOptions = (defaultConfig as any) as Options;

/**
 * Blocks that have the same bounding boxes on a lot of pages
 * With a very similar content
 * With the same font
 * TODO Idea split large document every 100 pages or so.
 * Stability: Unstable
 * Detect items that are redundant on a certain amount of pages (i.e. 20% of every pages has the same element).
 * Also remove duplicated elements.
 */

export class RedundancyDetectionModule extends Module<Options> {
	public static moduleName = 'redundancy-detection';

	constructor(options?: Options) {
		super(options, defaultOptions);
	}

	public main(doc: Document): Document {
		doc.pages.forEach(page => {
			const groups: Text[][] = this.regroupTextsByLocation(page.getElementsOfType(Word));
			this.removeDuplicateElements(page, groups.filter(g => g.length !== 1));
		});

		return doc;
	}

	// FIXME this function is super slow... (36s on t6.pdf)
	private regroupTextsByLocation(texts: Text[]): Text[][] {
		const groups: Text[][] = [];

		texts.forEach(text => {
			for (const group of groups) {
				if (utils.isAlignedAndOverlapVertically(group.concat(text))) {
					group.push(text);
					return;
				}
			}
			groups.push([text]);
		});

		return groups;
	}

	/**
	 * Keeps one from a group of texts, removes the others.
	 * TODO: promote candidates which will favor a better wordsToLine performance later on
	 * @param page the page in question
	 * @param groups groups of text from which only one is to be kept
	 */
	private removeDuplicateElements(page: Page, groups: Text[][]) {
		groups.forEach(group => {
			const firstText: Text = group[0];
			logger.debug(
				`${group.length} duplicate words with text ${firstText.toString()} found on page ${
					page.pageNumber
				}`,
			);
			group
				.slice(1, group.length)
				.filter(e => this.isDuplicate(e, firstText))
				.forEach(e => page.removeElementById(e.id));
		});
	}

	private isDuplicate(elem1: Text, elem2: Text): boolean {
		let isDuplicate: boolean;
		// TODO check same font ('font' in elem1 && 'font' in elem2 && elem1['font'].isEqual(elem2['font']))
		// coordinates of the intersection rectangle
		const intLeft: number = Math.max(elem1.left, elem2.left);
		const intRight: number = Math.min(elem1.right, elem2.right);
		const intBottom: number = Math.min(elem1.bottom, elem2.bottom);
		const intTop: number = Math.max(elem1.top, elem2.top);

		if (intLeft < intRight && intBottom < intTop) {
			isDuplicate = false; // no intersection at all
		} else {
			const elem1Area: number = elem1.height * elem1.width;
			const elem2Area: number = elem2.height * elem2.width;
			const intArea: number = (intRight - intLeft) * (intBottom - intTop);
			const commonArea: number = elem1Area + elem2Area - intArea;

			isDuplicate = intArea / commonArea >= this.options.minOverlap.value;
		}

		return isDuplicate;
	}
}
