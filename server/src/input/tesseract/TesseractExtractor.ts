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
import * as path from 'path';
import { Document } from '../../types/DocumentRepresentation';
import * as utils from '../../utils';
import logger from '../../utils/Logger';
import { Extractor } from '../Extractor';
import { setPageDimensions } from '../set-page-dimensions';
import * as tesseract2json from './tesseract2json';

/**
 * An extractor class to extract content from images using the tesseract OCR extraction tool.
 */
export class TesseractExtractor extends Extractor {
  /**
   * Runs the extraction process, first setting page dimensions, then extracting the document itself.
   * @param inputFile The name of the image to be used at input for the extraction.
   * @returns The promise of a valid Document (as per the Document Representation namespace).
   */
  public async run(inputFile: string, rotationCorrection: boolean = true): Promise<Document> {
    const imagePaths = await this.pdfToImages(inputFile);
    return this.scanPages(imagePaths, rotationCorrection).then((doc: Document) => {
      doc.inputFile = inputFile;
      return doc;
    });
  }

  private scanPage(page: string, fixRotation: boolean): Promise<Document> {
    return tesseract2json
      .execute(page, fixRotation, this.config)
      .then((doc: Document) => setPageDimensions(doc, page));
  }

  private scanPages(
    pages: string[],
    fixRotation: boolean,
    allPagesDoc: Document = new Document([]),
    index: number = 0,
  ): Promise<Document> {
    return this.scanPage(pages[index], fixRotation).then((doc: Document) => {
      allPagesDoc.pages = allPagesDoc.pages.concat(doc.pages);
      allPagesDoc.pages[index].pageNumber = index + 1;
      if (pages.length > index + 1) {
        return this.scanPages(pages, fixRotation, allPagesDoc, index + 1);
      } else {
        return allPagesDoc;
      }
    });
  }

  private pdfToImages(pdfPath: string): Promise<string[]> {
    return new Promise((resolve, reject) => {
      const folder = path.dirname(pdfPath).concat('/samples');
      try {
        if (!fs.existsSync(folder)) {
          fs.mkdirSync(folder);
        }
      } catch (e) {
        throw e;
      }
      const outPutFilePath = folder + '/Sample_%03d.tiff';
      utils.CommandExecuter.run(
        utils.CommandExecuter.COMMANDS.CONVERT,
        [
          '-density',
          '300x300',
          '-compress',
          'lzw',
          '-alpha',
          'remove',
          '-background',
          'white',
          pdfPath,
          outPutFilePath,
        ],
      )
        .then(() => {
          const files = fs.readdirSync(folder).map(file => path.join(folder, file));
          logger.info(`converted files: ${files.join(', ')}`);
          resolve(files);
        })
        .catch(({ found, error }) => {
          logger.error(error);
          if (!found) {
            logger.warn('ImageMagick failure: impossible to convert pdf to images (is ImageMagick installed?)');
          }
          reject(error);
        });
    });
  }
}
