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

import { existsSync } from 'fs';
import * as limit from 'limit-async';
import { getDocument } from 'pdfjs-dist';
import { OperatorsManager } from '../../../input/pdf.js/OperatorsManager';
import { Document, Element, Image } from '../../../types/DocumentRepresentation';
import logger from '../../../utils/Logger';
import { ImageExtractor } from './ImageExtractor';

type PageElements = {
  pageNumber: number;
  elements: Element[];
};

export class PdfJsImageExtractor extends ImageExtractor {
  public async run(doc: Document): Promise<void> {
    if (!doc.assetsFolder || !existsSync(doc.assetsFolder)) {
      logger.warn('No assets folder set to document. Skipping image extraction...');
      return;
    }

    const limiter = limit(10);
    const promises: Array<Promise<PageElements>> = [];
    const pdfjsDoc = await getDocument(doc.inputFile).promise;

    const numPages = pdfjsDoc.numPages;
    for (let i = 0; i < numPages; i += 1) {
      promises.push(limiter(this.loadImagesFromPage)(pdfjsDoc, i + 1, doc.assetsFolder));
    }

    return Promise.all(promises).then(pageElements => {
      pageElements.forEach(({ elements, pageNumber }) => {
        const images = elements.filter(e => e instanceof Image);
        logger.debug(`${images.length} images found on page ${pageNumber}`);
        doc.pages[pageNumber - 1].elements.push(...images);
      });
    });
  }

  private async loadImagesFromPage(
    pdfjsDoc: any,
    pageNumber: number,
    assetsFolder: string,
  ): Promise<PageElements> {
    const pdfjsPage = await pdfjsDoc.getPage(pageNumber);
    const opManager = new OperatorsManager(pdfjsPage, {
      extractShapes: false,
      extractText: false,
      extractImages: true,
      assetsFolder,
    });

    const elements = await opManager.processOperators(pageNumber);
    return {
      pageNumber,
      elements,
    };
  }
}
