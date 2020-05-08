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
// import logger from '../../utils/Logger';

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
    return checkNumbers(wordsInsideIntersectionRight, wordsInsideIntersectionLeft);
  },
  hasPageNKeyword: (p: Paragraph, pageKeywords: string[]): boolean => {
    const regexp = `^(${pageKeywords.join('|')}).* (\\d+) (.+)`;
    return new RegExp(regexp, 'gi').test(p.toString());
  },
};
function checkNumbers(wordsRight: Word[], wordsLeft: Word[]): boolean {
  const integerNum = new RegExp(/^\d+$/);
  const romanNumbers = new RegExp(/^[ivxlcdm]+$/i);
  let intLengthRight = 0;
  let intLengthLeft = 0;
  const integersStrRight = [];
  const integersStrLeft = [];
  wordsRight.forEach(word => {
    const wd = word.toString();
    if (integerNum.test(wd)) {
      integersStrRight.push(wd);
      intLengthRight += 1;
    } else if (romanNumbers.test(wd)) {
      intLengthRight += 1;
    }
  });
  if (intLengthRight > Math.floor(wordsRight.length * 0.5)) {
    for (let j = 1; j < integersStrRight.length - 1; j++) {
      if (Number(integersStrRight[j]) < Number(integersStrRight[j - 1])) {
        return false;
      }
    }
    return true;
  }
  wordsLeft.forEach(word => {
    const wd = word.toString();
    if (integerNum.test(wd)) {
      integersStrLeft.push(wd);
      intLengthLeft += 1;
    } else if (romanNumbers.test(wd)) {
      intLengthLeft += 1;
    }
  });
  if (intLengthLeft > Math.floor(wordsLeft.length * 0.5)) {
    for (let j = 1; j < integersStrLeft.length - 1; j++) {
      if (Number(integersStrLeft[j]) < Number(integersStrLeft[j - 1])) {
        return false;
      }
    }
    return true;
  }
  return false;
}

// function enoughNumber(
//   intLenRight: number,
//   wdRight: Word[],
//   intLenLeft: number,
//   wdLeft: Word[],
// ): boolean {
//   return (
//     intLenRight > Math.floor(wdRight.length * 0.5) || intLenLeft > Math.floor(wdLeft.length * 0.5)
//   );
// }

// function isNumber(word: Word): boolean {
//   const integerNumbers = new RegExp(/^\d+$/);
//   const romanNumbers = new RegExp(/^[ivxlcdm]+$/i);
//   const w = word.toString();
//   logger.info('Word= ' + w + ' Is_number= ' + integerNumbers.test(w));

//   return integerNumbers.test(w) || romanNumbers.test(w);
// }

function isSeparator(word: Word): boolean {
  const separators = new RegExp(/^[-. ]+$/);

  return separators.test(word.toString().trim());
}

export function hasKeyword(pageParagraphs: Paragraph[], keywords: string[]): boolean {
  const rawText = pageParagraphs.map(p => p.toString()).join(' ');
  return keywords.some(k => rawText.toLowerCase().includes(k.toLowerCase()));
}
