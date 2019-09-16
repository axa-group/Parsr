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
	BoundingBox,
	Document,
	Element,
	Heading,
	Line,
	Page,
	Paragraph,
	Word,
} from '../../types/DocumentRepresentation';
import * as utils from '../../utils';
import logger from '../../utils/Logger';
import { Module } from '../Module';
import { ReadingOrderDetectionModule } from '../ReadingOrderDetectionModule/ReadingOrderDetectionModule';
import { WordsToLineModule } from '../WordsToLineModule/WordsToLineModule';
import * as defaultConfig from './defaultConfig.json';

interface Options {
	addNewline?: boolean;
	alignUncertainty?: {
		value: number;
		range: {
			min: number;
			max: number;
		};
	};
	checkFont?: {
		value: boolean;
	};
	lineLengthUncertainty?: {
		value: number;
		range: {
			min: number;
			max: number;
		};
	};
	maxInterline?: {
		value: number;
		range: {
			min: number;
			max: number;
		};
	};
}

const defaultOptions = (defaultConfig as any) as Options;

/**
 * Stability: Stable
 * Merge lines into paragraphs
 */
export class LinesToParagraphModule extends Module<Options> {
	public static moduleName = 'lines-to-paragraph';
	public static dependencies = [ReadingOrderDetectionModule, WordsToLineModule];

	constructor(options: Options = {}) {
		super(options, defaultOptions);
	}

	public main(doc: Document): Document {
		doc.pages.forEach((page: Page) => {
			if (page.getElementsOfType<Paragraph>(Paragraph).length > 0) {
				logger.warn(
					'Warning: this page already has some paragraphs in it. Not performing paragraph merge.',
				);
				return page;
			}
			const lines: Line[] = page
				.getElementsOfType<Line>(Line, false)
				.sort(utils.sortElementsByOrder);
			const otherPageElements: Element[] = page.elements.filter(
				element => !(element instanceof Line) || !lines.includes(element),
			);
			const otherElements: Element[] = this.joinLinesInElements(otherPageElements);
			const joinedLines: Line[][] = this.joinLines(lines);

			// Clean the properties.cr  information as it is not usefull down the line
			for (const theseLines of joinedLines) {
				for (const thisLine of theseLines) {
					for (const thisWord of thisLine.content) {
						if (thisWord.properties && thisWord.properties.cr) {
							delete thisWord.properties.cr;
							delete thisWord.properties.cl;
						}
					}
				}
			}
			const paragraphs: Paragraph[] = this.mergeLinesIntoParagraphs(joinedLines);
			page.elements = otherElements.concat(paragraphs);

			return page;
		});

		return doc;
	}

	private joinLinesInElements(elements: Element[]) {
		elements.forEach(element => {
			this.joinLinesFromElement(element);
		});
		return elements;
	}

	private joinLinesFromElement(element: Element): Line {
		if (
			!(element instanceof Line) &&
			element.content &&
			typeof element.content !== 'string' &&
			element.content.length !== 0
		) {
			const containedLines: Line[] = [];
			element.content.forEach(el => {
				const containedLine = this.joinLinesFromElement(el);
				if (containedLine) {
					containedLines.push(containedLine);
				}
			});
			if (containedLines.length > 0) {
				this.updateElementContents(element, containedLines);
			}
		} else if (element instanceof Line) {
			return element;
		}
		return null;
	}

	private updateElementContents(element: Element, lines: Line[]) {
		const joinedLines = this.joinLines(lines);
		const elementContent = this.mergeLinesIntoParagraphs(joinedLines);
		element.content = elementContent;
	}

	private mergeLinesIntoParagraphs(joinedLines: Line[][]): Paragraph[] {
		let newOrder = 0;
		return joinedLines.map((group: Line[]) => {
			const paragraph: Paragraph = utils.mergeElements<Line, Paragraph>(
				new Paragraph(new BoundingBox(0, 0, 0, 0)),
				...group,
			);
			paragraph.properties.order = newOrder++;
			return paragraph;
		});
	}

	private joinLines(lines: Line[]): Line[][] {
		const toBeMerged: Line[][] = [];
		for (let i = 0; i < lines.length; i++) {
			const firstLine: Line = lines[i];
			const mergeGroup: Line[] = [firstLine];

			for (let j = i + 1; j < lines.length; j++) {
				const prev: Line = lines[j - 1];
				const curr: Line = lines[j];

				if (
					//// FIXME (!this.options.checkFont || line1.font === line2.font) &&
					this.isAdjacentLine(prev, curr) &&
					(utils.isAligned([prev, curr], this.options.alignUncertainty.value) ||
						utils.isAlignedCenter([prev, curr], this.options.alignUncertainty.value)) &&
					// isntBulletList(prev, curr) &&
					// TODO handle table elements: !line1.properties.isTableElement &&
					// TODO handle table elements: !line2.properties.isTableElement &&
					!this.havePlaceForFirstWordInPreviousLine(prev, curr, mergeGroup) &&
					prev instanceof Heading === curr instanceof Heading
				) {
					mergeGroup.push(curr);
					i++;
				} else {
					// i = j;
					break;
				}
			}

			toBeMerged.push(mergeGroup);
		}
		return toBeMerged;
	}

