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

import {
	// BoundingBox,
	Document,
	// List,
	Paragraph,
	// Text,
} from '../../types/DocumentRepresentation';
import * as utils from '../../utils';
import logger from '../../utils/Logger';
import { Module } from '../Module';

// TODO Handle ordered list.
/**
 * Stability: Unstable
 * Merge lines containing bullet points characters and tag them accordingly.
 * Doesn't handle ordered list (with bullet such as `1)`, `I.`, `a)`, `i.`, etc.) yet.
 */
export class ListDetectionModule extends Module {
	public static moduleName = 'list-detection';

	public main(doc: Document): Document {
		// const maxSpace = 60; // space width between bullet and text in px
		// const maxBulletLength = 3;
		logger.info(`Starting list detection..`);

		let ordered: Paragraph[] = [];
		let unordered: Paragraph[] = [];
		doc.pages.forEach(page => {
			ordered = [
				...ordered,
				...page
					.getElementsOfType<Paragraph>(Paragraph)
					.filter(para => detectKindOfListItem(para) === 'ordered'),
			];
			unordered = [
				...unordered,
				...page
					.getElementsOfType<Paragraph>(Paragraph)
					.filter(para => detectKindOfListItem(para) === 'unordered'),
			];
		});

		// sort detected positives in their reading order
		ordered.sort((a, b) => a.properties.order - b.properties.order);
		unordered.sort((a, b) => a.properties.order - b.properties.order);

		logger.debug(`--> ordered paras: ${ordered.map(o => '|||' + o.toString())}`);
		logger.debug(`--> unordered paras: ${unordered.map(o => '|||' + o.toString())}`);

		logger.info(`Finished list detection.`);
		return doc;

		// function createNewList(paragraphs: Paragraph[], isOrdered: boolean): List {
		// 	return new List(BoundingBox.merge([...paragraphs.map(p => p.box)]), paragraphs, isOrdered);
		// }

		// function addItemToList(existingList: List, paragraph: Paragraph) {
		// 	existingList.addParagraph(paragraph);
		// }

		function detectKindOfListItem(paragraph: Paragraph): string {
			let listType: string = 'none';
			if (paragraph.content.length !== 0) {
				if (utils.isBullet(paragraph)) {
					listType = 'unordered';
				} else if (utils.isNumbering(paragraph)) {
					listType = 'ordered';
				}
			}
			return listType;
		}

		// function isAligned(bullet: Text, text: Text): boolean {
		// 	return (
		// 		bullet.left + bullet.width + maxSpace >= text.left &&
		// 		bullet.left < text.left + text.width &&
		// 		((bullet.top <= text.top && bullet.top + bullet.height >= text.top) ||
		// 			(bullet.top >= text.top && bullet.top <= text.top + text.height))
		// 	);
		// }
	}
}
