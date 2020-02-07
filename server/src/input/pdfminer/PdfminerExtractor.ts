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

import * as path from 'path';
import { Document } from '../../types/DocumentRepresentation';
import * as utils from '../../utils';
import { CommandExecuter } from '../../utils';
import logger from '../../utils/Logger';
import { extractImagesAndFonts } from '../extractImagesFonts';
import { Extractor } from '../Extractor';
import * as pdfminer from './pdfminer';

/**
 * The extractor is responsible to extract every possible information
 * from the PDF File and store it in the Json file.
 * It also ensure that the Json file is correctly formated and contains all the needed
 * information in a clever way.
 */
export class PdfminerExtractor extends Extractor {
  public async run(inputFile: string): Promise<Document> {
    return utils.repairPdf(inputFile).then((repairedPdf: string) => {
      return this.pageNumber(repairedPdf).then(totalPages => {
        logger.info(
          'Extracting contents (' +
            totalPages.toString() +
            " pages) with pdfminer's pdf2txt.py tool...",
        );
        const startTime: number = Date.now();
        const extractFont = extractImagesAndFonts(repairedPdf);
        const pdfminerExtract = this.extractFile(repairedPdf, 1, 500, totalPages);
        return Promise.all([pdfminerExtract, extractFont]).then(
          ([doc, assetsFolder]: [Document, string]) => {
            doc.assetsFolder = assetsFolder;
            doc.inputFile = repairedPdf;
            const totalSeconds = (Date.now() - startTime) / 1000;
            logger.info(
              `Total PdfMiner (${totalPages.toString()}) time: ${totalSeconds} sec - ${totalSeconds /
                60} min`,
            );
            return doc;
          },
        );
      });
    });
  }

  private async pageNumber(inputFile: string): Promise<number> {
    const args: string[] = [path.join(__dirname, '../../../assets/PdfPageNumber.py'), inputFile];
    try {
      const data = await CommandExecuter.run(CommandExecuter.COMMANDS.PYTHON, args);
      return parseInt(data, 10);
    } catch ({ error }) {
      logger.error(`Error reading pdf total page number... ${error}`);
    }
    return null;
  }

  private async extractFile(
    inputFile: string,
    pageIndex: number,
    maxPages: number,
    totalPages: number,
    document: Document = new Document([]),
  ): Promise<Document> {
    const fromPage = (pageIndex - 1) * maxPages;
    const toPage = pageIndex * maxPages - 1;
    const pages = [...Array(maxPages).keys()]
      .map(el => el + fromPage + 1)
      .filter(el => el <= totalPages)
      .join(',');

    return pdfminer
      .extractPages(inputFile, pages)
      .then((xmlOutputFile: string) => pdfminer.xmlParser(xmlOutputFile))
      .then((json: any) => pdfminer.jsParser(json))
      .then((doc: Document) => {
        document.pages = document.pages.concat(doc.pages);
        document.pages.forEach((page, index) => (page.pageNumber = index + 1));
        if (totalPages > toPage + 1) {
          return this.extractFile(inputFile, pageIndex + 1, maxPages, totalPages, document);
        } else {
          return document;
        }
      });
  }
}
