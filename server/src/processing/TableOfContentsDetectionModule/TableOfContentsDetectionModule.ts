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
      let tocInteger = [];
      if (tocItemParagraphs.length > 0) {

        let storeBoxNumber = [];
        this.storeNumAndRomanNum(tocItemParagraphs, storeBoxNumber);

        tocInteger = this.findTocNumber(storeBoxNumber);
        console.log('tocInteger= ' + tocInteger);
        
      }

      // the detection threshold is increased a little if the previous page didn't have a TOC.
      if (
        // ((nbNumber > 2 && nbInteger / nbNumber > 0.5 && mostIntegerInOrder / nbInteger >= 0.7) ||
        //   (nbRomanNumbers > 2 && nbInteger < nbRomanNumbers)) &&
        tocInteger && tocInteger.length > 2 &&
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

  private storeNumAndRomanNum(tocItemParagraphs: Paragraph[], storeBoxNumber: any[]) {
    let storeNumbersRight = [];
    let storeNumbersLeft = [];
    let storeRomanNumbers = [];

    for (const tocItemParagraph of tocItemParagraphs) {
      const w = tocItemParagraph.width * 0.1;
      const intersectionBoxRight = new BoundingBox(tocItemParagraph.right - w, tocItemParagraph.top, w, tocItemParagraph.height);
      const intersectionBoxLeft = new BoundingBox(tocItemParagraph.left, tocItemParagraph.top, w, tocItemParagraph.height);
      const numbersInsideIntersectionRight = tocItemParagraph
        .getWords()
        .filter(
          word => BoundingBox.getOverlap(word.box, intersectionBoxRight).box1OverlapProportion > 0,
        );
      const strNumberTocItem = numbersInsideIntersectionRight.toString();
      numbersInsideIntersectionRight.forEach(word => {
        if (word.toString().match(/[0-9]+(\.[0-9]+)?( |$)/g)) {
          this.addAlignedNumber(storeBoxNumber, word);
          storeNumbersRight.push(word.toString().match(/[0-9]+(\.[0-9]+)?( |$)/g));
        }
      });
      

      const numbersInsideIntersectionLeft = tocItemParagraph
        .getWords()
        .filter(
          word => BoundingBox.getOverlap(word.box, intersectionBoxLeft).box1OverlapProportion > 0,
        );
      numbersInsideIntersectionLeft.forEach(word => {
        const strNumTocItem = word.toString();
        if (strNumTocItem.match(/[0-9]+(\.[0-9]+)?( |$)/g)) {
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
    storeBoxNumber.sort(function(a, b) {
      return b.length - a.length;
    });
    for (let boxes of storeBoxNumber) {
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

  private addAlignedNumber(storeBoxNumber, number) {
   
    const indexValueExist = storeBoxNumber.findIndex(aNum => aNum[0].box.left + aNum[0].box.width - 5 <= number.box.left + number.box.width && aNum[0].box.left + aNum[0].box.width + 5 >= number.box.left + number.box.width);
    if (indexValueExist !== -1) {
      storeBoxNumber[indexValueExist].push(number);
    }
    else {
      storeBoxNumber.push([number]);
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

 // private storeIntegerFromNumbers(): number[] {
  //   let allStoredInteger: number[] = [];
  //   for (const num of allStoredNumbers) {
  //     if (Number.isInteger(num)) {
  //       allStoredInteger.push(num);
  //     }
  //   }
  //   return allStoredInteger;
  // }

// private storeIntegerFromNumbers(): any[] {
  //   let allStoredInteger: any[] = [];
  //   for (const num of allStoredNumbers) {
  //     if (!num.some(char => char.content === '.') && !num.some(char => char.content === ',')) {
  //       allStoredInteger.push(num);
  //     }
  //   }
  //   return allStoredInteger;
  // }

  // private setAndStoreIntegerParam(allStoredInteger: number[]): any[] {
  //   let allIntegerParam: any[] = [];
  //   let indexValue = 0;
  //   while (indexValue < allStoredInteger.length) {
  //     let indexToCompare = indexValue + 1;
  //     let numberOfHigherInteger = 1;
  //     while (indexToCompare < allStoredInteger.length) {
  //       if (allStoredInteger[indexValue] <= allStoredInteger[indexToCompare]) {
  //         numberOfHigherInteger++;
  //       }
  //       indexToCompare++;
  //     }
  //     const integerParam = [allStoredInteger[indexValue], numberOfHigherInteger, indexValue];
  //     allIntegerParam.push(integerParam);
  //     indexValue++;
  //   }
  //   return allIntegerParam;
  // }

  // private sortFunction(a, b) {
  //   if (a[1] === b[1]) {
  //     return 0;
  //   } else {
  //     return a[1] > b[1] ? -1 : 1;
  //   }
  // }

  // private findNumberOfIntegerAscendingOrder(allIntegerParam): number {
  //   let maxIntegerInOrder = 0;
  //   let iStart = 0;
  //   let nbIntegerInOrder = 1;
  //   while (
  //     iStart < allIntegerParam.length / 2 &&
  //     allIntegerParam[iStart][1] >= nbIntegerInOrder &&
  //     maxIntegerInOrder < allIntegerParam.length * 0.7
  //   ) {
  //     let step = 1;
  //     let iLastInOrder = iStart;
  //     let iTest = iLastInOrder + step;

  //     while (iTest < allIntegerParam.length) {
  //       if (
  //         allIntegerParam[iTest][0] >= allIntegerParam[iLastInOrder][0] &&
  //         allIntegerParam[iTest][2] > allIntegerParam[iLastInOrder][2]
  //       ) {
  //         nbIntegerInOrder++;
  //         iLastInOrder = iTest;
  //         step = 0;
  //       }
  //       step++;
  //       iTest = iLastInOrder + step;
  //     }
  //     if (nbIntegerInOrder > maxIntegerInOrder) {
  //       maxIntegerInOrder = nbIntegerInOrder;
  //     }
  //     iStart++;
  //     nbIntegerInOrder = 1;
  //   }
  //   return maxIntegerInOrder;
  // }


  // private findValidTocInteger(storeLines, allStoredInteger, integers, storeBoxValues) {
  //   console.log('storeLine= ' + storeLines.length);
  //   console.log('allstoredInt= ' + allStoredInteger.length);
  //   console.log('integers= ' + integers.length);
  //   for (let i = 0; i < allStoredInteger.length / 2; i++) {
  //     // console.log(storeBoxValues[i].toString());
  //     // console.log(allStoredInteger[i][0].box);
  //     const integerBox = new BoundingBox(storeBoxValues[i][0] - 25, storeBoxValues[i][1], storeBoxValues[i][2] + 50,  storeBoxValues[allStoredInteger.length - 1][1] - storeBoxValues[i][1] +  storeBoxValues[allStoredInteger.length - 1][3]);
  //     // console.log('------->');
  //     // console.log(integerBox);
  //     // console.log('<------');
  //     const integerInsideIntersection = allStoredInteger[i]
  //     .filter(
  //       char => BoundingBox.getOverlap(char.box, integerBox).box1OverlapProportion > 0,
  //     );
  //     // console.log(integerInsideIntersection);
  //     console.log('length= ' + integerInsideIntersection.length);
  //     // let j = i;
  //     // for (j; j < allStoredInteger.length; j++) {

  //     // }
  //   }
  // }
}
