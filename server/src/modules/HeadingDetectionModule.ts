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

import { Document, Font, Heading, Paragraph } from '../types/DocumentRepresentation';
import * as utils from '../utils';
import logger from '../utils/Logger';
import { LinesToParagraphModule } from './LinesToParagraphModule';
import { Module } from './Module';

// TODO This module doesn't work very well. It doesn't detect titles that are just bold text and
//      should use the location of elements of the page to improve detection and accuary.
/**
 * Stabiltiy: Experimental
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

		const paragraphs: Paragraph[] = doc
			.getElementsOfType<Paragraph>(Paragraph)
			.filter(t => t.toString().trim() !== '')
			.reduce((a, b) => a.concat(b), []);

		const sizeProportion: Map<number, number> = new Map();
		const nameProportion: Map<string, number> = new Map();
		const italicProportion: Map<boolean, number> = new Map();
		const underlineProportion: Map<boolean, number> = new Map();
		const colorProportion: Map<string, number> = new Map();
		const weightProportion: Map<string, number> = new Map();

		paragraphs.forEach((paragraph: Paragraph) => {
			const font: Font = paragraph.getMainFont();
			sizeProportion.set(font.size, Math.trunc(sizeProportion.get(font.size)) + 1);
			nameProportion.set(font.name, Math.trunc(nameProportion.get(font.name)) + 1);
			italicProportion.set(font.isItalic, Math.trunc(italicProportion.get(font.isItalic)) + 1);
			underlineProportion.set(
				font.isUnderline,
				Math.trunc(underlineProportion.get(font.isUnderline)) + 1,
			);
			colorProportion.set(font.color, Math.trunc(colorProportion.get(font.color)) + 1);
			weightProportion.set(font.weight, Math.trunc(weightProportion.get(font.weight)) + 1);
		});

		const mostCommonSize: [number, number] = Array.from(sizeProportion).reduce(
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

		const allLevels: Set<number> = new Set([]);
		paragraphs.forEach((paragraph: Paragraph) => {
			const scores = {
				size: 0,
				weight: 0,
				color: 0,
				name: 0,
				italic: 0,
				underline: 0,
			};

			scores.size = paragraph.getMainFont().size / mostCommonSize[0];
			scores.weight = paragraph.getMainFont().weight !== mostCommonWeight[0] ? 1 : 0;
			scores.italic = paragraph.getMainFont().isItalic !== mostCommonItalic[0] ? 1 : 0;
			scores.underline = paragraph.getMainFont().isUnderline !== mostCommonUnderline[0] ? 1 : 0;
			scores.color = paragraph.getMainFont().color !== mostCommonColor[0] ? 1 : 0;
			scores.name = paragraph.getMainFont().name !== mostCommonName[0] ? 1 : 0;

			paragraph.properties.titleScores = scores;
			allLevels.add(paragraph.getMainFont().size);
		});

		titleFromSize(1.3);

		/*
		let titleNb = 0;
		if (titleNb < texts.length * 0.1) {
			texts.forEach(t => {

			});
		}
		*/

		return doc;

		function titleFromSize(threshold: number) {
			const levels: number[] = Array.from(allLevels).sort((a, b) => b - a);
			paragraphs.forEach((paragraph: Paragraph) => {
				const scores = paragraph.properties.titleScores;

				if (scores.size > threshold) {
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
	}
}
