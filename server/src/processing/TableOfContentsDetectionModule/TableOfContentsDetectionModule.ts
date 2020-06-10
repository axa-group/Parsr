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

import { Document, Paragraph, TableOfContents, BoundingBox } from '../../types/DocumentRepresentation';
import { Module } from '../Module';
import * as defaultConfig from './defaultConfig.json';
import * as detection from './detection-methods';
// import logger from '../../utils/Logger';

interface Options {
  keywords?: string[];
  pageKeywords?: string[];
}

const defaultOptions = (defaultConfig as any) as Options;

let nbRomanNumbers = 0;
export class TableOfContentsDetectionModule extends Module<Options> {
  public static moduleName = 'table-of-contents-detection';

  constructor(options?: Options) {
    super(options, defaultOptions);
  }

  public main(doc: Document): Document {
    let foundTOC = false;
    let pagesSinceLastTOC = 0;
    for (let i = 0; i <= doc.pages.length - 1 && (!foundTOC || pagesSinceLastTOC < 5); i++) {
      const page = doc.pages[i];
      const allParagraphs = page
        .getElementsOfType<Paragraph>(Paragraph, false)
        .filter(this.isNotHeaderFooter);
      let storeLines: any[] = [];
      for (let para of allParagraphs) {
        for (let line of para.content) {
          this.addWordToLine(storeLines, line);
        }
      }
      const parameters = {'pageKeywords' : this.options.pageKeywords, 'allLines' : storeLines};
      const tocItemParagraphs = allParagraphs.filter((p) =>
        detection.TOCDetected(p, parameters),
      );
      let tocIntegerRight = [];
      let tocIntegerLeft = [];
      if (tocItemParagraphs.length > 0) {

        let storeBoxNumberRight = [];
        let storeBoxNumberLeft = [];
        this.storeNumAndRomanNum(tocItemParagraphs, storeBoxNumberRight, storeBoxNumberLeft);

        tocIntegerRight = this.findTocNumber(storeBoxNumberRight);
        tocIntegerLeft = this.findTocNumber(storeBoxNumberLeft);
        console.log('tocIntegerRight= ' + tocIntegerRight);
        console.log('tocIntegerLeft= ' + tocIntegerLeft);
      }

      // the detection threshold is increased a little if the previous page didn't have a TOC.
      if (
        (tocIntegerRight && tocIntegerRight.length > 2) || (tocIntegerLeft && tocIntegerLeft.length > 2) &&
        tocItemParagraphs.length > 0 &&
        tocItemParagraphs.length >=
          Math.floor(allParagraphs.length * detection.threshold * Math.pow(1.05, pagesSinceLastTOC))
      ) {
        foundTOC = true;
        const toc = new TableOfContents();
        toc.pageKeywords = this.options.pageKeywords;
        toc.content = tocItemParagraphs;
        page.elements = page.elements.filter(e => !tocItemParagraphs.map(t => t.id).includes(e.id));
        page.elements.push(toc);
        pagesSinceLastTOC = 0;
      } else {
        pagesSinceLastTOC++;
      }
    }
    nbRomanNumbers = 0;

    return doc;
  }

  private isNotHeaderFooter(paragraph: Paragraph): boolean {
    const allWords = paragraph.content.map(line => line.content).reduce((a, b) => a.concat(b), []);
    return (
      allWords.filter(word => !word.properties.isFooter && !word.properties.isHeader).length > 0
    );
  }

