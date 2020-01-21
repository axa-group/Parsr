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

import { Document } from '../../types/DocumentRepresentation';
import { OcrExtractorFactory } from '../OcrExtractor';
import { setPageDimensions } from '../set-page-dimensions';
import * as tesseract2json from './tesseract2json';

/**
 * An extractor class to extract content from images using the tesseract OCR extraction tool.
 */
export class TesseractExtractor extends OcrExtractorFactory {
  /**
   * Runs the extraction process, first setting page dimensions, then extracting the document itself.
   * @param inputFile The name of the image to be used at input for the extraction.
   * @returns The promise of a valid Document (as per the Document Representation namespace).
   */
  public async run(inputFile: string, rotationCorrection: boolean = true): Promise<Document> {
    if (this.isPdfFile(inputFile)) {
      return this.ocrPDF(inputFile, rotationCorrection);
    }
    return this.scanImage(inputFile);
  }

  public async ocrImage(inputFile: string, fixRotation: boolean): Promise<Document> {
    let rotationCorrection = null;
    const orignalInput = inputFile;
    if (fixRotation) {
      rotationCorrection = await this.correctImageForRotation(inputFile);
      inputFile = rotationCorrection.fileName;
    }

    return tesseract2json
      .execute(inputFile, rotationCorrection, this.config)
      .then((doc: Document) => setPageDimensions(doc, orignalInput));
  }

  private async scanImage(inputFile: string, fixRotation: boolean = true) {
    return this.ocrImages([inputFile], fixRotation).then((doc: Document) => {
      doc.inputFile = inputFile;
      return doc;
    });
  }
}
