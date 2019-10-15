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
	Font,
	Line,
	Page,
	Paragraph,
} from '../../types/DocumentRepresentation';

import * as utils from '../../utils';
import logger from '../../utils/Logger';
import { Module } from '../Module';
import { ReadingOrderDetectionModule } from '../ReadingOrderDetectionModule/ReadingOrderDetectionModule';
import { WordsToLineModule } from '../WordsToLineModule/WordsToLineModule';
import * as defaultConfig from './defaultConfig.json';

interface Options {
	tolerance?: {
		value: number;
		range: {
			min: number;
			max: number;
		};
	};
}

const defaultOptions = (defaultConfig as any) as Options;

type LineSpace = {
	distance: number;
	usageRatio: number;
	distanceHeightRatio: number;
	totalHeight: number;
	lines: Line[];
};
/**
 * Stability: Stable
 * Merge lines into paragraphs
 */
export class LinesToParagraphModule extends Module<Options> {
	public static moduleName = 'lines-to-paragraph';
	public static dependencies = [ReadingOrderDetectionModule, WordsToLineModule];

	constructor(options?: Options) {
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
			const lines = this.getPageLines(page);
			const interLinesSpaces = this.getInterLinesSpace(lines);
			const joinedLines: Line[][] = this.joinLinesWithSpaces(lines, interLinesSpaces);
			let otherElements = this.getPageElements(page, lines);
			otherElements = this.joinLinesInElements(otherElements);

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

			this.accountForPotentialHeadings(joinedLines);
			// this.accountForPotentialLists(joinedLines);

			const paragraphs: Paragraph[] = this.mergeLinesIntoParagraphs(joinedLines);
			page.elements = otherElements.concat(paragraphs);
			// this.getPageParagraphs(page).map(paragraph => {
			// console.log('Paragraph ' + paragraph.id + ' order ' + paragraph.properties.order);
			// TODO: Set fine paragraph order
			// });
			return page;
		});

		return doc;
	}

	private joinLinesInElements(elements: Element[]): Element[] {
		const withLines: Element[] = [];
		this.getElementsWithLines(elements, withLines);
		withLines.forEach(element => {
			const lines = this.getLinesInElement(element);
			const interLinesSpaces = this.getInterLinesSpace(lines);
			const joinedLines: Line[][] = this.joinLinesWithSpaces(lines, interLinesSpaces);
			element.content = this.mergeLinesIntoParagraphs(joinedLines);
		});
		return elements;
	}

	private getLinesInElement(element: Element): Line[] {
		if (Array.isArray(element.content)) {
			const lines = element.content;
			return lines.filter(item => item instanceof Line).map(line => line as Line);
		}
		return [];
	}

	private getElementsWithLines(elements: Element[], withLines: Element[]) {
		elements.forEach(element => {
			const lines = this.getLinesInElement(element);
			if (lines.length > 0) {
				withLines.push(element);
			} else if (Array.isArray(element.content)) {
				element.content.forEach(child => {
					this.getElementsWithLines(child.content as Element[], withLines);
				});
			}
		});
	}

	private getPageElements(page: Page, excludeLines: Line[]): Element[] {
		return page.elements.filter(
			element => !(element instanceof Line) || !excludeLines.includes(element),
		);
	}

	private getPageLines(page: Page): Line[] {
		return page.getElementsOfType<Line>(Line, false).sort(utils.sortElementsByOrder);
	}

	private joinLinesWithSpaces(lines: Line[], lineSpaces: LineSpace[]): Line[][] {
		const toBeMerged: Line[][] = [];
		let paragraphLines: Line[] = [];

		const isLineInsideParagraph = (lineToFind: Line) => {
			return toBeMerged
				.reduce((prev, curr) => {
					return prev.concat(curr);
				}, [])
				.map(line => line.id)
				.includes(lineToFind.id);
		};

		lineSpaces.forEach(space => {
			lines.forEach((line, index) => {
				const nextLine = this.getNextLine(index, lines);
				let currentLineDistance = this.getInterLineDistance(line, nextLine);

				if (this.shouldAdjustLineDistance(currentLineDistance, lineSpaces)) {
					currentLineDistance = this.findAccuratedDistance(currentLineDistance, lineSpaces);
				}

				if (currentLineDistance != null && currentLineDistance <= space.distance) {
					if (!isLineInsideParagraph(line)) {
						paragraphLines.push(line);
					} else if (paragraphLines.length > 0) {
						toBeMerged.push([...paragraphLines]);
						paragraphLines = [];
					}
				} else if (
					(currentLineDistance > space.distance && paragraphLines.length > 0) ||
					currentLineDistance == null
				) {
					if (paragraphLines.length > 0) {
						if (!isLineInsideParagraph(line)) {
							paragraphLines.push(line);
						}
						toBeMerged.push([...paragraphLines]);
						paragraphLines = [];
					} else if (!isLineInsideParagraph(line)) {
						paragraphLines.push(line);
						if (currentLineDistance == null) {
							toBeMerged.push([...paragraphLines]);
							paragraphLines = [];
						}
					}
				}
			});
		});

		if (lines.length === 1 && lineSpaces.length === 0) {
			toBeMerged.push(lines);
		}
		return toBeMerged;
	}

	private findAccuratedDistance(distance: number, lineSpaces: LineSpace[]): number {
		const accurated = lineSpaces
			.map(space => {
				return {
					distance: space.distance,
					dif: Math.abs(distance.valueOf() - space.distance.valueOf()),
				};
			})
			.sort((a, b) => a.dif - b.dif);

		if (accurated.length > 0) {
			return accurated[0].distance;
		}
		return distance;
	}

	private shouldAdjustLineDistance(distance: number, lineSpaces: LineSpace[]): boolean {
		if (distance == null) {
			return false;
		}
		return lineSpaces.filter(space => space.distance === distance).shift() == null;
	}

	private getNextLine(index: number, inLines: Line[]): Line {
		if (index + 1 >= inLines.length) {
			return null;
		}

		const nextLine = inLines[index + 1];
		const currentLine = inLines[index];
		if (nextLine.top < currentLine.top) {
			return null;
		}

		return nextLine;
	}

	private getInterLinesSpace(lines: Line[]): LineSpace[] {
		const interLineSpaces = this.getPercentagedLineSpaces(lines);
		return this.removeMinorDistancesChanges(interLineSpaces);
	}

	private removeMinorDistancesChanges(lines: LineSpace[]): LineSpace[] {
		const sortedByDistance = lines.sort((a, b) => {
			return a.distance.valueOf() - b.distance.valueOf();
		});
		// .filter(space => space.distance >= 0);

		const mergedDistances: LineSpace[] = [];
		sortedByDistance.forEach((distance, index) => {
			if (
				index > 0 &&
				distance.distanceHeightRatio.valueOf() -
					sortedByDistance[index - 1].distanceHeightRatio.valueOf() <
					this.options.tolerance.value
			) {
				const mergedTotalHeight =
					mergedDistances[mergedDistances.length - 1].totalHeight.valueOf() +
					distance.totalHeight.valueOf();
				const mergedLines = [
					...mergedDistances[mergedDistances.length - 1].lines,
					...distance.lines,
				];
				mergedDistances[mergedDistances.length - 1] = {
					distance: distance.distance,
					usageRatio:
						mergedDistances[mergedDistances.length - 1].usageRatio.valueOf() +
						distance.usageRatio.valueOf(),
					lines: mergedLines,
					totalHeight: mergedTotalHeight,
					distanceHeightRatio:
						distance.distance.valueOf() / (mergedTotalHeight / mergedLines.length),
				};
			} else {
				mergedDistances.push(distance);
			}
		});

		return mergedDistances.sort((a, b) => {
			return b.usageRatio.valueOf() - a.usageRatio.valueOf();
		});
		// .filter(space => space.distance >= 0);
	}

	private getPercentagedLineSpaces(lines: Line[]): LineSpace[] {
		const linesSpaces = [];
		lines.forEach((line, index) => {
			const nextLine = index + 1 < lines.length ? lines[index + 1] : null;
			const distance = this.getInterLineDistance(line, nextLine);
			if (distance != null) {
				const existingDistance = linesSpaces.filter(space => space.distance === distance).shift();
				if (existingDistance) {
					existingDistance.lines.push(line.id);
					existingDistance.usageRatio = Number(
						(existingDistance.lines.length / lines.length).toPrecision(3),
					);
					existingDistance.totalHeight += line.height;
				} else {
					linesSpaces.push({
						distance,
						usageRatio: Number((1 / lines.length).toPrecision(3)),
						lines: [line.id],
						totalHeight: line.height,
					});
				}
			}
		});

		linesSpaces.map(space => {
			space.distanceHeightRatio = space.distance / (space.totalHeight / space.lines.length);
		});

		return linesSpaces.sort((a, b) => {
			return b.usageRatio.valueOf() - a.usageRatio.valueOf();
		});
	}

	private getInterLineDistance(line: Line, nextLine: Line): number {
		if (!nextLine) {
			return null;
		}
		const distance = nextLine.top - line.bottom;
		return Math.round(distance);
	}

	private mergeLinesIntoParagraphs(joinedLines: Line[][]): Paragraph[] {
		return joinedLines.map((group: Line[]) => {
			const paragraph: Paragraph = utils.mergeElements<Line, Paragraph>(
				new Paragraph(new BoundingBox(0, 0, 0, 0)),
				...group,
			);

			paragraph.properties.order = group[0].properties.order;
			return paragraph;
		});
	}

	/**
	 * Takes into account potential headings inside a paragraph - splits a paragraph into multiple
	 * @param lineGroups List of joined lines to be alterered
	 */
	private accountForPotentialHeadings(lineGroups: Line[][]) {
		lineGroups.forEach(lineGroup => {
			const mostCommonFont: Font | undefined = utils.findMostCommonFont(
				lineGroup.map((l: Line) => l.getMainFont()).filter(f => f !== undefined),
			);
			const newLines: Line[] = [];
			if (mostCommonFont instanceof Font) {
				const headingCandidateIndices: number[] = lineGroup
					.map((line: Line, pos: number) => {
						if (line.getMainFont().size > mostCommonFont.size) {
							return pos;
						} else {
							return undefined;
						}
					})
					.filter((i: number) => i !== undefined);
				let groupIndices: number[][] = [];
				groupIndices = utils.groupConsecutiveNumbersInArray(headingCandidateIndices);
				groupIndices.map((group: number[]) => {
					group.map((pos: number) => newLines.push(lineGroup[pos]));
				});
				groupIndices.map((group: number[]) => {
					group.map((pos: number) => lineGroup.splice(pos, 1));
				});
				if (newLines.length > 0) {
					logger.debug(`------> ${newLines.length} new lines found in this group`);
					newLines.map((l: Line) => lineGroups.push([l]));
				}
			} else {
				logger.warn("can't account for headings while para merge - no font info available");
			}
		});
	}

	// /**
	//  * Takes into account potential bullet points inside a paragraph - splits a para into multiple
	//  * @param joinedLines List of joined lines to be alterered
	//  */
	// private accountForPotentialLists(lineGroups: Line[][]) {
	// 	// do something;
	// }
}
