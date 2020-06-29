/**
 * Copyright 2020 AXA Group Operations S.A.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use file except in compliance with the License.
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

import { BoundingBox, Paragraph, Word, Line } from './../../types/DocumentRepresentation';

export const threshold = 0.4;

const arabicRegexp = /[0-9]+(\.[0-9]+)?( |$)/g;
const romanRegexp = /(?=[MDCLXVI])M*(C[MD]|D?C{0,3})(X[CL]|L?X{0,3})(I[XV]|V?I{0,3})( |$)/gi;

export function TOCDetected(allParagraphs: Paragraph[], pageKeywords: string[]): Paragraph[] {
  let tocCandidates: Paragraph[] = [];
  let tocParagraphs: Paragraph[] = [];
  let tocIntegerRight: Word[] = [];
  let tocRomanNumberRight: Word[] = [];
  let tocIntegerLeft: Word[] = [];

  if (allParagraphs.length > 0) {
    const { right, left, roman, candidates } = storeNumAndRomanNum(allParagraphs, pageKeywords);
    tocIntegerRight = findTocNumber(right);
    tocRomanNumberRight = findTocRomanNumber(roman);
    tocIntegerLeft = findTocNumber(left);
    tocCandidates = candidates;
  }

  findTocPara(tocCandidates, tocIntegerRight, tocParagraphs);
  findTocPara(tocCandidates, tocRomanNumberRight, tocParagraphs);
  findTocPara(tocCandidates, tocIntegerLeft, tocParagraphs);

  tocParagraphs.forEach(paragraph => {
    paragraph.content.forEach(line => {
      if (line.content.length === 1) {
        completeTocLine(tocParagraphs, allParagraphs, line);
      }
    });
  });
  tocCandidates.forEach(function(candidate) {
    if (
      new RegExp(`^(${pageKeywords.join('|')}).* (\\d+) (.+)`, 'gi').test(candidate.toString()) &&
      tocParagraphs.indexOf(candidate) === -1
    ) {
      tocParagraphs.push(candidate);
    }
  });
  return tocParagraphs;
}
/*
  - Searches for text starting or finishing in numbers in the Left or right 10% width area of the BBox,
    then store them by alignment.
  - Searches for text containing pagekeywords following by a digit.
*/
function storeNumAndRomanNum(
  allParagraphs: Paragraph[],
  pageKeywords: string[],
): { right: Word[][]; left: Word[][]; roman: Word[][]; candidates: Paragraph[] } {
  let numberRight: Word[][] = [];
  let numberLeft: Word[][] = [];
  let romanNumberRight: Word[][] = [];
  let paragraphsCandidates: Paragraph[] = [];

  for (const paragraph of allParagraphs) {
    const w = paragraph.width * 0.1;
    const intersectionBoxRight = new BoundingBox(
      paragraph.right - w,
      paragraph.top,
      w,
      paragraph.height,
    );
    const intersectionBoxLeft = new BoundingBox(paragraph.left, paragraph.top, w, paragraph.height);
    const numbersInsideIntersectionRight = paragraph
      .getWords()
      .filter(
        word => BoundingBox.getOverlap(word.box, intersectionBoxRight).box1OverlapProportion > 0,
      )
      .filter(word => !isSeparator(word));
    const numbersInsideIntersectionLeft = paragraph
      .getWords()
      .filter(
        word => BoundingBox.getOverlap(word.box, intersectionBoxLeft).box1OverlapProportion > 0,
      )
      .filter(word => !isSeparator(word));
    if (
      numbersInsideIntersectionRight.filter(isNumberRight).length >
        Math.floor(numbersInsideIntersectionRight.length * 0.5) ||
      numbersInsideIntersectionLeft.filter(isNumberLeft).length >
        Math.floor(numbersInsideIntersectionLeft.length * 0.5) ||
      hasPageNKeyword(paragraph, pageKeywords) === true
    ) {
      paragraphsCandidates.push(paragraph);
      numbersInsideIntersectionRight.forEach(word => {
        if (word.toString().match(arabicRegexp)) {
          addAlignedNumberRight(numberRight, word);
        } else if (word.toString().match(romanRegexp)) {
          addAlignedNumberRight(romanNumberRight, word);
        }
      });
      numbersInsideIntersectionLeft.forEach(word => {
        if (word.toString().match(arabicRegexp)) {
          addAlignedNumberLeft(numberLeft, word);
        } else if (word.toString().match(romanRegexp)) {
          addAlignedNumberRight(romanNumberRight, word);
        }
      });
    }
  }
  return {
    right: sortBoxNumber(numberRight),
    left: sortBoxNumber(numberLeft),
    roman: sortBoxNumber(romanNumberRight),
    candidates: paragraphsCandidates,
  };
}

