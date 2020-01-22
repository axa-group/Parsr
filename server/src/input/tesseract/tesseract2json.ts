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

import * as fs from 'fs';
import { Config } from '../../types/Config';
import { BoundingBox, Document, Font, Page, Word } from '../../types/DocumentRepresentation';
import { TsvElement } from '../../types/TsvElement';
import * as utils from '../../utils';
import logger from '../../utils/Logger';

/**
 * Executes the tesseract to json conversion module, which entails calling
 * @param imageInputFile The input image file to be executed using the tesseract OCR tool.
 * @param config The input configuration for tesseract.
 * @returns The promise of a valid Document (as in the Document Representation data structure).
 */
export function execute(imageInputFile: string, config: Config): Promise<Document> {
  return new Promise<Document>(async (resolve, reject) => {
    const tsvOutputFile: string = utils.getTemporaryFile('.json');

    let configLanguages: string[];

    if (typeof config.extractor.language === 'string') {
      configLanguages = [config.extractor.language];
    } else if (Array.isArray(config.extractor.language)) {
      configLanguages = config.extractor.language;
    } else {
      configLanguages = [];
    }

    const langChecker = utils.spawnSync('tesseract', ['--list-langs'], {
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
    const tesseract = utils.spawn('tesseract', [
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
        const tsvOut: TsvElement[] = parseTsv(tsvContent);
        const pages: Page[] = [];

        tsvOut.forEach((elem: TsvElement) => {
          if (typeof elem.text === 'undefined' || elem.text === '') {
            return;
          }

          const word: Word = new Word(
            new BoundingBox(elem.left, elem.top, elem.width, elem.height),
            String(elem.text),
            // Tesseract doesn't provide font information then we use a undefined font
            // that will be ignored in viewer and will calculate 'proper' font size
            // using word bounds height
            new Font('undefined', elem.height * 1.6),
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

        logger.debug(`Assigning a total of ${pages.length} pages to the document...`);
        const doc: Document = new Document(pages, imageInputFile);
        logger.debug(
          `The new document contains ${
            doc.getElementsOfType(Word, false).length
          } words at extraction.`,
        );
        resolve(doc);
      } else {
        reject(`tesseract return code is ${code}`);
      }
    });
  });
}

function parseTsv(tsv: string): TsvElement[] {
  const lines: string[] = tsv.split(/\r?\n/).filter(line => line.length !== 0);

  const headers: string[] = lines.shift().split('\t');

  return lines.map(line => {
    const record: object = {};

    line.split('\t').forEach((field, i) => {
      record[headers[i]] = field;
    });

    return new TsvElement(record);
  });
}
