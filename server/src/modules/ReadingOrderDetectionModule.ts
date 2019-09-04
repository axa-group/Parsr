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

import { Document, Element, Page } from '../types/DocumentRepresentation';
import * as utils from '../utils';
import { Module } from './Module';

// TODO Handle rtl (right-to-left) languages
/**
 * Stability: Stable
 * Detect the reading order of the document.
 * Add a property order tag to every text block: `{ 'order': number }`
 */

interface Options {
	minWidth?: number;
}

const defaultOptions: Options = {
	minWidth: 5,
};

export class ReadingOrderDetectionModule extends Module<Options> {
	public static moduleName = 'reading-order-detection';
	private order: number = 0;

	constructor(options?: Options) {
		super(options, defaultOptions);
	}

	public main(doc: Document): Document {
		doc.pages = doc.pages.map((page: Page) => {
			// FIXME Hotfix because this algo bugs with floating point number
			const elements: Element[] = page.elements.filter(Element.hasBoundingBox);

			this.order = 0;
			this.process(elements);

			elements.sort(utils.sortElementsByOrder);
			page.elements = elements;

			return page;
		});

		return doc;
	}

	private process(elements: Element[]): void {
		const verticalGroups = this.findVerticalGroups(elements);
		this.processVerticalGroups(verticalGroups);
	}

	private processVerticalGroups(groups: Element[][]): void {
		groups.forEach(group => {
			const horizontalGroups = this.findHorizontalGroups(group);
			const superHorizontalGroups = this.findHorizontalSuperGroups(horizontalGroups);
			this.processHorizontalGroups(superHorizontalGroups);
		});
	}

	// A "super group" is a set of horizontal groups with possible common vertical cuts
	private findHorizontalSuperGroups(groups: Element[][]): Element[][] {
		const superGroups: Element[][] = [];

		groups.forEach(group => {
			if (superGroups.length === 0) {
				superGroups.push(group);
			} else {
				const curSuperGroup: Element[] = superGroups[superGroups.length - 1];
				const commonVerticalGroups = this.findVerticalGroups([...curSuperGroup, ...group]);
				if (commonVerticalGroups.length > 1) {
					superGroups[superGroups.length - 1] = [...curSuperGroup, ...group];
				} else {
					superGroups.push(group);
				}
			}
		});

		return superGroups;
	}

	private processHorizontalGroups(groups: Element[][]): void {
		if (groups.length > 1) {
			groups.forEach(group => {
				const verticalGroups = this.findVerticalGroups(group);
				this.processVerticalGroups(verticalGroups);
			});
		} else if (groups.length === 1) {
			this.processBlock(groups[0]);
		}
	}

	private processBlock(group: Element[]): void {
		group.sort((a, b) => {
			// Some line are not really flat. This fixes the uncertainty.
			if (Math.abs(a.top - b.top) > Math.min(a.height, b.height) / 2) {
				return a.top - b.top;
			} else {
				return a.left - b.left;
			}
		});

		group.forEach(element => {
			element.properties.order = this.order++;
		});
	}

	private findHorizontalGroups(elements: Element[]): Element[][] {
		const elementsGroups: Element[][] = [];
		let elementsRest: Element[] = elements;

		let bottommost: number = 0;
		let startGroup: number = 0;

		while (elementsRest.filter(e => e.top >= bottommost).length > 0) {
			elementsRest = elementsRest.filter(e => e.top >= bottommost);
			const elementsTopSides: number[] = elementsRest.map(e => e.top);

			elementsRest.sort((a, b) => a.top - b.top);
			const sortedTopElements: Element[] = elementsRest;

			startGroup = Math.min(...elementsTopSides.filter(top => top > bottommost));

			let group: Element[] = [sortedTopElements[0]];
			bottommost = sortedTopElements[0].bottom;
			let previousBottommost: number;

			// Eat every included elements before a blank
			do {
				previousBottommost = bottommost;

				elementsRest.forEach(e => {
					if (e.top <= bottommost && e.top >= startGroup && !group.includes(e)) {
						group.push(e);
					}
				});

				bottommost = Math.max(...group.map(e => e.bottom));
			} while (previousBottommost !== bottommost);

			elementsGroups.push(group);
			group = [];
		}

		return elementsGroups;
	}

	private findVerticalGroups(elements: Element[]): Element[][] {
		const elementsGroups: Element[][] = [];
		let elementsRest: Element[] = elements;

		let rightmost: number = 0;
		let startGroup: number = 0;

		while (elementsRest.filter(e => e.left > rightmost).length > 0) {
			elementsRest = elementsRest.filter(e => e.left > rightmost);
			const elementsLeftSides: number[] = elementsRest.map(e => e.left);

			elementsRest.sort((a, b) => a.left - b.left);
			const sortedLeftElements: Element[] = elementsRest;

			startGroup = Math.min(...elementsLeftSides.filter(left => left > rightmost));

			let group: Element[] = [sortedLeftElements[0]];
			rightmost = sortedLeftElements[0].right;
			let previousRightmost: number;

			// Eat every included elements before a blank
			do {
				previousRightmost = rightmost;

				elementsRest.forEach(e => {
					if (
						e.left <= rightmost + this.options.minWidth &&
						e.left >= startGroup &&
						!group.includes(e)
					) {
						group.push(e);
					}
				});

				rightmost = Math.max(...group.map(e => e.right));
			} while (previousRightmost !== rightmost);

			elementsGroups.push(group);
			group = [];
		}

		return elementsGroups;
	}
}
