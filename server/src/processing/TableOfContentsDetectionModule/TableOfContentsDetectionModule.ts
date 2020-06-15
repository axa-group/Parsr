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

import {
  Document,
  Paragraph,
  TableOfContents,
  BoundingBox,
  Line,
  Word,
} from '../../types/DocumentRepresentation';
import { Module } from '../Module';
import * as defaultConfig from './defaultConfig.json';
import * as detection from './detection-methods';

interface Options {
  keywords?: string[];
  pageKeywords?: string[];
}

const defaultOptions = (defaultConfig as any) as Options;

let tocParagraphs: Paragraph[] = [];

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
      const parameters = { pageKeywords: this.options.pageKeywords };
      const tocItemParagraphs = allParagraphs.filter(p => detection.TOCDetected(p, parameters));
      let tocIntegerRight: Word[] = [];
      let tocRomanNumberRight: Word[] = [];
      let tocIntegerLeft: Word[] = [];
      
      if (tocItemParagraphs.length > 0) {
        let storeBoxNumberRight: Word[][] = [];
        let storeBoxNumberLeft: Word[][] = [];
        let storeBoxRomanNumberRight: Word[][] = [];

        this.storeNumAndRomanNum(tocItemParagraphs, storeBoxNumberRight, storeBoxNumberLeft, storeBoxRomanNumberRight);
        tocIntegerRight = this.findTocNumber(storeBoxNumberRight);
        tocRomanNumberRight = this.findTocRomanNumber(storeBoxRomanNumberRight);
        tocIntegerLeft = this.findTocNumber(storeBoxNumberLeft);
      }
      if (tocIntegerRight && tocIntegerRight.length > 1) {
        this.findTocPara(tocItemParagraphs, tocIntegerRight);
      } else if (tocRomanNumberRight && tocRomanNumberRight.length > 1) {
        this.findTocPara(tocItemParagraphs, tocRomanNumberRight);
      } else if (tocIntegerLeft && tocIntegerLeft.length > 1) {
        this.findTocPara(tocItemParagraphs, tocIntegerLeft);
      }
      tocParagraphs.forEach(paragraph => {
        paragraph.content.forEach(line => {
          if (line.content.length === 1) {
            this.completeTocLine(allParagraphs, line);
          }
        });
      });

      // the detection threshold is increased a little if the previous page didn't have a TOC.
      if (
        tocParagraphs.length > 0 &&
        tocParagraphs.length >=
          Math.floor(allParagraphs.length * detection.threshold * Math.pow(1.05, pagesSinceLastTOC))
      ) {
        foundTOC = true;
        const toc = new TableOfContents();
        toc.pageKeywords = this.options.pageKeywords;
        toc.content = tocParagraphs;
        page.elements = page.elements.filter(e => !tocParagraphs.map(t => t.id).includes(e.id));
        page.elements.push(toc);
        pagesSinceLastTOC = 0;
      } else {
        pagesSinceLastTOC++;
      }
    
      tocParagraphs = [];
    }
    

    return doc;
  }

  private isNotHeaderFooter(paragraph: Paragraph): boolean {
    const allWords = paragraph.content.map(line => line.content).reduce((a, b) => a.concat(b), []);
    return (
      allWords.filter(word => !word.properties.isFooter && !word.properties.isHeader).length > 0
    );
  }

  private storeNumAndRomanNum(
    tocItemParagraphs: Paragraph[],
    storeBoxNumberRight: Word[][],
    storeBoxNumberLeft: Word[][],
    storeBoxRomanNumberRight: Word[][],
  ) {
    
    for (const tocItemParagraph of tocItemParagraphs) {
      const w = tocItemParagraph.width * 0.1;

      const intersectionBoxRight = new BoundingBox(
        tocItemParagraph.right - w,
        tocItemParagraph.top,
        w,
        tocItemParagraph.height,
      );
      const intersectionBoxLeft = new BoundingBox(
        tocItemParagraph.left,
        tocItemParagraph.top,
        1.5 * w,
        tocItemParagraph.height,
      );
      const numbersInsideIntersectionRight = tocItemParagraph
        .getWords()
        .filter(
          word => BoundingBox.getOverlap(word.box, intersectionBoxRight).box1OverlapProportion > 0,
        );
      numbersInsideIntersectionRight.forEach(word => {
        if (word.toString().match(/[0-9]+(\.[0-9]+)?( |$)/g)) {
          this.addAlignedNumberRight(storeBoxNumberRight, word);
        } else if (word.toString().match(/[ ._]+(?=[MDCLXVI])M*(C[MD]|D?C{0,3})(X[CL]|L?X{0,3})(I[XV]|V?I{0,3})( |$)/gi)) {
          this.addAlignedNumberRight(storeBoxRomanNumberRight, word);
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
        }
      });
    }
    storeBoxNumberRight = this.sortBoxNumber(storeBoxNumberRight);
    storeBoxRomanNumberRight = this.sortBoxNumber(storeBoxRomanNumberRight);
    storeBoxNumberLeft = this.sortBoxNumber(storeBoxNumberLeft);
  }

  private addAlignedNumberRight(storeBoxNumber: Word[][], number: Word) {
    const indexValueExist = storeBoxNumber.findIndex(
      aNum =>
        aNum[0].box.left + aNum[0].box.width - 10 <= number.box.left + number.box.width &&
        aNum[0].box.left + aNum[0].box.width + 10 >= number.box.left + number.box.width,
    );
    if (indexValueExist !== -1) {
      storeBoxNumber[indexValueExist].push(number);
    } else {
      storeBoxNumber.push([number]);
    }
  }

  private addAlignedNumberLeft(storeBoxNumberLeft: Word[][], number: Word) {
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

  private sortBoxNumber(storeBoxNumber: Word[][]){
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
  
  private findTocNumber(storeBoxNumber: Word[][]): Word[] {
    let nbOfNumber: number;
    let storedInteger: number[] = [];
    let nbOfIntegerInOrder = 0;
    for (let box of storeBoxNumber) {
      nbOfNumber = box.length;
      for (const word of box) {
        let num: number[] = [];
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

  private findTocRomanNumber(storeBoxNumber: Word[][]): Word[] {
    let nbOfNumber: number;
    let storedRomanNbInteger: number[] = [];
    let nbOfRomanNbIntegerInOrder = 0;
    for (let box of storeBoxNumber) {
      nbOfNumber = box.length;
      for (const word of box) {
        let romanNum: number[] = [];
        romanNum.push(Number(this.romanToArabic(word.toString().match(/(?=[MDCLXVI])M*(C[MD]|D?C{0,3})(X[CL]|L?X{0,3})(I[XV]|V?I{0,3})( |$)/gi))));
          storedRomanNbInteger.push(romanNum[0]);
      }
      if (storedRomanNbInteger.length / nbOfNumber > 0.75) {
        nbOfRomanNbIntegerInOrder = this.findIntegerAscendingOrder(storedRomanNbInteger);
        if (nbOfRomanNbIntegerInOrder / storedRomanNbInteger.length > 0.75) {
          return box;
        }
      }
    }
    return null;
  }
  
  private romanToArabic(romanNumber){
    romanNumber = romanNumber[0].toUpperCase();
    const romanNumList = ['CM','M','CD','D','XC','C','XL','L','IX','X','IV','V','I'];
    const corresp = [900,1000,400,500,90,100,40,50,9,10,4,5,1];
    let index =  0, num = 0;
    for(let rn in romanNumList){
      index = romanNumber.indexOf(romanNumList[rn]);
      while(index != -1){
        num += corresp[rn];
        romanNumber = romanNumber.replace(romanNumList[rn],'-');
        index = romanNumber.indexOf(romanNumList[rn]);
      }
    }
    return num;
  }

  private findIntegerAscendingOrder(storedInteger: number[]): number {
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

  private findTocPara(tocItemParagraphs: Paragraph[],tocInteger: Word[]) {
    for (let i = 0; i < tocItemParagraphs.length; i++) {
      for (let j = 0; j < tocItemParagraphs[i].content.length; j++) {
        for (let integer of tocInteger) {
          if (
            tocItemParagraphs[i].content[j].content.find(word => word === integer) &&
            !tocParagraphs.includes(tocItemParagraphs[i])
          ) {
            tocParagraphs.push(tocItemParagraphs[i]);
            break;
          }
        }
      }
    }
  }

  private completeTocLine(allParagraphs: Paragraph[], line: Line) {
    for (let i = 0; i < allParagraphs.length; i++) {
          if (
            allParagraphs[i].content.find(OneLine =>
            (
              OneLine.box.top >= line.box.top - 1 &&
              OneLine.box.top <= line.box.top + 1
            ) &&
            !tocParagraphs.includes(allParagraphs[i]))
          ) {
            tocParagraphs.push(allParagraphs[i]);
          }
    }
  }
}
