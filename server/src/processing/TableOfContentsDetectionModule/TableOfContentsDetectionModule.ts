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

import { BoundingBox, Document, Heading, Paragraph, TableOfContents, Word } from '../../types/DocumentRepresentation';
import { Module } from '../Module';

export class TableOfContentsDetectionModule extends Module {
  public static moduleName = 'table-of-contents-detection';

  private intersectionBoxWidthPercentage = 0.1;
  private detectionThreshold = 0.4;

  // TODO maybe handle this in a different way
  private tocKeywords = [
    'contents',
    'index',
    'table of contents',
    'contenidos',
    'indice',
    'índice',
    'tabla de contenidos',
  ];

  public main(doc: Document): Document {
    let foundTOC = false;
    let previousPageHadTOC = true;
    for (let i = 0; i <= doc.pages.length - 1 && (!foundTOC || previousPageHadTOC); i++) {
      const page = doc.pages[i];

      const allParagraphs = page.getElementsOfType<Paragraph>(Paragraph, false)
        .filter(e => !e.properties.isFooter && !e.properties.isHeader);
      const tocItemCandidates = allParagraphs.filter(this.endsWithNumber.bind(this));

      /*
        - if the page doesn't have any 'TOC' keywords, the detection threshold is increased to avoid false positives.
      */
      const headings = allParagraphs.filter(p => p instanceof Heading);
      if (
        tocItemCandidates.length > 0 &&
        tocItemCandidates.length >=
        Math.floor(allParagraphs.length * this.detectionThreshold * (this.hasKeyword(headings) ? 1 : 2))
      ) {
        foundTOC = true;
        const toc = new TableOfContents();
        toc.content = tocItemCandidates;
        page.elements = page.elements.filter(e => !tocItemCandidates.map(t => t.id).includes(e.id));
        page.elements.push(toc);
      } else {
        previousPageHadTOC = false;
      }
    }

    return doc;
  }

  private endsWithNumber(e: Paragraph): boolean {
    const w = e.width * this.intersectionBoxWidthPercentage;
    const intersectionBox = new BoundingBox(e.right - w, e.top, w, e.height);
    const wordsInsideIntersection =
      e.getWords()
        .filter(word => BoundingBox.getOverlap(word.box, intersectionBox).box1OverlapProportion > 0)
        .filter(word => !this.isSeparator(word));

    return wordsInsideIntersection.filter(this.isNumber).length > Math.floor(wordsInsideIntersection.length * 0.8);
  }

  private isNumber(word: Word): boolean {
    const decimalNumbers = new RegExp(/[0-9]+$/);
    const romanNumbers = new RegExp(/^[ivxlcdmIVXLCDM]+$/);
    const w = word.toString();
    return decimalNumbers.test(w) || romanNumbers.test(w);
  }

  private isSeparator(word: Word): boolean {
    const separators = new RegExp(/^[-. ]+$/);
    return separators.test(word.toString().trim());
  }

  private hasKeyword(pageParagraphs: Paragraph[]): boolean {
    const rawText = pageParagraphs.map(p => p.toString()).join(' ');
    return this.tocKeywords.some(k => rawText.toLowerCase().includes(k.toLowerCase()));
  }
}
