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
import { Extractor } from '../Extractor';
import { setPageDimensions } from '../set-page-dimensions';
import * as tesseract2json from './tesseract2json';

/**
 * An extractor class to extract content from images using the tesseract OCR extraction tool.
 */
export class TesseractExtractor extends Extractor {
  /**
   * Runs the extraction process, first setting page dimentions, then extracting the document itself.
   * @param inputFile The name of the image to be used at input for the extraction.
   * @returns The promise of a valid Document (as per the Document Representation namespace).
   */
  public run(inputFile: string): Promise<Document> {
    return tesseract2json
      .execute(inputFile, this.config)
      .then((doc: Document) => setPageDimensions(doc, inputFile));
  }
}
