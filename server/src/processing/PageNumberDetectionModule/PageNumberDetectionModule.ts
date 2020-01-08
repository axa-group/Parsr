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

import {
  BoundingBox,
  Document,
  Element,
  Paragraph,
  Text,
} from '../../types/DocumentRepresentation';
import * as utils from '../../utils';
import logger from '../../utils/Logger';
import { HeaderFooterDetectionModule } from '../HeaderFooterDetectionModule/HeaderFooterDetectionModule';
import { Module } from '../Module';

export class PageNumberDetectionModule extends Module {
  public static moduleName = 'page-number-detection';
  public static dependencies = [HeaderFooterDetectionModule];

  public main(doc: Document): Document {
    const alreadyExist: boolean =
      doc.pages.some(p => p.elements.some(e => e.properties.isPageNumber));

    if (alreadyExist) {
      logger.warn(
        'Not doing page number detection: page number data already exist.',
      );
      return doc;
    }

    doc.pages.forEach(page => {
      const headerElements: Element[] = page.getElementsSubset(
        new BoundingBox(0, 0, page.width, doc.margins.top),
      );

      const footerElements: Element[] = page.getElementsSubset(
        new BoundingBox(0, doc.margins.bottom, page.width, page.height - doc.margins.bottom),
      );

      for (const element of footerElements) {
        element.properties.isFooter = true;
        if (element instanceof Paragraph && isPageNumber(element)) {
          element.properties.isPageNumber = true;
        }
      }

      for (const element of headerElements) {
        element.properties.isHeader = true;
        if (element instanceof Paragraph && isPageNumber(element)) {
          element.properties.isPageNumber = true;
        }
      }
    });
    logger.debug('Done with page number detection.');
    return doc;

    /**
     * Checks if a text is a page number using a regexp matching.
     * @param text The text entity in question
     */
    function isPageNumber(text: Text): boolean {
      const match = text.toString().match(utils.getPageRegex());
      let pageNumber: string;
      if (!match) {
        return false;
      }

      for (let i = 1; i < match.length; i++) {
        if (match[i]) {
          pageNumber = match[i];
        }
      }

      return pageNumber && pageNumber !== '';
    }
  }
}
