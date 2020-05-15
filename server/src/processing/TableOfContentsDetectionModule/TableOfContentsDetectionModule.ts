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
import logger from '../../utils/Logger';

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
    let storeRomanNumbers = [];
    let numbersLen = 0;
    let romanNumbersLen = 0;
    let nbInteger = 0;
    // let scoreInOrder = 1;
    // let scoreInOrder = 0;
    // const decimalNum = new RegExp(/[0-9]+(\.[0-9]+)?/, 'g');
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
      // logger.info('tocItemParagraphs= ' + tocItemParagraphs[0] + '|' + tocItemParagraphs[1]);

      if (tocItemParagraphs.length > 0) {
        for (const tocItemParagraph of tocItemParagraphs) {
          logger.info('tocItemParagraph= ' + tocItemParagraph + '|');
          const strTocItem = tocItemParagraph.toString();
          if (strTocItem.match(/[0-9]+(\.[0-9]+)?/g)) {
            storeNumbers.push(strTocItem.match(/[0-9]+(\.[0-9]+)?/g).map(Number));
            logger.info('detectNumber= ' + strTocItem.match(/[0-9]+(\.[0-9]+)?/g));
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
            logger.info(
              'storeRomanNumber= ' +
                strTocItem.match(
                  /[ ._]+(?=[MDCLXVI])M*(C[MD]|D?C{0,3})(X[CL]|L?X{0,3})(I[XV]|V?I{0,3})( |$)/gi,
                ),
            );

            // for (const num of storeNumbers) {
            //   if (nu)
            // }
          }
          // logger.info('decimal regex= ' + strTocItem.match(/[0-9]+(\.[0-9]+)?/g));
          // if (storeNumbers.length > 3) {
          //   for (let index = 0; index < storeNumbers.length - 1; index++) {
          //     for (let j = index + 1; j < storeNumbers.length - 1; j++) {
          //       if (storeNumbers[j] > storeNumbers[index]) {
          //         scoreInOrder = scoreInOrder + 1;
          //       }
          //     }
          //   }
          // }
          // logger.info('numberslen= ' + storeNumbers.length);
          // if (decimalNum.exec(strTocItem) !== null) {
          // storeNumbers.push(decimalNum.exec(strTocItem));
        }
        for (const numbers of storeNumbers) {
          logger.info('soreNumber= ' + numbers);
          for (const num of numbers) {
            if (Number.isInteger(num)) {
              nbInteger++;
            }
            numbersLen++;
          }
          // logger.info('lenNumber= ' + num.length);
          // logger.info('number= ' + num);
        }
        storeNumbers = [];
        for (const romanNumbers of storeRomanNumbers) {
          romanNumbersLen = romanNumbersLen + romanNumbers.length;
          // logger.info('lenNumber= ' + num.length);
          // logger.info('number= ' + num);
        }
        storeNumbers = [];
        storeRomanNumbers = [];
      }
      // the detection threshold is increased a little if the previous page didn't have a TOC.
      if (
        ((numbersLen > 2 && nbInteger / numbersLen > 0.5) || romanNumbersLen > 2) &&
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
      numbersLen = 0;
      nbInteger = 0;
      romanNumbersLen = 0;
    }

    return doc;
  }

  private isNotHeaderFooter(paragraph: Paragraph): boolean {
    const allWords = paragraph.content.map(line => line.content).reduce((a, b) => a.concat(b), []);
    return (
      allWords.filter(word => !word.properties.isFooter && !word.properties.isHeader).length > 0
    );
  }
}
