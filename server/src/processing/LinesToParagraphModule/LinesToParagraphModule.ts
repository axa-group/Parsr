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
	Line,
	Page,
	Paragraph,
	Element,
} from '../../types/DocumentRepresentation';

import * as utils from '../../utils';
import logger from '../../utils/Logger';
import { Module } from '../Module';
import { ReadingOrderDetectionModule } from '../ReadingOrderDetectionModule/ReadingOrderDetectionModule';
import { WordsToLineModule } from '../WordsToLineModule/WordsToLineModule';

type LineSpace = {
	distance: Number;
	usageRatio: Number;
	distanceHeightRatio: Number;
	totalHeight: Number;
	lines: Line[];
};
/**
 * Stability: Stable
 * Merge lines into paragraphs
 */
export class LinesToParagraphModule extends Module {
	public static moduleName = 'lines-to-paragraph';
	public static dependencies = [ReadingOrderDetectionModule, WordsToLineModule];

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
			const paragraphs: Paragraph[] = this.mergeLinesIntoParagraphs(joinedLines);
			page.elements = otherElements.concat(paragraphs);
			//this.getPageParagraphs(page).map(paragraph => {
			//console.log('Paragraph ' + paragraph.id + ' order ' + paragraph.properties.order);
			//TODO: Set fine paragraph order
			//});
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
			} else if (element.content as Element[]) {
				const children = element.content as Element[];
				children.forEach(child => {
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
	/*rivate getPageParagraphs(page: Page): Paragraph[] {
		return page.getElementsOfType<Paragraph>(Paragraph, true).sort(utils.sortElementsByOrder);
	}*/

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
				let nextLine = this.getNextLine(index, lines);
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

		if (lines.length == 1 && lineSpaces.length == 0) {
			toBeMerged.push(lines);
		}
		return toBeMerged;
	}

	private findAccuratedDistance(distance: Number, lineSpaces: LineSpace[]): Number {
		let accurated = lineSpaces
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

	private shouldAdjustLineDistance(distance: Number, lineSpaces: LineSpace[]): Boolean {
		if (distance == null) {
			return false;
		}
		return lineSpaces.filter(space => space.distance == distance).shift() == null;
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
		let interLineSpaces = this.getPercentagedLineSpaces(lines);
		return this.removeMinorDistancesChanges(interLineSpaces);
	}

	private removeMinorDistancesChanges(lines: LineSpace[]): LineSpace[] {
		const sortedByDistance = lines.sort((a, b) => {
			return a.distance.valueOf() - b.distance.valueOf();
		});
		//.filter(space => space.distance >= 0);

		let mergedDistances: LineSpace[] = [];
		sortedByDistance.forEach((distance, index) => {
			if (
				index > 0 &&
				distance.distanceHeightRatio.valueOf() < 0.25
				//distance.distanceHeightRatio.valueOf() -
				//	sortedByDistance[index - 1].distanceHeightRatio.valueOf() <
				//	0.1
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
		//.filter(space => space.distance >= 0);
	}

	private getPercentagedLineSpaces(lines: Line[]): LineSpace[] {
		let linesSpaces = [];
		lines.forEach((line, index) => {
			let nextLine = index + 1 < lines.length ? lines[index + 1] : null;
			let distance = this.getInterLineDistance(line, nextLine);
			if (distance != null) {
				const existingDistance = linesSpaces.filter(space => space.distance == distance).shift();
				if (existingDistance) {
					existingDistance.lines.push(line.id);
					existingDistance.usageRatio = Number(
						(existingDistance.lines.length / lines.length).toPrecision(3),
					);
					existingDistance.totalHeight += line.height;
				} else {
					linesSpaces.push({
						distance: distance,
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

	private getInterLineDistance(line: Line, nextLine: Line): Number {
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
}
