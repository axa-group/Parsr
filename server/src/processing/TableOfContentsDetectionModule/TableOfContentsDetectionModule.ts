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

import { Document, Paragraph, TableOfContents } from '../../types/DocumentRepresentation';
import { Module } from '../Module';
import * as defaultConfig from './defaultConfig.json';
import * as detection from './detection-methods';
// import logger from '../../utils/Logger';

interface Options {
  keywords?: string[];
  pageKeywords?: string[];
}

const defaultOptions = (defaultConfig as any) as Options;

let allStoredNumbers = [];
let mostIntegerInOrder: number = 0;
let nbNumber = 0;
let nbRomanNumbers = 0;
let nbInteger = 0;
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
      
      if (tocItemParagraphs.length > 0) {
        this.storeNumAndRomanNum(tocItemParagraphs);

        let allStoredInteger = this.storeIntegerFromNumbers();
        nbNumber = allStoredNumbers.length;
        nbInteger = allStoredInteger.length;
        let allIntegerParam = [];

        if (nbInteger > 2) {
          allIntegerParam = this.setAndStoreIntegerParam(allStoredInteger);
          allIntegerParam.sort(this.sortFunction);
          mostIntegerInOrder = this.findNumberOfIntegerAscendingOrder(allIntegerParam);
        }
        allStoredNumbers = [];
        allStoredInteger = [];
      }

      // the detection threshold is increased a little if the previous page didn't have a TOC.
      if (
        ((nbNumber > 2 && nbInteger / nbNumber > 0.5 && mostIntegerInOrder / nbInteger >= 0.7) ||
          (nbRomanNumbers > 2 && nbInteger < nbRomanNumbers)) &&
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
    nbNumber = 0;
    nbInteger = 0;
    nbRomanNumbers = 0;
    mostIntegerInOrder = 0;

    return doc;
  }

  private isNotHeaderFooter(paragraph: Paragraph): boolean {
    const allWords = paragraph.content.map(line => line.content).reduce((a, b) => a.concat(b), []);
    return (
      allWords.filter(word => !word.properties.isFooter && !word.properties.isHeader).length > 0
    );
  }

  private storeNumAndRomanNum(tocItemParagraphs: Paragraph[]) {
    let storeNumbers = [];
    let storeRomanNumbers = [];

    for (const tocItemParagraph of tocItemParagraphs) {
      const strTocItem = tocItemParagraph.toString();

      if (strTocItem.match(/[0-9]+(\.[0-9]+)?( |$)/g)) {
        storeNumbers.push(strTocItem.match(/[0-9]+(\.[0-9]+)?( |$)/g).map(Number));
      }
      if (
        strTocItem.match(
          /[ ._]+(?=[MDCLXVI])M*(C[MD]|D?C{0,3})(X[CL]|L?X{0,3})(I[XV]|V?I{0,3})( |$)/gi,
        )
      ) {
        storeRomanNumbers.push(
          strTocItem.match(
            /[ ._]+(?=[MDCLXVI])M*(C[MD]|D?C{0,3})(X[CL]|L?X{0,3})(I[XV]|V?I{0,3})( |$)/gi,
          ),
        );
      }
    }

    for (const numbers of storeNumbers) {
      allStoredNumbers = allStoredNumbers.concat(numbers);
    }
    for (const romanNumbers of storeRomanNumbers) {
      nbRomanNumbers = nbRomanNumbers + romanNumbers.length;
    }
    storeRomanNumbers = [];
    storeNumbers = [];
  }

  private storeIntegerFromNumbers(): number[] {
    let allStoredInteger: number[] = [];
    for (const num of allStoredNumbers) {
      if (Number.isInteger(num)) {
        allStoredInteger.push(num);
      }
    }
    return allStoredInteger;
  }

  private setAndStoreIntegerParam(allStoredInteger: number[]): any[] {
    let allIntegerParam: any[] = [];
    let indexValue = 0;
    while (indexValue < allStoredInteger.length) {
      let indexToCompare = indexValue + 1;
      let numberOfHigherInteger = 1;
      while (indexToCompare < allStoredInteger.length) {
        if (allStoredInteger[indexValue] <= allStoredInteger[indexToCompare]) {
          numberOfHigherInteger++;
        }
        indexToCompare++;
      }
      const integerParam = [allStoredInteger[indexValue], numberOfHigherInteger, indexValue];
      allIntegerParam.push(integerParam);
      indexValue++;
    }
    return allIntegerParam;
  }

  private sortFunction(a, b) {
    if (a[1] === b[1]) {
      return 0;
    } else {
      return a[1] > b[1] ? -1 : 1;
    }
  }

  private findNumberOfIntegerAscendingOrder(allIntegerParam): number {
    let maxIntegerInOrder = 0;
    let iStart = 0;
    let nbIntegerInOrder = 1;
    while (
      iStart < allIntegerParam.length / 2 &&
      allIntegerParam[iStart][1] >= nbIntegerInOrder &&
      maxIntegerInOrder < allIntegerParam.length * 0.7
    ) {
      let step = 1;
      let iLastInOrder = iStart;
      let iTest = iLastInOrder + step;

      while (iTest < allIntegerParam.length) {
        if (
          allIntegerParam[iTest][0] >= allIntegerParam[iLastInOrder][0] &&
          allIntegerParam[iTest][2] > allIntegerParam[iLastInOrder][2]
        ) {
          nbIntegerInOrder++;
          iLastInOrder = iTest;
          step = 0;
        }
        step++;
        iTest = iLastInOrder + step;
      }
      if (nbIntegerInOrder > maxIntegerInOrder) {
        maxIntegerInOrder = nbIntegerInOrder;
      }
      iStart++;
      nbIntegerInOrder = 1;
    }
    return maxIntegerInOrder;
  }

  private addWordToLine(storeLines, line) {
   
    // const indexTopExist = storeLines.findIndex(bounding => bounding[0] === Math.floor(line.box.top));
    const indexTopExist = storeLines.findIndex(aLine => Math.floor(aLine.box.top) === Math.floor(line.box.top));
    console.log('index= ' + indexTopExist);
    if (indexTopExist !== -1) {
      console.log(storeLines[indexTopExist].toString() + '------->');
      // storeLines[indexTopExist][1].push.apply(storeLines[indexTopExist][1], line.content);
      storeLines[indexTopExist].content.push.apply(storeLines[indexTopExist].content, line.content);
      console.log(storeLines[indexTopExist].toString() + '<-------');
      // console.log(storeLines[indexTopExist][1].toString());
    }
    else {
      // console.log('not found yet: ' +  Math.floor(line.box.top));
      // storeLines.push([Math.floor(line.box.top), line.content]);
      storeLines.push(line);
    }
      console.log(storeLines.toString());

  }
}
