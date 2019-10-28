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
	//Element,
	Heading,
	Line,
	List,
	//Page,
	Paragraph,
	Text,
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
	/**
	 * Verifies if a string of text is a bullet point or not.
	 * @param text The input text to be checked.
	 * @returns true/false representing the result of the check.
	 */
	public static isBullet(text: Text): boolean {
		// Creates an string array with decimal codes from 9632 to 9727
		// See bullets in array --> https://www.w3schools.com/charsets/ref_utf_geometric.asp
		const bulletsChars: string[] = Array.apply(null, { length: 96 })
			.map(Number.call, Number)
			.map(x => Number(x + 9632))
			.map(x => String.fromCharCode(x))
			.concat(['', '•', '–', '·', '-', '→', '􏰀', '􏰀']);

		const bulletOr = bulletsChars.map(b => `\\${b}`).join('|') + ' ';
		// There are codes like '􏰀' = 56319 and othersther that are not valid for
		// .charCodeAt() and always return 63 represented as '?'
		// in this case we will consider as a bullet
		const unknownCode =
			text
				.toString()
				.trim()
				.charCodeAt(0) === 63;
		return new RegExp(`^(${bulletOr})`).test(text.toString().trim()) || unknownCode;
	}

	/**
	 * Verifies if a string of text is a numbered list item or not.
	 * @param text The input text to be checked.
	 * @returns true/false representing the result of the check.
	 */
	public static isNumbering(text: Text): boolean {
		const regex = /^\d+([\.\:\)])\ /;
		return regex.test(text.toString().trim());
	}

	public main(doc: Document): Document {
		logger.info(`Starting list detection..`);

		doc.pages.forEach(page => {
			let foundLists: List[] = [];
			let listFound: boolean = false;
			const paras: Paragraph[] = page
				.getElementsOfType<Paragraph>(Paragraph, false)
				.filter(para => !(para instanceof Heading));
			paras.forEach(para => {
				const orderedLists = this.createListFromParagraph(para, 'ordered');
				if (orderedLists.length > 0) {
					listFound = true;
					foundLists = foundLists.concat(orderedLists.reduce((a, b) => a.concat(b), []));
				}
				const unorderedLists = this.createListFromParagraph(para, 'unordered');
				if (unorderedLists.length > 0) {
					listFound = true;
					foundLists = foundLists.concat(unorderedLists.reduce((a, b) => a.concat(b), []));
				}
			});
			if (listFound) {
				// clean lists - make sure the numbering is removed.
				foundLists.map(l => this.removeNumberingFromList(l));
				this.removeListLinesFromParagraphs(paras, foundLists);
				page.elements.push(...foundLists);
			}
		});

		logger.info(`Finished list detection.`);
		return doc;
	}

	private removeListLinesFromParagraphs(paragraphs: Paragraph[], lists: List[]) {
		const linesInLists = lists
			.map(list => list.content)
			.reduce((a, b) => a.concat(b), [])
			.map(para => para.content)
			.reduce((a, b) => a.concat(b), []);

		paragraphs.forEach(para => {
			para.content = para.content.filter(line => !linesInLists.includes(line));
			para.box = BoundingBox.merge(para.content.map(l => l.box));
		});
	}

	private createListFromParagraph(para: Paragraph, listType: string): List[] {
		const finalLists: List[] = [];
		const listItemPos: number[] = [...Array(para.content.length).keys()]
			.filter(i => para.content[i].content.length > 1)
			.filter(i => this.detectKindOfListItem(para.content[i]) === listType);

		if (listItemPos.length > 0) {
			const orderedLineGroup: Line[][] = [];
			for (let i = 0; i !== listItemPos.length; ++i) {
				let to: number;
				let from: number;
				from = listItemPos[i];
				if (i === listItemPos.length - 1) {
					to = para.content.length;
				} else {
					to = listItemPos[i + 1];
				}
				orderedLineGroup.push(utils.range(from, to - from).map((x: number) => para.content[x]));
			}
			const listParas: Paragraph[] = orderedLineGroup.map(
				g => new Paragraph(BoundingBox.merge(g.map(l => l.box)), g),
			);
			finalLists.push(
				new List(BoundingBox.merge(listParas.map(p => p.box)), listParas, listType === 'ordered'),
			);
		}
		return finalLists;
	}
	private detectKindOfListItem(text: Text): string {
		let listType: string = 'none';
		if (text.content.length !== 0) {
			if (ListDetectionModule.isBullet(text)) {
				listType = 'unordered';
			} else if (ListDetectionModule.isNumbering(text)) {
				listType = 'ordered';
			}
		}
		return listType;
	}

	private removeNumberingFromList(list: List) {
		list.content.forEach((para: Paragraph, index: number) => {
			let itemNumber: number = 0;
			const firstLine: Line = para.content[0];
			if (this.detectKindOfListItem(firstLine) !== 'none') {
				const itemIndicator: string = firstLine.content.splice(0, 1)[0].toString();
				// TODO: Fit line box to words inside it
				// firstLine.box.left = firstLine.content[0].box.left;
				if (list.isOrdered) {
					itemNumber = parseFloat(itemIndicator.replace(/[^0-9]/g, ''));
					if (index === 0) {
						list.firstItemNumber = itemNumber;
					}
				}
			}
		});
	}
}
