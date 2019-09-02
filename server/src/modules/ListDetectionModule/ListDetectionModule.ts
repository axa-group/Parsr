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

import { BoundingBox, Document, List, Paragraph } from '../../types/DocumentRepresentation';
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
		logger.info(`Starting list detection..`);

		// declare containers
		let ordered: Paragraph[] = [];
		let unordered: Paragraph[] = [];

		// populate with candidates using detection criteria algo
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
		const orderedListGroups: Paragraph[][] = groupParasByConsecutiveGroups(ordered);
		const unorderedListGroups: Paragraph[][] = groupParasByConsecutiveGroups(unordered);

		// final lists
		const orderedLists: List[] = orderedListGroups.map(
			pg => new List(BoundingBox.merge(pg.map(p => p.box)), pg, true),
		);
		const unorderedLists: List[] = unorderedListGroups.map(
			pg => new List(BoundingBox.merge(pg.map(p => p.box)), pg, false),
		);

		// log counts as debug
		logger.debug(
			`Ordered lists detected: ${orderedLists.length} of lengths ${orderedLists.map(
				l => l.content.length,
			)}`,
		);
		logger.debug(
			`Unordered lists detected: ${unorderedLists.length} of lengths ${unorderedLists.map(
				l => l.content.length,
			)}`,
		);

		// TODO: replace existing paragraphs and add the lists to the document
		// -- here

		logger.info(`Finished list detection.`);
		return doc;

		function groupParasByConsecutiveGroups(paras: Paragraph[]): Paragraph[][] {
			paras.sort((a, b) => a.properties.order - b.properties.order);
			const ret: Paragraph[][] = [];
			if (!paras.length) {
				return ret;
			}
			let ixf = 0;
			for (let ixc = 1; ixc < paras.length; ixc += 1) {
				if (paras[ixc].properties.order !== paras[ixc - 1].properties.order + 1) {
					ret.push(paras.slice(ixf, ixc));
					ixf = ixc;
				}
			}
			ret.push(paras.slice(ixf, paras.length));
			return ret.filter(p => p.length > 1); // return paragraph groups of length > 1
		}

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
