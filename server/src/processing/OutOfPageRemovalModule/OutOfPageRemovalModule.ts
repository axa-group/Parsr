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

import { BoundingBox, Document, Element, Page, Text } from '../../types/DocumentRepresentation';
import * as utils from '../../utils';
import { Module } from '../Module';

/**
 * Stability: Stable
 * Remove any elements that are strictly out of the page.
 * Items that overlap with the side of the page will be kept.
 */
export class OutOfPageRemovalModule extends Module {
  public static moduleName = 'out-of-page-removal';

  public main(doc: Document): Document {
    const isInBox = (element: Text, page: Page) => {
      if (page.pageRotation != null && page.pageRotation.degrees !== 0) {
        // When a page is rotated we hace to use rotated page box instead of page box
        const rotatedBox = new BoundingBox(
          0,
          0,
          page.pageRotation.origin.x * 2,
          page.pageRotation.origin.y * 2,
        );
        return utils.isInBox(element, rotatedBox, true);
      } else {
        return utils.isInBox(element, page.box, true);
      }
    };
    doc.pages.forEach((page: Page) => {
      page.elements = page.elements.filter((element: Element) => {
        return !(element instanceof Text) || isInBox(element, page);
      });
    });

    return doc;
  }
}
