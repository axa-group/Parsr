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
		const orderedListGroups: Paragraph[][] = groupParasByConsecutiveGroups(ordered).filter(
			p => p.length > 1,
		); // return paragraph groups of length > 1 -- TODO: make this an argument
		const unorderedListGroups: Paragraph[][] = groupParasByConsecutiveGroups(unordered).filter(
			p => p.length > 1,
		); // return paragraph groups of length > 1 -- TODO: make this an argument

		// final lists
		logger.debug(`Making list objects and replacing original paragraphs inside the document...`);
		const orderedLists: List[] = orderedListGroups.map(paras => {
			const list: List = new List(BoundingBox.merge(paras.map(p => p.box)), paras, true);
			replaceParagraphsByListInDocument(list, paras);
			return list;
		});
		const unorderedLists: List[] = unorderedListGroups.map(paras => {
			const list: List = new List(BoundingBox.merge(paras.map(p => p.box)), paras, true);
			replaceParagraphsByListInDocument(list, paras);
			return list;
		});

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

		// done
		logger.info(`Finished list detection.`);
		return doc;

		// replace existing paragraphs and add the lists to the document
		function replaceParagraphsByListInDocument(list: List, paragraphs: Paragraph[]) {
			// use the order of the first paragraph for the list
			list.properties.order = paragraphs[0].properties.order;

			logger.debug(
				`replacing element order #${list.properties.order}, a list of size ${
					list.content.length
				}, initial element count: ${[...doc.pages.map(p => p.elements.length)].reduce(
					(a, b) => a + b,
					0,
				)}`,
			);

			// replace the first paragraph with the list
			for (const page of doc.pages) {
				if (page.elements.includes(paragraphs[0])) {
					page.elements.splice(1, page.elements.indexOf(paragraphs[0]), list);
					break;
				}
			}

			// save the highest order information from the paragraph
			const orderDelta: number = paragraphs
				.slice(1, paragraphs.length)
				.map(p => p.properties.order)
				.sort((a, b) => b - a)[0];

			// remove the other paragraphs
			if (paragraphs.length > 1) {
				for (let i = 1; i < paragraphs.length; i++) {
					const para = paragraphs[i];
					doc.pages
						.filter(page => page.elements.includes(para))
						.forEach(page => {
							page.elements.splice(page.elements.indexOf(para), 1);
						});
				}
			}

			// delta back the order number from all succeeding elements in the document
			doc.pages.forEach(page => {
				page.elements
					.filter(elem => elem.properties.order > orderDelta)
					.forEach(e => {
						e.properties.order = e.properties.order - orderDelta;
					});
			});

			// debug output
			logger.debug(
				`done. total elements at the end ${[...doc.pages.map(p => p.elements.length)].reduce(
					(a, b) => a + b,
					0,
				)}`,
			);
		}

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
			return ret;
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
