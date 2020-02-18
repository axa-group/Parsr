/**
 * Copyright 2020 AXA Group Operations S.A.
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
import * as limit from 'limit-async';
import { Character, Document, Page } from '../../types/DocumentRepresentation';
import * as CommandExecuter from '../../utils/CommandExecuter';
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
    return CommandExecuter.repairPdf(inputFile).then((repairedPdf: string) => {
      return this.pageNumber(repairedPdf).then(totalPages => {
        let loggerMsg = "Extracting contents with pdfminer's pdf2txt.py tool...";
        if (totalPages != null) {
          loggerMsg = `Extracting contents (${totalPages.toString()} pages) with pdfminer's pdf2txt.py tool...`;
        }
        logger.info(loggerMsg);
        const startTime: number = Date.now();
        const extractFont = extractImagesAndFonts(repairedPdf);
        const pdfminerExtract = this.extractFile(repairedPdf, 1, 500, totalPages);
        return Promise.all([pdfminerExtract, extractFont]).then(
          ([doc, assetsFolder]: [Document, string]) => {
            doc.assetsFolder = assetsFolder;
            doc.inputFile = repairedPdf;
            const totalSeconds = (Date.now() - startTime) / 1000;
            logger.info(
              `Total PdfMiner ${
              totalPages != null ? '(' + totalPages.toString() + ')' : ''
              } time: ${totalSeconds} sec - ${totalSeconds / 60} min`,
            );
            return doc;
          },
        );
      });
    });
  }

  private async pageNumber(inputFile: string): Promise<number> {
    return CommandExecuter.pdfPagesNumber(inputFile)
      .then(pages => {
        return parseInt(pages, 10);
      })
      .catch(({ error }) => {
        logger.error(`Error reading pdf total page number... ${error}`);
        return null;
      });
  }

  private async extractFile(
    inputFile: string,
    pageIndex: number,
    maxPages: number,
    totalPages: number,
    document: Document = new Document([]),
  ): Promise<Document> {
    const toPage = pageIndex * maxPages - 1;
    const extractPages = this.pagesToExtract(pageIndex, maxPages, totalPages);
    return pdfminer
      .extractPages(inputFile, totalPages != null ? extractPages : null)
      .then(pdfminer.xmlParser)
      .then(pdfminer.jsParser)
      .then(this.detectAndFixPageRotation(inputFile))
      .then((doc: Document) => {
        document.pages = document.pages.concat(doc.pages);
        document.pages.forEach((page, index) => (page.pageNumber = index + 1));
        if (totalPages != null && totalPages > toPage + 1) {
          return this.extractFile(inputFile, pageIndex + 1, maxPages, totalPages, document);
        } else {
          return document;
        }
      });
  }

  private async rotatePages(doc: Document, pages: number[], rotation: number): Promise<Document> {
    logger.info(`pages ${pages.join(', ')} will be reprocessed with a rotation angle of ${rotation} degrees`);

    const fixedDoc: Document = await pdfminer
      .extractPages(doc.inputFile, pages.join(','), rotation)
      .then(pdfminer.xmlParser)
      .then(pdfminer.jsParser);

    pages.forEach(pageNumber => {
      doc.pages[pageNumber - 1] = fixedDoc.pages[pages.indexOf(pageNumber)];
    });
    return doc;
  }

  private detectAndFixPageRotation(inputFile: string): (doc: Document) => Promise<Document> {
    const limiter = limit(1);
    return async (doc: Document): Promise<Document> => {
      doc.inputFile = inputFile;
      const startTime: number = Date.now();
      const pageRotations = doc.pages.map(this.getPageRotation).reduce(this.groupByRotation, {});
      const promises = Object.keys(pageRotations)
        .filter(r => r !== '0')
        .map(rotation => limiter(this.rotatePages)(doc, pageRotations[rotation], rotation));

      await Promise.all(promises);
      logger.info(`Page rotation detection and correction finished in ${(Date.now() - startTime) / 1000}s`);
      return doc;
    };
  }

  private getPageRotation(page: Page): number {
    const rotations = page.elements.map((word) => {
      if (Array.isArray(word.content) && word.content.length > 1) {
        const { left: x1, bottom: y1 } = word.content[0] as Character;
        const { left: x2, bottom: y2 } = word.content[word.content.length - 1] as Character;
        const arcTan = Math.round(Math.atan((y1 - y2) / (x1 - x2)) * 180 / Math.PI);
        return arcTan === 0 ? (x1 < x2 ? 0 : 180) : arcTan;
      }
      return 0;
    });

    const elementsPerRotation = rotations.reduce((acc, value) => {
      acc[value] = acc[value] || 0;
      acc[value] += 1;
      return acc;
    }, {});

    const highestValue: number = Math.max(...(Object.values(elementsPerRotation) as number[]));
    const mainRotation = Object.keys(elementsPerRotation).find(k => elementsPerRotation[k] === highestValue);
    return parseInt(mainRotation, 10);
  }

  private groupByRotation(acc, value, index): any {
    acc[value] = acc[value] || [];
    acc[value].push(index + 1);
    return acc;
  }

  private pagesToExtract(pageIndex: number, maxPages: number, totalPages: number) {
    const fromPage = (pageIndex - 1) * maxPages;
    return [...Array(maxPages).keys()]
      .map(el => el + fromPage + 1)
      .filter(el => el <= totalPages)
      .join(',');
  }
}
