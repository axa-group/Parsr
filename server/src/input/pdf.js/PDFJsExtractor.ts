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

import { existsSync, mkdirSync } from 'fs';
import * as limit from 'limit-async';
import { basename, join } from 'path';
import { getDocument } from 'pdfjs-dist';
import { Document, Page } from '../../types/DocumentRepresentation';
import logger from '../../utils/Logger';
import { Extractor } from '../Extractor';
import { getTemporaryDirectory, getTemporaryFile } from './../../utils';
import { repairPdf } from './../../utils/CommandExecuter';
import { loadPage } from './pdfjs';
import { SvgLine } from '../../types/DocumentRepresentation/SvgLine';
import { JsonExporter } from '../../output/json/JsonExporter';

/**
 * The extractor is responsible to extract every possible information
 * from the PDF File and store it in the Json file.
 * It also ensure that the Json file is correctly formated and contains all the needed
 * information in a clever way.
 */
export class PDFJsExtractor extends Extractor {
  public run(inputFile: string): Promise<Document> {
    logger.info('Running extractor PDF.js');
    const startTime: number = Date.now();

    // this is for limiting page fetching to 10 at the same time and avoid memory overflows
    const limiter = limit(10);

    const assetsFolder = join(getTemporaryDirectory(), `assets_${basename(inputFile).replace('.pdf', '')}`);
    if (!existsSync(assetsFolder)) {
      mkdirSync(assetsFolder);
    }

    return new Promise<Document>((resolveDocument, rejectDocument) => {
      return repairPdf(inputFile).then((repairedPdf: string) => {
        const pages: Array<Promise<Page>> = [];
        try {
          return (getDocument(repairedPdf) as any).promise.then(doc => {
            const numPages = doc.numPages;
            for (let i = 0; i < numPages; i += 1) {
              pages.push(limiter(loadPage)(doc, i + 1));
            }
            return Promise.all(pages).then((p: Page[]) => {
              const endTime: number = (Date.now() - startTime) / 1000;
              logger.info(`Elapsed time: ${endTime}s`);
              const doc = new Document(p, repairedPdf, assetsFolder);

              const drawingsDoc = this.moveDrawings(doc);
              const jsonDrawingsFile = getTemporaryFile('.json');
              new JsonExporter(drawingsDoc, 'word').export(jsonDrawingsFile);
              doc.drawingsFile = jsonDrawingsFile;
              resolveDocument(doc);
            });
          });
        } catch (e) {
          return rejectDocument(e);
        }
      }).catch(rejectDocument);
    });
  }

  private moveDrawings(doc: Document): Document {
    const drawingsDoc = new Document([]);
    doc.pages.forEach((p, pageIndex) => {
      const drawingsLines = p.getElementsOfType<SvgLine>(SvgLine);
      drawingsDoc.pages.push(new Page(pageIndex + 1, drawingsLines, p.box));
      doc.pages[pageIndex].elements = doc.pages[pageIndex].elements.filter(e => !(e instanceof SvgLine));
    });
    return drawingsDoc;
  }
}