function isNumberRight(word: Word): boolean {
  const decimalNumbers = new RegExp(arabicRegexp);
  const romanNumbers = new RegExp(romanRegexp);
  const w = word.toString();
  return decimalNumbers.test(w) || romanNumbers.test(w);
}

function isNumberLeft(word: Word): boolean {
  const decimalNumbers = new RegExp(arabicRegexp);
  const w = word.toString();
  return decimalNumbers.test(w);
}

function isSeparator(word: Word): boolean {
  const separators = new RegExp(/^[-. ]+$/);
  return separators.test(word.toString().trim());
}

function hasPageNKeyword(p: Paragraph, pageKeywords: string[]): boolean {
  const regexp = `^(${pageKeywords.join('|')}).* (\\d+) (.+)`;
  return new RegExp(regexp, 'gi').test(p.toString());
}

function addAlignedNumberRight(storeBoxNumber: Word[][], number: Word) {
  const indexValueExist = storeBoxNumber.findIndex(
    aNum =>
      (aNum[0].box.left + aNum[0].box.width - 5 <= number.box.left + number.box.width &&
        aNum[0].box.left + aNum[0].box.width + 10 >= number.box.left + number.box.width) ||
      (aNum[0].box.left + aNum[0].box.width - 20 <= number.box.left &&
        aNum[0].box.left + aNum[0].box.width - 5 >= number.box.left),
  );
  if (indexValueExist !== -1 && storeBoxNumber[indexValueExist].indexOf(number) === -1) {
    storeBoxNumber[indexValueExist].push(number);
  } else if (indexValueExist === -1) {
    storeBoxNumber.push([number]);
  }
}

function addAlignedNumberLeft(storeBoxNumberLeft: Word[][], number: Word) {
  const indexValueExist = storeBoxNumberLeft.findIndex(
    aNum =>
      aNum[0].box.left - 15 <= number.box.left &&
      aNum[0].box.left + 15 >= number.box.left + number.box.width,
  );
  if (indexValueExist !== -1) {
    storeBoxNumberLeft[indexValueExist].push(number);
  } else {
    storeBoxNumberLeft.push([number]);
  }
}

function sortBoxNumber(storeBoxNumber: Word[][]) {
  storeBoxNumber.sort(function(a, b) {
    return b.length - a.length;
  });
  for (let boxes of storeBoxNumber) {
    boxes.sort(function(a, b) {
      return a.box.top - b.box.top;
    });
  }
  return storeBoxNumber;
}

/*
  Searches for a good rate of integer number,
  then searches for a good rate of integer in ascending order
*/
function findTocNumber(storeBoxNumber: Word[][]): Word[] {
  let nbOfNumber: number;
  let storedInteger: number[] = [];
  let nbOfIntegerInOrder = 0;
  for (let box of storeBoxNumber) {
    nbOfNumber = box.length;
    for (const word of box) {
      let num = Number(word.toString().match(arabicRegexp));
      if (Number.isInteger(num)) {
        storedInteger.push(num);
      }
    }
    if (storedInteger.length / nbOfNumber > 0.75) {
      nbOfIntegerInOrder = findIntegerAscendingOrder(storedInteger);
      if (nbOfIntegerInOrder / storedInteger.length > 0.75) {
        return box;
      }
    }
  }
  return null;
}