  private storeNumAndRomanNum(tocItemParagraphs: Paragraph[], storeBoxNumberRight: any[], storeBoxNumberLeft: any[]) {
    let storeNumbersRight = [];
    let storeNumbersLeft = [];
    let storeRomanNumbers = [];

    for (const tocItemParagraph of tocItemParagraphs) {
      const w = tocItemParagraph.width * 0.1;

      const intersectionBoxRight = new BoundingBox(tocItemParagraph.right - w, tocItemParagraph.top, w, tocItemParagraph.height);
      const intersectionBoxLeft = new BoundingBox(tocItemParagraph.left, tocItemParagraph.top, 1.5 * w, tocItemParagraph.height);
      const numbersInsideIntersectionRight = tocItemParagraph
        .getWords()
        .filter(
          word => BoundingBox.getOverlap(word.box, intersectionBoxRight).box1OverlapProportion > 0,
        );
      const strNumberTocItem = numbersInsideIntersectionRight.toString();
      numbersInsideIntersectionRight.forEach(word => {
        if (word.toString().match(/[0-9]+(\.[0-9]+)?( |$)/g)) {
          this.addAlignedNumberRight(storeBoxNumberRight, word);
          storeNumbersRight.push(word.toString().match(/[0-9]+(\.[0-9]+)?( |$)/g));
        }
      });
      

      const numbersInsideIntersectionLeft = tocItemParagraph
        .getWords()
        .filter(
          word => BoundingBox.getOverlap(word.box, intersectionBoxLeft).box1OverlapProportion > 0,
        );
      numbersInsideIntersectionLeft.forEach(word => {
        if (word.toString().match(/[0-9]+(\.[0-9]+)?( |$)/g)) {
          this.addAlignedNumberLeft(storeBoxNumberLeft, word);
          storeNumbersLeft.push(word.toString().match(/[0-9]+(\.[0-9]+)?( |$)/g));
        }
      });
      
      if (strNumberTocItem.match(/[ ._]+(?=[MDCLXVI])M*(C[MD]|D?C{0,3})(X[CL]|L?X{0,3})(I[XV]|V?I{0,3})( |$)/gi)) {
        tocItemParagraph.content.forEach(line => {
          line.content.forEach(word => {
            if (word.content.toString().match(/[ ._]+(?=[MDCLXVI])M*(C[MD]|D?C{0,3})(X[CL]|L?X{0,3})(I[XV]|V?I{0,3})( |$)/gi)) {
              storeRomanNumbers.push(word);
            }
          }); 
        });
      }
    }
    storeBoxNumberRight.sort(function(a, b) {
      return b.length - a.length;
    });
    for (let boxes of storeBoxNumberRight) {
      boxes.sort(function(a, b) {
        return a.box.top - b.box.top;
      });
    }
    
    for (const romanNumbers of storeRomanNumbers) {
      nbRomanNumbers = nbRomanNumbers + romanNumbers.length;
    }
    storeRomanNumbers = [];
    storeNumbersRight = [];
    storeNumbersLeft = [];
  }

 

  private addWordToLine(storeLines, line) {
   
    const indexTopExist = storeLines.findIndex(aLine => Math.floor(aLine.box.top) === Math.floor(line.box.top));
    if (indexTopExist !== -1) {
      storeLines[indexTopExist].content.push.apply(storeLines[indexTopExist].content, line.content);
    }
    else {
      storeLines.push(line);
    }
  }

  private addAlignedNumberRight(storeBoxNumberRight, number) {
   
    const indexValueExist = storeBoxNumberRight.findIndex(aNum => aNum[0].box.left + aNum[0].box.width - 5 <= number.box.left + number.box.width && aNum[0].box.left + aNum[0].box.width + 5 >= number.box.left + number.box.width);
    if (indexValueExist !== -1) {
      storeBoxNumberRight[indexValueExist].push(number);
    }
    else {
      storeBoxNumberRight.push([number]);
    }
  }
  
  private addAlignedNumberLeft(storeBoxNumberLeft, number) {
   
    const indexValueExist = storeBoxNumberLeft.findIndex(aNum => aNum[0].box.left - 25 <= number.box.left && aNum[0].box.left + 25 >= number.box.left + number.box.width);
    if (indexValueExist !== -1) {
      storeBoxNumberLeft[indexValueExist].push(number);
    }
    else {
      storeBoxNumberLeft.push([number]);
    }
  }
  private findTocNumber(storeBoxNumber): any {
    let nbOfNumber;
    let storedInteger = [];
    let nbOfIntegerInOrder = 0;
    for (let box of storeBoxNumber) {
      nbOfNumber = box.length;
      for (const word of box) {
        let num = [];
        num.push(Number(word.toString().match(/[0-9]+(\.[0-9]+)?( |$)/g)));
        if (Number.isInteger(num[0])) {
          storedInteger.push(num[0]);
        }
      }
      if (storedInteger.length / nbOfNumber > 0.75) {
        nbOfIntegerInOrder = this.findIntegerAscendingOrder(storedInteger);
        if (nbOfIntegerInOrder / storedInteger.length > 0.75) {
          return box;
        }
      }
    }
    return null;
  }

  private findIntegerAscendingOrder(storedInteger): number {
    let maxIntegerInOrder = 0;
    let iStart = 0;
    let nbIntegerInOrder = 1;
    while (
      iStart < storedInteger.length / 3 &&
      maxIntegerInOrder < storedInteger.length * 0.7
    ) {
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
}
