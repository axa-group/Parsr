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

import { Document, Page, Text } from '../../types/DocumentRepresentation';
import * as utils from '../../utils';
import { Module } from '../Module';

interface Options {
	percentageOfRedondancy?: number;
	minimumPages?: number;
}

const defaultOptions: Options = {
	percentageOfRedondancy: 0.5,
	minimumPages: 6,
};

// TODO Idea split large document every 100 pages or so.
/**
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
		// Blocks that have the same bounding boxes on a lot of pages
		// With a very similar content
		// With the same font

		// let texts: Text[] = doc.pages.map(page => page.getTexts()).reduce((a, b) => a.concat(b), []);
		doc.pages.forEach(page => {
			const groups: Text[][] = regroupTextsByLocation(page.getTexts());
			removeDuplicateElements(page, groups);
			// let redundants: Text[][] = tagRedundant(groups);
		});

		return doc;

		// FIXME this function is super slow... (36s on t6.pdf)
		function regroupTextsByLocation(texts: Text[]): Text[][] {
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

		function removeDuplicateElements(page: Page, groups: Text[][]) {
			groups.forEach(group => {
				const firstText: Text = group[0];

				for (let i = 1; i < group.length; i++) {
					if (isDuplicate(group[i], firstText)) {
						const index: number = page.elements.indexOf(group[i], 0);

						if (index > -1) {
							page.elements.splice(index, 1);
						}
					}
				}
			});
		}

		function isDuplicate(elem1: Text, elem2: Text): boolean {
			return (
				elem1.toString() === elem2.toString() &&
				elem1.left === elem2.left &&
				elem1.top === elem2.top &&
				elem1.width === elem2.width &&
				elem1.height === elem2.height
				// TODO check same font ('font' in elem1 && 'font' in elem2 && elem1['font'].isEqual(elem2['font']))
			);
		}

		/*
		function tagRedundant(groups: Text[][]): Text[][] {
			const redundant: Text[][] = [];
			groups.forEach(group => {
				if (
					group.length > doc.pages.length * opt.percentageOfRedondancy &&
					doc.pages.length > opt.minimumPages
				) {
					group.forEach(t => (t.properties.isRedundant = true));
					redundant.push(group);
				}
			});

			return redundant;
		}
		*/
	}
}
