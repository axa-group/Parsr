/**
 * Copyright 2019 AXA Group Operations S.A.
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

import { Document, Word } from '../../types/DocumentRepresentation';
import { Module } from '../Module';

import * as englishDictArray from 'an-array-of-english-words';

/**
 * Template Module. Do not use as is.
 */
export class SeparateWordsModule extends Module {
  // The module name is useful to call it in the configuration.
  // Please keep it kebab-case.
  public static moduleName = 'separate-words';
  private MEMORY_SENTENCE: any = {};
  private englishDict: any = {};

  // The main function will be called by the platform (by `../Cleaner.ts`).
  public main(doc: Document): Document {
    this.init();

    doc.pages.forEach(p =>
      p.getElementsOfType<Word>(Word).forEach(word => {
        if (word.toString().length > 8 && !this.englishDict[word.toString().toLowerCase()]) {
          // Hack with dot to make it works
          const newStr = this.addSpaces(word.toString() + '.');
          word.content = newStr.slice(0, newStr.length - 1);
        }
      }),
    );

    return doc;
  }

  private init() {
    for (const word of englishDictArray) {
      this.englishDict[word] = 1;
    }

    this.englishDict.abc = 1;
    this.englishDict.axa = 1;
    this.englishDict.allianz = 1;
    this.englishDict.chubb = 1;
    this.englishDict['’s'] = 1;
    this.englishDict["'s"] = 1;
  }

  private isNumber(str) {
    const numberList = '0123456789';
    if (str.trim().length === 0) {
      return false;
    }

    for (const s of str) {
      if (numberList.indexOf(s) === -1) {
        return false;
      }
    }
    return true;
  }

  private breakWords(str) {
    if (!str) {
      return 'end';
    }
    if (this.MEMORY_SENTENCE[str]) {
      return this.MEMORY_SENTENCE[str];
    }

    const sentences = [];

    const punctuationsRegex = /\W+/;
    for (let i = 0; i < str.length; ++i) {
      if (punctuationsRegex.test(str[i])) {
        const bestSub = this.breakWords(str.substr(i + 1));
        if (bestSub === 'end' || !bestSub) {
          sentences.push({
            score: 10,
            word: str[i],
          });
        } else if (bestSub) {
          sentences.push({
            sub: bestSub,
            score: 10 + bestSub.score,
            word: str[i],
          });
        }

        break;
      }

      if (
        this.englishDict[str.substr(0, i + 1).toLowerCase()] ||
        (this.isNumber(str.substr(0, i + 1)) &&
          (!this.isNumber(str.substr(0, i + 2)) || i + 2 >= str.length))
      ) {
        const bestSub = this.breakWords(str.substr(i + 1));

        const wordScore = (i + 1) * (i + 1) * (i + 1);
        if (bestSub === 'end' || !bestSub) {
          sentences.push({
            score: wordScore,
            word: str.substr(0, i + 1),
          });
        } else if (bestSub) {
          sentences.push({
            sub: bestSub,
            score: wordScore + bestSub.score,
            word: str.substr(0, i + 1),
          });
        }
      }
    }

    let bestScore = -1;
    let bestSentence = null;

    for (const sentence of sentences) {
      if (sentence.score > bestScore) {
        bestSentence = sentence;
        bestScore = sentence.score;
      }
    }
    this.MEMORY_SENTENCE[str] = bestSentence;
    return bestSentence;
  }

  private addSpaces(str: string): string {
    //   console.log('SPACE', str);
    // do not break urls
    if (str.indexOf('www') === 0 || str.indexOf('http:') === 0) {
      return str;
    }

    // do not break @
    if (str.indexOf('@') !== -1 && str.indexOf('.') !== -1) {
      return str;
    }

    const punctuations = '.,,(();?!-#@£$€¥元/$=*+:';

    const subSentences = [];

    for (let i = 0; i < str.length; i++) {
      if (punctuations.indexOf(str[i]) !== -1) {
        if (i > 0) {
          subSentences.push(str.substr(0, i));
        }

        subSentences.push(str[i]);
        str = str.substr(i + 1);
        i = -1;
      }
    }

    let out = '';
    for (const subSentence of subSentences) {
      if (punctuations.indexOf(subSentence[0]) !== -1) {
        out += subSentence[0];
        continue;
      }
      let sentences = this.breakWords(subSentence);
      while (sentences) {
        if (sentences.word) {
          if (out) {
            out += ' ';
          }
          out += sentences.word;
        }
        sentences = sentences.sub;
      }
    }

    return out;
  }
}

// console.log(addSpaces('UnoccupiedHomesSecurityandHeating'));
// console.log(addSpaces('AmountofcoverforYourContents'));
// console.log(addSpaces("ying,orengaginginaerialactivitiesotherthanasapassengerinanaircraft"));
// console.log(addSpaces("Anyamountover£2,000,000forallcompensationandclaimant’s"));
// console.log(addSpaces(":FederalLawNo.(6)of2007concerningtheestablishment\
// ofInsuranceAuthorityandOrganizationofitswork.Agent:"));
