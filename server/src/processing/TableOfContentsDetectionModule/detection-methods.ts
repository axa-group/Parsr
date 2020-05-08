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

import { BoundingBox, Paragraph, Word } from './../../types/DocumentRepresentation';
import logger from '../../utils/Logger';

export const threshold = 0.4;

export function TOCDetected(p: Paragraph, pageKeywords: string[]): boolean {
  return Object.values(detectionMethods).some(method => method(p, pageKeywords));
}

const detectionMethods = {
  /*
    searches for text finishing in numbers in the right 10% width area of the BBox
  */
  startOrEndsWithNumber: (p: Paragraph): boolean => {
    const w = p.width * 0.1;
    const intersectionBoxRight = new BoundingBox(p.right - w, p.top, w, p.height);
    const intersectionBoxLeft = new BoundingBox(p.left, p.top, w, p.height);
    const wordsInsideIntersectionRight = p
      .getWords()
      .filter(
        word => BoundingBox.getOverlap(word.box, intersectionBoxRight).box1OverlapProportion > 0,
      )
      .filter(word => !isSeparator(word));
    const wordsInsideIntersectionLeft = p
      .getWords()
      .filter(
        word => BoundingBox.getOverlap(word.box, intersectionBoxLeft).box1OverlapProportion > 0,
      )
      .filter(word => !isSeparator(word));
    return (
      wordsInsideIntersectionRight.filter(isNumber).length >
        Math.floor(wordsInsideIntersectionRight.length * 0.5) ||
      wordsInsideIntersectionLeft.filter(isNumber).length >
        Math.floor(wordsInsideIntersectionLeft.length * 0.5)
    );
  },
  hasPageNKeyword: (p: Paragraph, pageKeywords: string[]): boolean => {
    const regexp = `^(${pageKeywords.join('|')}).* (\\d+) (.+)`;
    return new RegExp(regexp, 'gi').test(p.toString());
  },
};

function isNumber(word: Word): boolean {
  const integerNumbers = new RegExp(/^\d+$/);
  const romanNumbers = new RegExp(/^[ivxlcdm]+$/i);
  const w = word.toString();
  logger.info('Word= ' + w + ' Is_number= ' + integerNumbers.test(w));

  return integerNumbers.test(w) || romanNumbers.test(w);
}

function isSeparator(word: Word): boolean {
  const separators = new RegExp(/^[-. ]+$/);

  return separators.test(word.toString().trim());
}

export function hasKeyword(pageParagraphs: Paragraph[], keywords: string[]): boolean {
  const rawText = pageParagraphs.map(p => p.toString()).join(' ');
  return keywords.some(k => rawText.toLowerCase().includes(k.toLowerCase()));
}
