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

import { spawn, spawnSync } from 'child_process';
import * as fs from 'fs';
import * as os from 'os';
import { parseString } from 'xml2js';
import {
	BoundingBox,
	Character,
	Document,
	Element,
	Font,
	Line,
	Page,
	Paragraph,
	Word,
} from '../../types/DocumentRepresentation';
import { PdfminerPage } from '../../types/PdfminerPage';
import { PdfminerTextline } from '../../types/PdfminerTextline';
import * as utils from '../../utils';
import logger from '../../utils/Logger';

/**
 * Executes the pdfminer extraction function, reading an input pdf file and extracting a document representation.
 * This function involves recovering page contents like words, bounding boxes, fonts and other information that
 * the pdfminer tool's output provides. This function spawns the externally existing pdfminer tool.
 *
 * @param pdfInputFile The path including the name of the pdf file for input.
 * @returns The promise of a valid document (in the format DocumentRepresentation).
 */
export function execute(pdfInputFile: string): Promise<Document> {
	return new Promise<Document>((resolve, reject) => {
		return repairPdf(pdfInputFile).then(repairedPdf => {
			const xmlOutputFile: string = utils.getTemporaryFile('.xml');
			logger.debug(`pdf2txt.py ${['-A', '-t', 'xml', '-o', xmlOutputFile, repairedPdf].join(' ')}`);

			if (!fs.existsSync(xmlOutputFile)) {
				fs.appendFileSync(xmlOutputFile, '');
			}

			const pdfminer = spawn('pdf2txt.py', ['-A', '-t', 'xml', '-o', xmlOutputFile, repairedPdf]);

			pdfminer.stderr.on('data', data => {
				logger.error('pdfminer error:', data.toString('utf8'));
			});

			function parseXmlToObject(xml: string): Promise<object> {
				const promise = new Promise<object>((resolve, reject) => {
					parseString(xml, { attrkey: '_attr' }, (err, dataObject) => {
						if (err) {
							reject(err);
						}
						resolve(dataObject);
					});
				});
				return promise;
			}

			pdfminer.on('close', async code => {
				if (code === 0) {
					const xml: string = fs.readFileSync(xmlOutputFile, 'utf8');
					try {
						logger.debug(`Converting pdfminer's XML output to JS object..`);
						parseXmlToObject(xml).then((obj: any) => {
							logger.info(
								`Pages contain data of the following type ${Object.keys(obj.pages.page[0])}`,
							);
							const pages: Page[] = [];
							obj.pages.page.forEach(pageObj => pages.push(getPage(pageObj)));
							resolve(new Document(pages));
						});
					} catch (err) {
						reject(`parseXml failed: ${err}`);
					}
				} else {
					reject(`pdfminer return code is ${code}`);
				}
			});
			// return doc;
		});
	});
}

function getPage(pageObj: PdfminerPage): Page {
	const boxValues: number[] = pageObj._attr.bbox.split(',').map(v => parseFloat(v));
	const pageBbox: BoundingBox = new BoundingBox(
		boxValues[0],
		boxValues[1],
		boxValues[2],
		boxValues[3],
	);

	let elements: Element[] = [];

	// treat paragraphs
	const paras: Paragraph[] = pageObj.textbox.map(para => {
		const lines: Line[] = para.textline.map(line => breakLineIntoWords(line, ',', pageBbox.height));
		return new Paragraph(getBoundingBox(para._attr.bbox, ',', pageBbox.height), lines);
	});
	elements = [...elements, ...paras];

	// todo: treat figures, rects, curves, layout... before creating the page

	return new Page(parseFloat(pageObj._attr.id), paras, pageBbox);
}

// Pdfminer's bboxes are of the format: x0, y0, x1, y1. Our BoundingBox dims are as: left, top, width, height
function getBoundingBox(
	bbox: string,
	splitter: string = ',',
	pageHeight: number = 0,
	scalingFactor: number = 1,
): BoundingBox {
	const values: number[] = bbox.split(splitter).map(v => parseFloat(v) * scalingFactor);
	const width: number = Math.abs(values[2] - values[0]); // right - left = width
	const height: number = Math.abs(values[1] - values[3]); // top - bottom = height
	const left: number = values[0];
	const top: number = Math.abs(pageHeight - values[1]) - height; // invert x direction (pdfminer's (0,0)
	// is on the bottom left)
	return new BoundingBox(left, top, width, height);
}

