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

import { Document, Font, Heading, Paragraph } from '../../types/DocumentRepresentation';
import * as utils from '../../utils';
import logger from '../../utils/Logger';
import { LinesToParagraphModule } from '../LinesToParagraphModule/LinesToParagraphModule';
import { Module } from '../Module';

// TODO This module doesn't work very well. It doesn't detect titles that are just bold text and
//      should use the location of elements of the page to improve detection and accuracy.
/**
 * Stability: Experimental
 * Detect title text blocks in the document, based on the font difference.
 */

export class HeadingDetectionModule extends Module {
	public static moduleName = 'heading-detection';
	public static dependencies = [LinesToParagraphModule];

	public main(doc: Document): Document {
		const existingHeaders = doc
			.getElementsOfType<Heading>(Heading)
			.filter(t => t.toString().trim() !== '')
			.reduce((a, b) => a.concat(b), []);

		if (existingHeaders.length !== 0) {
			logger.warn('Not detecting titles: the document already contains them.');
			return doc;
		}

		computeHeadersByVoting(false); // older algorithm - interesting ideas
		computeHeadersByEliminationOfBaseTextFont(true); // newer algorithm based on detecting a base font

		return doc;

		// calculate using the size parameter alone, while eliminating
		// considering the body font size as a candidate
		function computeHeadersByEliminationOfBaseTextFont(execute: boolean = true) {
			if (!execute) {
				return;
			}
			const textBodyFont: Font = doc.getMainFont();

			// get all the paragraphs who don't have the same font as the main document one
			const headingCandidates: Paragraph[] = doc
				.getElementsOfType<Paragraph>(Paragraph)
				.filter(para => para.toString().trim() !== '')
				.reduce((para1, para2) => para1.concat(para2), [])
				.filter(para => para.getMainFont() !== undefined)
				.filter(para => !para.getMainFont().isEqual(textBodyFont))
				.sort((para1, para2) => para2.getMainFont().size - para1.getMainFont().size);

			// make paragraph groups by font size
			const paraGroupsByFontSize: Paragraph[][] = [];
			let visitedFontSizes: number[] = [];
			for (const para of headingCandidates) {
				const paraFont: Font = para.getMainFont();
				if (visitedFontSizes.includes(paraFont.size)) {
					continue;
				}

				const pos = utils.findPositionsInArray(
					headingCandidates.map(p => p.getMainFont().size),
					paraFont.size,
				);

				paraGroupsByFontSize.push(pos.map(i => headingCandidates[i]));
				visitedFontSizes = [...new Set([...visitedFontSizes, paraFont.size])];
			}

			logger.debug(
				`for ${headingCandidates.length} paras, found ${
					paraGroupsByFontSize.length
				} groups of dimensions: ${paraGroupsByFontSize.map(
					pg => pg.length,
				)}: ${utils.prettifyObject(paraGroupsByFontSize.map(pg => pg[0].getMainFont().size))}`,
			);

			// make headings
			let maxLevelOfHeading: number = 6;
			if (paraGroupsByFontSize.length < 6) {
				maxLevelOfHeading = paraGroupsByFontSize.length;
			}
			for (let i = 0; i < maxLevelOfHeading; i++) {
				const group = paraGroupsByFontSize[i];
				for (const para of group) {
					const heading: Heading = new Heading(para.box, para.content);
					heading.language = para.language;
					heading.level = i + 1;
					heading.metadata = para.metadata;
					heading.properties = para.properties;
					heading.parent = para.parent;
					heading.redundant = para.redundant;
					doc = utils.replaceObject<Paragraph, Heading>(doc, para, heading);
				}
			}
		}

		// compute headers using a system of voting between the most common styles
		function computeHeadersByVoting(execute: boolean = true) {
			if (!execute) {
				return;
			}

			// maps representing value -> cardinality
			const wordHeightProportion: Map<number, number> = new Map();
			const sizeProportion: Map<number, number> = new Map();
			const nameProportion: Map<string, number> = new Map();
			const italicProportion: Map<boolean, number> = new Map();
			const underlineProportion: Map<boolean, number> = new Map();
			const colorProportion: Map<string, number> = new Map();
			const weightProportion: Map<string, number> = new Map();
			const capitalCaseProportion: Map<boolean, number> = new Map();
			const titleCaseProportion: Map<boolean, number> = new Map();

			// incrementing cardinality values
			const paragraphs: Paragraph[] = doc
				.getElementsOfType<Paragraph>(Paragraph)
				.filter(t => t.toString().trim() !== '')
				.reduce((a, b) => a.concat(b), []);

			paragraphs.forEach((para: Paragraph) => {
				const font: Font = para.getMainFont();

				wordHeightProportion.set(
					Math.trunc(getMedianWordsHeight(para)),
					Math.trunc(getMedianWordsHeight(para)) + 1,
				);
				sizeProportion.set(font.size, Math.trunc(sizeProportion.get(font.size)) + 1);
				nameProportion.set(font.name, Math.trunc(nameProportion.get(font.name)) + 1);
				italicProportion.set(font.isItalic, Math.trunc(italicProportion.get(font.isItalic)) + 1);
				underlineProportion.set(
					font.isUnderline,
					Math.trunc(underlineProportion.get(font.isUnderline)) + 1,
				);
				colorProportion.set(font.color, Math.trunc(colorProportion.get(font.color)) + 1);
				weightProportion.set(font.weight, Math.trunc(weightProportion.get(font.weight)) + 1);
				capitalCaseProportion.set(
					isCapitalCase(para.toString()),
					Math.trunc(capitalCaseProportion.get(isCapitalCase(para.toString()))) + 1,
				);
				titleCaseProportion.set(
					isTitleCase(para.toString()),
					Math.trunc(titleCaseProportion.get(isTitleCase(para.toString()))) + 1,
				);
			});

			// take out the most common value, cardinality pair for each parameter
			const mostCommonSize: [number, number] = Array.from(sizeProportion).reduce(
				(a, b) => (a[1] > b[1] ? a : b),
				[0, 0],
			);
			const mostCommonWordHeight: [number, number] = Array.from(wordHeightProportion).reduce(
				(a, b) => (a[1] > b[1] ? a : b),
				[0, 0],
			);
			const mostCommonWeight: [string, number] = Array.from(weightProportion).reduce(
				(a, b) => (a[1] > b[1] ? a : b),
				['', 0],
			);
			const mostCommonItalic: [boolean, number] = Array.from(italicProportion).reduce(
				(a, b) => (a[1] > b[1] ? a : b),
				[false, 0],
			);
			const mostCommonUnderline: [boolean, number] = Array.from(underlineProportion).reduce(
				(a, b) => (a[1] > b[1] ? a : b),
				[false, 0],
			);
			const mostCommonColor: [string, number] = Array.from(colorProportion).reduce(
				(a, b) => (a[1] > b[1] ? a : b),
				['', 0],
			);
			const mostCommonName: [string, number] = Array.from(nameProportion).reduce(
				(a, b) => (a[1] > b[1] ? a : b),
				['', 0],
			);
			const mostCommonTitleCase: [boolean, number] = Array.from(titleCaseProportion).reduce(
				(a, b) => (a[1] > b[1] ? a : b),
				[false, 0],
			);
			const mostCommonCapitalCase: [boolean, number] = Array.from(capitalCaseProportion).reduce(
				(a, b) => (a[1] > b[1] ? a : b),
				[false, 0],
			);

			// compute scores wrt the highest occurring values for each param (using ones with highest cardinality)
			const allLevels: Set<number> = new Set([]);
			paragraphs.forEach((paragraph: Paragraph) => {
				const scores = {
					size: 0,
					wordHeight: 0,
					weight: 0,
					color: 0,
					name: 0,
					italic: 0,
					underline: 0,
					capitalCase: 0,
					titleCase: 0,
				};

				scores.wordHeight = Math.fround(getMedianWordsHeight(paragraph)) / mostCommonWordHeight[0];
				scores.size = paragraph.getMainFont().size / mostCommonSize[0];
				scores.weight = paragraph.getMainFont().weight !== mostCommonWeight[0] ? 1 : 0;
				scores.italic = paragraph.getMainFont().isItalic !== mostCommonItalic[0] ? 1 : 0;
				scores.underline = paragraph.getMainFont().isUnderline !== mostCommonUnderline[0] ? 1 : 0;
				scores.color = paragraph.getMainFont().color !== mostCommonColor[0] ? 1 : 0;
				scores.name = paragraph.getMainFont().name !== mostCommonName[0] ? 1 : 0;
				scores.capitalCase =
					isCapitalCase(paragraph.toString()) !== mostCommonCapitalCase[0] ? 1 : 0;
				scores.titleCase = isTitleCase(paragraph.toString()) !== mostCommonTitleCase[0] ? 1 : 0;

				paragraph.properties.titleScores = scores;
				allLevels.add(paragraph.getMainFont().size);
			});

			detectTitles();

			function detectTitles(
				totalScoreThreshold: number = 2, // at least 2 parameters setting it apart from common text
				sizeThreshold: number = 1,
				wordHeightThreshold: number = 1,
			) {
				const levels: number[] = Array.from(allLevels).sort((a, b) => b - a);
				paragraphs.forEach((paragraph: Paragraph) => {
					const scores = paragraph.properties.titleScores;

					let totalScore: number = 0;
					if (scores.size > sizeThreshold) {
						totalScore++;
					}
					if (scores.wordHeight > wordHeightThreshold) {
						totalScore++;
					}
					if (scores.weight > 0) {
						totalScore++;
					}
					if (scores.italic > 0) {
						totalScore++;
					}
					if (scores.underline > 0) {
						totalScore++;
					}
					if (scores.name > 0) {
						totalScore++;
					}
					if (scores.capitalCase > 0) {
						totalScore++;
					}
					if (scores.titleCase > 0) {
						totalScore++;
					}

					if (totalScore >= totalScoreThreshold) {
						const heading: Heading = new Heading(paragraph.box, paragraph.content);
						heading.language = paragraph.language;
						heading.level = levels.indexOf(heading.getMainFont().size) + 1;
						heading.metadata = paragraph.metadata;
						heading.properties = paragraph.properties;
						heading.parent = paragraph.parent;
						heading.redundant = paragraph.redundant;

						doc = utils.replaceObject<Paragraph, Heading>(doc, paragraph, heading);
						// titleNb++;
					}
				});
			}

			function getMedianWordsHeight(para: Paragraph): number {
				return utils.median(para.getWords().map(w => w.box.height));
			}

			function isTitleCase(str: string): boolean {
				try {
					return str === utils.toTitleCase(str);
				} catch (err) {
					return false;
				}
			}

			function isCapitalCase(str: string): boolean {
				try {
					return str === str.toUpperCase();
				} catch (err) {
					return false;
				}
			}
		}
	}
}
