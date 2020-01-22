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

import { BoundingBox, Document, Element, Paragraph, TableOfContents, Word } from '../../types/DocumentRepresentation';
import logger from '../../utils/Logger';
import { Module } from '../Module';

export class TableOfContentsDetectionModule extends Module {
  public static moduleName = 'table-of-contents-detection';

  private intersectionBoxWidthPercentage = 0.1;
  private detectionThreshold = 0.4;

  public main(doc: Document): Document {
    doc.pages.forEach((page, i) => {
      const allParagraphs = page.getElementsOfType<Paragraph>(Paragraph, false)
      .filter(e => !e.properties.isFooter && !e.properties.isHeader);
      logger.info('---------- page '.concat((i + 1).toString(), ' ----------'));
      logger.info('all paragraphs: '.concat(allParagraphs.map(p => p.id).join(', ')));
      const tocItemCandidates = allParagraphs.filter(this.endsWithNumber.bind(this));
      logger.info('tocItemCandidates: '.concat(tocItemCandidates.map(t => t.id).join(', ')));
      logger.info('page elements: '.concat(page.elements.map(e => e.id).join(', ')));
      logger.info('----------------------------');
      if (tocItemCandidates.length >= allParagraphs.length * this.detectionThreshold) {
        const tocItems: Element[] = [];
        const toc = new TableOfContents();
        tocItems.push(...tocItemCandidates);
        toc.content = tocItems;
        page.elements = page.elements.filter(e => !tocItemCandidates.map(t => t.id).includes(e.id));
        page.elements.push(toc);
      }
    });
    return doc;
  }

  private endsWithNumber(e: Paragraph): boolean {
    const w = e.width * this.intersectionBoxWidthPercentage;
    const intersectionBox = new BoundingBox(e.right - w, e.top, w, e.height);
    const wordsInsideIntersection =
      e.getWords()
        .filter(word => BoundingBox.getOverlap(word.box, intersectionBox).box1OverlapProportion > 0.9)
        .filter(word => !this.isSeparator(word));

    return wordsInsideIntersection.filter(this.isNumber).length > Math.floor(wordsInsideIntersection.length * 0.9);
  }

  private isNumber(word: Word): boolean {
    // decimal and roman notation
    const validNumbers = new RegExp(/^[0-9IVXLCDMivxlcdm]+$/);
    return validNumbers.test(word.toString());
  }

  private isSeparator(word: Word): boolean {
    const separators = new RegExp(/^[-. ]+$/);
    return separators.test(word.toString().trim());
  }
}
