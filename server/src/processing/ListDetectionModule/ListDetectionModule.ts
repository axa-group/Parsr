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
	Heading,
	Line,
	List,
	Page,
	Paragraph,
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
		logger.info(`Starting list detection..`);

		doc.pages.forEach(page => {
			const rogueLines: Line[] = [];
			const finalLists: List[] = [];
			const paras: Paragraph[] = page
				.getElementsOfType<Paragraph>(Paragraph, false)
				.filter(para => !(para instanceof Heading));
			paras.forEach(para => {
				const orderedIdx: number[] = [...Array(para.content.length).keys()]
					.filter(i => para.content[i].content.length > 1)
					.filter(i => detectKindOfListItem(para.content[i]) === 'ordered');

				if (orderedIdx.includes(0)) {
					const orderedLineGroup: Line[][] = [];
					for (let i = 0; i !== orderedIdx.length; ++i) {
						let to: number;
						let from: number;
						from = orderedIdx[i];
						if (i === orderedIdx.length - 1) {
							to = para.content.length;
						} else {
							to = orderedIdx[i + 1];
						}
						orderedLineGroup.push(utils.range(from, to - from).map((x: number) => para.content[x]));
					}
					rogueLines.concat(
						...[...Array(para.content.length).keys()]
							.filter(i => [].concat.apply([], orderedLineGroup).includes(i))
							.map(i => para.content[i]),
					);
					const listParas: Paragraph[] = orderedLineGroup.map(
						g => new Paragraph(BoundingBox.merge(g.map(l => l.box)), g),
					);
					finalLists.push(new List(BoundingBox.merge(listParas.map(p => p.box)), listParas, true));
				}

				const unorderedIdx: number[] = [...Array(para.content.length).keys()]
					.filter(i => para.content[i].content.length > 1)
					.filter(i => detectKindOfListItem(para.content[i]) === 'unordered');

				if (unorderedIdx.includes(0)) {
					const unorderedLineGroup: Line[][] = [];
					for (let i = 0; i !== unorderedIdx.length; ++i) {
						let to: number;
						let from: number;
						from = orderedIdx[i];
						if (i === unorderedIdx.length - 1) {
							to = para.content.length;
						} else {
							to = unorderedIdx[i + 1];
						}
						unorderedLineGroup.push(
							utils.range(from, to - from).map((x: number) => para.content[x]),
						);
					}
					rogueLines.concat(
						...[...Array(para.content.length).keys()]
							.filter(i => [].concat.apply([], unorderedLineGroup).includes(i))
							.map(i => para.content[i]),
					);
					const listParas: Paragraph[] = unorderedLineGroup.map(
						g => new Paragraph(BoundingBox.merge(g.map(l => l.box)), g),
					);
					finalLists.push(new List(BoundingBox.merge(listParas.map(p => p.box)), listParas, false));
				}
				if (rogueLines.length > 0) {
					logger.debug(
						`rogue lines leftover are : \n${groupLinesByConsecutiveGroups(rogueLines)
							.map(g => g.map(l => l.toString()).join('\n'))
							.join('\n\n\n')}
						`,
					);
					// add these as new paragraphs using mergeLinesIntoParagraphs
				} else {
					// remove paragraph
					page.elements = getElementsExcept(page, [para]);
				}
			});
			logger.debug(
				`${finalLists.length} new lists: ${finalLists.map(l =>
					utils.prettifyObject(l.content.map(p => p.toString() + '\n')),
				)}`,
			);
			page.elements.push(...finalLists);
		});

		logger.info(`Finished list detection.`);
		return doc;

		// function mergeLinesIntoParagraphs(joinedLines: Line[][]): Paragraph[] {
		// 	return joinedLines.map((group: Line[]) => {
		// 		const paragraph: Paragraph = utils.mergeElements<Line, Paragraph>(
		// 			new Paragraph(BoundingBox.merge(group.map((l: Line) => l.box))),
		// 			...group,
		// 		);
		// 		paragraph.properties.order = group[0].properties.order;
		// 		return paragraph;
		// 	});
		// }

		function getElementsExcept(page: Page, excluding: Paragraph[]): Element[] {
			return page.elements.filter(
				element => !(element instanceof Paragraph) || !excluding.includes(element),
			);
		}

		function groupLinesByConsecutiveGroups(paras: Line[]): Line[][] {
			paras.sort((a, b) => a.properties.order - b.properties.order);
			const ret: Line[][] = [];
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

		function detectKindOfListItem(line: Line): string {
			let listType: string = 'none';
			if (line.content.length !== 0) {
				if (utils.isBullet(line)) {
					listType = 'unordered';
				} else if (utils.isNumbering(line)) {
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