function breakLineIntoWords(
	line: PdfminerTextline,
	wordSeperator: string = ' ',
	pageHeight: number,
	scalingFactor: number = 1,
): Line {
	const chars: Character[] = line.text.map(char => {
		if (char._ === undefined) {
			return undefined;
		} else {
			return new Character(getBoundingBox(char._attr.bbox, ',', pageHeight, scalingFactor), char._);
		}
	});
	if (chars[0] === undefined || chars[0].content === wordSeperator) {
		chars.splice(0, 1);
	}
	if (chars[chars.length - 1] === undefined || chars[chars.length - 1].content === wordSeperator) {
		chars.splice(chars.length - 1, chars.length);
	}
	const mostCommonFont: Font = new Font(
		findMode(
			line.text
				.filter(char => char !== undefined && char._attr !== undefined)
				.map(char => char._attr.font),
		)[0],
		findMode(
			line.text
				.filter(char => char !== undefined && char._attr !== undefined)
				.map(char => char._attr.size),
		)[0],
	);

	let sepLocs = chars
		.filter(char => char !== undefined)
		.reduce((a, e, i) => (e.content === wordSeperator ? a.concat(i) : a), []); // fill with spaces

	sepLocs = [
		...sepLocs,
		...chars.reduce((a, e, i) => (e === undefined ? a.concat(i) : a), []), // fill with undefs
	].sort((a, b) => a - b);

	const words: Word[] = [];
	if (sepLocs.length === 0) {
		words.push(new Word(BoundingBox.merge(chars.map(c => c.box)), chars, mostCommonFont));
	} else {
		const firstSel: Character[] = chars.slice(0, sepLocs[0]);
		words.push(new Word(BoundingBox.merge(firstSel.map(c => c.box)), firstSel, mostCommonFont));
		for (let i = 0; i !== sepLocs.length; ++i) {
			let from: number;
			let to: number;
			from = sepLocs[i] + 1;
			if (i !== sepLocs.length - 1) {
				to = sepLocs[i + 1];
			} else {
				to = chars.length;
			}
			const charSelection: Character[] = chars.slice(from, to);
			words.push(
				new Word(BoundingBox.merge(charSelection.map(c => c.box)), charSelection, mostCommonFont),
			);
		}
	}
	return new Line(getBoundingBox(line._attr.bbox, ',', pageHeight), words);
}

/**
 * Repair a pdf using the external mutool utility.
 * @param filePath The absolute filename and path of the pdf file to be repaired.
 */
function repairPdf(filePath: string) {
	return new Promise<string>(resolve => {
		const mutoolPath = spawnSync('which', ['mutool']).output.join('');
		if (mutoolPath === '' || (/^win/i.test(os.platform()) && /no mutool in/.test(mutoolPath))) {
			logger.warn('MuPDF not installed !! Skip clean PDF.');
			resolve(filePath);
		} else {
			const pdfOutputFile = utils.getTemporaryFile('.pdf');
			const pdfFixer = spawn('mutool', ['clean', filePath, pdfOutputFile]);
			pdfFixer.on('close', () => {
				// Check that the file is correctly written on the file system
				fs.fsyncSync(fs.openSync(filePath, 'r+'));
				resolve(pdfOutputFile);
			});
		}
	});
}

/** find the most common element in an array */
function findMode(collection) {
	if (collection.length === 0) {
		return null;
	}
	const modeMap = {};
	let maxCount = 1;
	let modes = [];

	collection.forEach(el => {
		if (modeMap[el] === null) {
			modeMap[el] = 1;
		} else {
			modeMap[el]++;
		}

		if (modeMap[el] > maxCount) {
			modes = [el];
			maxCount = modeMap[el];
		} else if (modeMap[el] === maxCount) {
			modes.push(el);
			maxCount = modeMap[el];
		}
	});
	return modes;
}
