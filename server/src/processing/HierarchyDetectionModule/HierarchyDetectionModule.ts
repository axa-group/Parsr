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

import { Document, Element, Heading, List, Paragraph } from '../../types/DocumentRepresentation';
import * as utils from '../../utils';
import { Module } from '../Module';

type Parent = Heading | Paragraph | List;

/**
 *
 * Parents may be:
 * 	- Headings
 * 	- Paragraphs before List
 * 	- List before a child List
 * @param doc
 */

export class HierarchyDetectionModule extends Module {
	public static moduleName = 'hierarchy-detection';

	public main(doc: Document): Document {
		const parents: Parent[] = [];
		let previousElement: Parent = null;
		let currentHeadingLevel: number = -1;

		doc.pages.forEach(page => {
			// TODO Remove when Cleaner modules have proper dependencies
			page.elements.sort(utils.sortElementsByOrder);
			page.elements.forEach((element: Element) => {
				if (element instanceof Heading) {
					if (element.level > currentHeadingLevel) {
						associate(element, getLastHeading());
					} else {
						removeParentsToHeading(element.level);
					}

					parents.push(element);
					currentHeadingLevel = element.level;
					previousElement = element;
				} else if (element instanceof List) {
					if (previousElement instanceof List) {
						if (element.level > previousElement.level) {
							parents.push(previousElement);
							associate(element, previousElement);
						} else {
							removeListsFromParents(element.level);
							associate(element, getLastParent());
						}
					} else if (previousElement instanceof Heading) {
						associate(element, previousElement);
					} else if (previousElement instanceof Paragraph) {
						parents.push(previousElement);
						associate(element, previousElement);
					}

					previousElement = element;
				} else if (element instanceof Paragraph) {
					associate(element, getLastParent());
					previousElement = element;
				} else {
					associate(element, getLastParent());
				}

				if (!(element instanceof List)) {
					removeParentsToHeading();
				}
			});
		});

		return doc;

		function getLastParent(): Parent | void {
			return parents.length > 0 ? parents[parents.length - 1] : null;
		}

		function getLastHeading(): Heading | void {
			for (const parent of parents) {
				if (parent instanceof Heading) {
					return parent;
				} else {
					return null;
				}
			}
		}

		function associate(child: Element | void, parent: Parent | void) {
			if (child && parent) {
				child.parent = parent;
				parent.children.push(child);
			}
		}

		/**
		 * Remove parents one by one until the level is strictly lower then level.
		 * @param headingLevel
		 */
		function removeParentsToHeading(headingLevel: number = Infinity): void {
			let i = parents.length - 1;

			while (i >= 0) {
				const parent: Parent = parents[i];

				if (!(parent instanceof Heading) || parent.level >= headingLevel) {
					parents.pop();
				} else {
					return;
				}

				i--;
			}
		}

		function removeListsFromParents(listLevel: number = -1): void {
			let i = parents.length - 1;

			while (i >= 0) {
				const parent: Parent = parents[i];

				if (!(parent instanceof List) || parent.level < listLevel) {
					return;
				} else {
					parents.pop();
				}

				i--;
			}
		}
	}
}