	private havePlaceForFirstWordInPreviousLine(topLine: Line, bottomLine: Line, paragraph: Line[]) {
		const topLineRight: number = topLine.right;
		const topLineLeft: number = topLine.left;

		const linecontent: Word[] = bottomLine.content;

		let orientation = this.detectParagraphOrientation(paragraph, bottomLine);

		if (orientation === 'JUSTIFIED') {
			return false;
		}

		// for now by default we fall back to Left if we can not determine the allignement.
		if (orientation === 'DISALIGNED') {
			orientation = 'LEFT';
		}

		linecontent.sort((a: Word, b: Word) => {
			return a.left < b.left ? -1 : 1;
		});

		const firstWord: Word = linecontent[0];

		let hyphenIndex = firstWord.content.length;

		let text: string = firstWord.content.toString();
		text = text.toLowerCase();

		for (let i = 1; i < text.length; ++i) {
			// special break character
			// TODO : Expand with all standart unicode set of separator
			if (' \t.?!,;-:。？！，；：'.indexOf(text[i]) !== -1) {
				hyphenIndex = i;
				break;
			}
		}

		if (hyphenIndex !== firstWord.content.length) {
			hyphenIndex++;
		}

		// todo : better hyphen rules
		const supposedWidth: number = (firstWord.width / firstWord.content.length) * hyphenIndex;

		if (
			orientation === 'LEFT' &&
			topLineRight + supposedWidth < firstWord.properties.cr - this.options.alignUncertainty.value
		) {
			return true;
		}

		if (
			orientation === 'RIGHT' &&
			topLineLeft - supposedWidth > firstWord.properties.cl + this.options.alignUncertainty.value
		) {
			return true;
		}

		if (
			orientation === 'CENTER' &&
			topLineLeft - firstWord.properties.cl + (firstWord.properties.cr - topLineRight) >
				supposedWidth + this.options.alignUncertainty.value
		) {
			return true;
		}

		return false;
	}

	private detectParagraphOrientation(paragraph: Line[], newLine: Line) {
		const left: number[] = [];
		const right: number[] = [];
		const center: number[] = [];

		for (const line of paragraph) {
			const orient = this.getLineOrientation(line);
			left.push(orient.left);
			right.push(orient.right);
			center.push(orient.center);
		}
		const orientation = this.getLineOrientation(newLine);
		left.push(orientation.left);
		right.push(orientation.right);
		center.push(orientation.center);

		let isLeftAligned = false;
		left.sort((a, b) => a - b);
		if (Math.abs(left[0] - left[left.length - 1]) < this.options.alignUncertainty.value * 2) {
			isLeftAligned = true;
		}

		let isRightAligned = false;
		right.sort((a, b) => a - b);
		if (Math.abs(right[0] - right[right.length - 1]) < this.options.alignUncertainty.value * 2) {
			isRightAligned = true;
		}

		let isCenterAligned = false;
		center.sort((a, b) => a - b);
		if (Math.abs(center[0] - center[center.length - 1]) < this.options.alignUncertainty.value * 2) {
			isCenterAligned = true;
		}

		if (isRightAligned && isLeftAligned) {
			return 'JUSTIFIED';
		}

		if (isLeftAligned) {
			return 'LEFT';
		}

		if (isRightAligned) {
			return 'RIGHT';
		}

		if (isCenterAligned) {
			return 'CENTER';
		}

		return 'DISALIGNED';
	}

	private getLineOrientation(line: Line) {
		const linecontent: Word[] = line.content;
		let left: number = 0;
		let right: number = 0;
		let center: number = 0;

		linecontent.sort((a: Word, b: Word) => {
			return a.left < b.left ? -1 : 1;
		});

		const firstWord = linecontent[0];
		left = firstWord.box.left;

		linecontent.sort((a: Word, b: Word) => {
			return a.right > b.right ? -1 : 1;
		});

		const lastWord = linecontent[0];
		right = lastWord.box.right;

		center = firstWord.box.left + (lastWord.box.right - firstWord.box.left) / 2;

		// reset line to original

		linecontent.sort((a: Word, b: Word) => {
			return a.left < b.left ? -1 : 1;
		});

		return { left, right, center };
	}

	/**
	 * Checks if two lines are adjacent or not by using a measure of their overlap uncertainty.
	 * @param line1 the first line
	 * @param line2 the second line
	 */
	private isAdjacentLine(line1: Line, line2: Line): boolean {
		const verticalOverlapUncertainty = (line1.height * 2) / 3;
		return (
			line1.top + line1.height < line2.top + verticalOverlapUncertainty &&
			line1.top + line1.height * (1 + this.options.maxInterline.value) > line2.top
		);
	}
}
