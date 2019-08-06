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
import { TSV } from 'tsv';
import { Config } from '../../types/Config';
import { BoundingBox, Document, Font, Page, Word } from '../../types/DocumentRepresentation';
import { TsvElement } from '../../types/TsvElement';
import * as utils from '../../utils';
import logger from '../../utils/Logger';

/**
 * Executes the tesseract to json conversion module, which entails calling
 * @param imageInputFile The input image file to be executed using the tesseract OCR tool.
 * @param config The input configuraiton for tesseract.
 * @returns The promise of a valid Document (as in the Document Representation data structure).
 */
export function execute(imageInputFile: string, config: Config): Promise<Document> {
	return new Promise<Document>((resolve, reject) => {
		const tsvOutputFile: string = utils.getTemporaryFile('.json');

		let configLanguages: string[];

		if (typeof config.extractor.language === 'string') {
			configLanguages = [config.extractor.language];
		} else if (Array.isArray(config.extractor.language)) {
			configLanguages = config.extractor.language;
		} else {
			configLanguages = [];
		}

		const langChecker = spawnSync('tesseract', ['--list-langs'], {
			cwd: process.cwd(),
			encoding: 'utf-8',
			env: process.env,
			stdio: 'pipe',
		});

		if (langChecker.error || !Array.isArray(langChecker.output)) {
			throw new Error(
				`tesseract --list-langs failed. Is tesseract correctly installed?.\n${langChecker.error}`,
			);
		}

		const langs: string[][] = langChecker.output
			.filter(value => value !== null)
			.map(value => value.split(/\r?\n/));
		const langsFlat: string[] = [].concat.apply([], langs);

		const validLanguages: string[] = configLanguages.filter(lang => langsFlat.includes(lang));

		if (validLanguages.length === 0) {
			logger.info(
				`the configuration is set to ${configLanguages}, but none of them are available on the system.`,
			);
			logger.info('Defaulting to english (eng)');
			validLanguages.push('eng');
		}

		const tesseractLanguages = validLanguages.map(lang => lang.trim()).join('+');

		/**
		 * From man page
		 * @param l The language to use. If none is specified, English is assumed.
		 * Multiple languages may be specified, separated by plus characters.
		 * Tesseract uses 3-character ISO 639-2 language codes.
		 */
		const tesseract = spawn('tesseract', [
			'-l',
			tesseractLanguages,
			imageInputFile,
			tsvOutputFile,
			'tsv',
		]);
		logger.debug(
			`tesseract ${['-l', tesseractLanguages, imageInputFile, tsvOutputFile, 'tsv'].join(' ')}`,
		);

		tesseract.stdout.on('data', data => {
			logger.debug('tesseract:', data.toString());
		});

		// Tesseract spits out status information on stderr
		tesseract.stderr.on('data', data => {
			logger.debug('tesseract:', data.toString().trim());
		});

		tesseract.on('close', code => {
			if (code === 0) {
				logger.info('Reading tsv file...');

				const tsvContent: string = fs.readFileSync(tsvOutputFile + '.tsv', 'utf-8');
				const tsvOut: TsvElement[] = TSV.parse(tsvContent);
				const pages: Page[] = [];

				tsvOut.forEach((elem: TsvElement) => {
					if (typeof elem.text === 'undefined' || elem.text === '') {
						return;
					}

					const word: Word = new Word(
						new BoundingBox(elem.left, elem.top, elem.width, elem.height),
						String(elem.text),
						new Font('Arial', 12), // TODO Proper font size
					);

					word.confidence = elem.conf;

					while (pages.length < elem.page_num) {
						const page: Page = new Page(
							elem.page_num,
							[],
							new BoundingBox(0, 0, 10000, 10000), // This is set by the setPageDimension module
						);
						pages.push(page);
					}

					pages[elem.page_num - 1].elements.push(word);
				});

				logger.info('Assigning object...');
				const doc: Document = new Document(pages);
				logger.debug('Done');
				resolve(doc);
			} else {
				reject(`tesseract return code is ${code}`);
			}
		});
	});
}