/*
  Searches for a good rate of roman number in ascending order.
*/
function findTocRomanNumber(storeBoxNumber: Word[][]): Word[] {
  let storedRomanNbInteger: number[] = [];
  let nbOfRomanNbIntegerInOrder = 0;
  for (let box of storeBoxNumber) {
    for (const word of box) {
      storedRomanNbInteger.push(Number(romanToArabic(word.toString().match(romanRegexp))));
    }
    nbOfRomanNbIntegerInOrder = findIntegerAscendingOrder(storedRomanNbInteger);
    if (nbOfRomanNbIntegerInOrder / storedRomanNbInteger.length > 0.75) {
      return box;
    }
  }
  return null;
}

function romanToArabic(romanNumber) {
  romanNumber = romanNumber[0].toUpperCase();
  const romanNumList = ['CM', 'M', 'CD', 'D', 'XC', 'C', 'XL', 'L', 'IX', 'X', 'IV', 'V', 'I'];
  const corresp = [900, 1000, 400, 500, 90, 100, 40, 50, 9, 10, 4, 5, 1];
  let index = 0,
    num = 0;
  for (let rn in romanNumList) {
    index = romanNumber.indexOf(romanNumList[rn]);
    while (index != -1) {
      num += corresp[rn];
      romanNumber = romanNumber.replace(romanNumList[rn], '-');
      index = romanNumber.indexOf(romanNumList[rn]);
    }
  }
  return num;
}

function findIntegerAscendingOrder(storedInteger: number[]): number {
  let maxIntegerInOrder = 0;
  let iStart = 0;
  let nbIntegerInOrder = 1;
  while (iStart < storedInteger.length / 3 && maxIntegerInOrder < storedInteger.length * 0.7) {
    let step = 1;
    let iLastInOrder = iStart;
    let iCompare = iLastInOrder + step;

    while (iCompare < storedInteger.length) {
      if (storedInteger[iCompare] >= storedInteger[iLastInOrder]) {
        nbIntegerInOrder++;
        iLastInOrder = iCompare;
        step = 0;
      }
      step++;
      iCompare = iLastInOrder + step;
    }
    if (nbIntegerInOrder > maxIntegerInOrder) {
      maxIntegerInOrder = nbIntegerInOrder;
    }
    iStart++;
    nbIntegerInOrder = 1;
  }
  return maxIntegerInOrder;
}

/*
  Searches for the parents paragraphs containing TOC numbers.
*/
function findTocPara(tocCandidatesParagraphs: Paragraph[], tocInteger: Word[], tocParagraphs: Paragraph[]){
  if (!tocInteger || tocInteger.length < 2) {
    return ;
  }
  for (let i = 0; i < tocCandidatesParagraphs.length; i++) {
    for (let j = 0; j < tocCandidatesParagraphs[i].content.length; j++) {
      for (let integer of tocInteger) {
        if (
          tocCandidatesParagraphs[i].content[j].content.find(word => word.id === integer.id) &&
          containsObject(tocCandidatesParagraphs[i], tocParagraphs) === false
        ) {
          tocParagraphs.push(tocCandidatesParagraphs[i]);
          break;
        }
      }
    }
  }
}

function containsObject(obj, list) {
  var i;
  for (i = 0; i < list.length; i++) {
    if (list[i].id === obj.id) {

      return true;
    }
  }
  return false;
}

/*
  Searches for paragraphs aligned with alone TOC number (cases with no leaders).
*/
function completeTocLine(tocParagraphs: Paragraph[], allParagraphs: Paragraph[], line: Line) {
  for (let i = 0; i < allParagraphs.length; i++) {
    if (
      allParagraphs[i].content.find(
        oneLine =>
          oneLine.box.top >= line.box.top - 1 &&
          oneLine.box.top <= line.box.top + 1 &&
          !tocParagraphs.includes(allParagraphs[i]),
      )
    ) {
      if (allParagraphs[i].left < line.box.left) {
        tocParagraphs.unshift(allParagraphs[i]);
      } else {
        tocParagraphs.push(allParagraphs[i]);
      }
    }
  }
}
