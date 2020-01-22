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
    return this.ocrFile(inputFile, rotationCorrection);
  }

  public async scanImage(inputFile: string) {
    return tesseract2json.execute(inputFile, this.config);
  }
}
