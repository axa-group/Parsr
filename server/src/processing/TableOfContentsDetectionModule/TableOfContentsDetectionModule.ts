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

export class TableOfContentsDetectionModule extends Module<Options> {
  public static moduleName = 'table-of-contents-detection';

  constructor(options?: Options) {
    super(options, defaultOptions);
  }

  public main(doc: Document): Document {
    let storeNumbers = [];
    let allStoredNumbers = [];
    let allStoredInteger = [];
    let mostIntegerInOrder = 0;
    let storeRomanNumbers = [];
    let nbNumber = 0;
    let nbRomanNumbers = 0;
    let nbInteger = 0;
    const nbIntegerInOrderIndex = [];
    let foundTOC = false;
    let pagesSinceLastTOC = 0;
    for (let i = 0; i <= doc.pages.length - 1 && (!foundTOC || pagesSinceLastTOC < 5); i++) {
      const page = doc.pages[i];
      const allParagraphs = page
        .getElementsOfType<Paragraph>(Paragraph, false)
        .filter(this.isNotHeaderFooter);

      const tocItemParagraphs = allParagraphs.filter(p =>
        detection.TOCDetected(p, this.options.pageKeywords),
      );

      if (tocItemParagraphs.length > 0) {
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

        for (const num of allStoredNumbers) {
          if (Number.isInteger(num)) {
            allStoredInteger.push(num);
          }
        }
        nbNumber = allStoredNumbers.length;
        nbInteger = allStoredInteger.length;

        const allIntegerParam = [];

        // Find for each stored integer in array how many of integer in the followings indexes are >=
        // then it is stored in an array integerParam [integer, integerSup, indexOfarray]
        if (nbInteger > 2) {
          let j = 0;
          while (j < nbInteger) {
            let k = j + 1;
            let integerSup = 1;
            while (k < nbInteger) {
              if (allStoredInteger[j] <= allStoredInteger[k]) {
                integerSup++;
              }
              k++;
            }
            const integerParam = [allStoredInteger[j], integerSup, j];
            allIntegerParam.push(integerParam);
            j++;
          }

          // Sort integerParam [integer, integerSup, indexOfarray] based on index 01 integerSup
          allIntegerParam.sort(this.sortFunction);

          // find number of integer in order
          for (let iStart = 0; iStart < nbInteger / 2; iStart++) {
            let step = 1;
            let iLastInOrder = iStart;
            let iTest = iLastInOrder + step;
            let nbIntegerInOrder = 1;

            while (iTest < nbInteger) {
              if (
                allIntegerParam[iTest][0] >= allIntegerParam[iLastInOrder][0] &&
                allIntegerParam[iTest][2] > allIntegerParam[iLastInOrder][2] &&
                nbIntegerInOrder + allIntegerParam[iTest][1] > 0.7 * nbInteger
              ) {
                nbIntegerInOrder++;
                iLastInOrder = iTest;
                step = 0;
              }
              step++;
              iTest = iLastInOrder + step;
            }
            nbIntegerInOrderIndex[iStart] = [nbIntegerInOrder, iLastInOrder];
            if (nbIntegerInOrderIndex[iStart][0] > mostIntegerInOrder) {
              mostIntegerInOrder = nbIntegerInOrderIndex[iStart][0];
            }
          }
        }

        storeNumbers = [];
        allStoredNumbers = [];
        allStoredInteger = [];
        for (const romanNumbers of storeRomanNumbers) {
          nbRomanNumbers = nbRomanNumbers + romanNumbers.length;
        }
        storeNumbers = [];
        storeRomanNumbers = [];
      }

      // the detection threshold is increased a little if the previous page didn't have a TOC.
      if (
        ((nbNumber > 2 && nbInteger / nbNumber > 0.5 && mostIntegerInOrder / nbInteger > 0.7) ||
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

  private sortFunction(a, b) {
    if (a[1] === b[1]) {
      return 0;
    } else {
      return a[0] < b[0] ? -1 : 1;
    }
  }

  private isNotHeaderFooter(paragraph: Paragraph): boolean {
    const allWords = paragraph.content.map(line => line.content).reduce((a, b) => a.concat(b), []);
    return (
      allWords.filter(word => !word.properties.isFooter && !word.properties.isHeader).length > 0
    );
  }
}
