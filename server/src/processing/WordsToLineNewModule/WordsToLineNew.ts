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
  BoundingBox,
  Document,
  Element,
  Line,
  Page,
  Word,
} from '../../types/DocumentRepresentation';
import logger from '../../utils/Logger';
import * as utils from '../../utils';
import { Module } from '../Module';
import { ListDetectionModule } from '../ListDetectionModule/ListDetectionModule';
import * as defaultConfig from './defaultConfig.json';

interface Options {
  modifyAvgWordsSpace?: number;
  modifyCommonWordsSpace?: number;
}

const defaultOptions = (defaultConfig as any) as Options;

/**
 * Stability: Stable
 * Merge text block that are side by side to make lines.
 */
export class WordsToLineNewModule extends Module <Options> {
  public static moduleName = 'words-to-line-new';
  private wordsCounter = 0;

  constructor(options?: Options) {
    super(options, defaultOptions);
  }

  public main(doc: Document): Document {
    doc.pages = doc.pages.map(page => {
      if (page.getElementsOfType<Line>(Line).length > 0) {
        logger.warn('Warning: this page already has some line in it. Not performing line merge.');
        return page;
      }

      const rootWords = this.getRootWords(page);
      const rootLines = this.mergeWordsInLines(rootWords);

      // perform words to line for all the words inside other root elements
      let otherElements = this.getRootElements(page, rootWords);
      otherElements = this.joinWordsInElements(otherElements, rootLines.length);

      page.elements = otherElements.concat(rootLines);

      return page;
    });

    return doc;
  }

  private getRootElements(page: Page, excludeWords: Word[]): Element[] {
    return page.elements.filter(
      element => !(element instanceof Word) || !excludeWords.includes(element),
    );
  }

  private joinWordsInElements(elements: Element[], lineCount: number): Element[] {
    const withWords: Element[] = [];
    this.getElementsWithWords(elements, withWords);
    withWords.forEach(element => {
      element.content = this.mergeWordsInLines(element.content as Word[], lineCount);
    });
    return elements;
  }

  private getElementsWithWords(elements: Element[], withWords: Element[]) {
    elements.forEach(element => {
      const words = this.getWordsInElement(element);
      if (words.length > 0) {
        withWords.push(element);
      } else if (Array.isArray(element.content)) {
        element.content.forEach(child => {
          if (child.content as Element[]) {
            this.getElementsWithWords(child.content as Element[], withWords);
          }
        });
      }
    });
  }

  private getWordsInElement(element: Element): Word[] {
    if (Array.isArray(element.content)) {
      const content = element.content;
      return content.filter(item => item instanceof Word).map(word => word as Word);
    }
    return [];
  }

  private getRootWords(page: Page): Word[] {
    return page
      .getElementsOfType<Word>(Word, false)
      .filter(Element.hasBoundingBox)
      .sort(this.sortByPosition);
  }

  private mergeWordsInLines(words: Word[], lineOrder: number = 0): Line[] {
    const lineCandidates: Word[][] = this.groupWordsVertically(words);
    let lines: Line[] = [];
    lineCandidates.forEach(wordsInLine => {
      this.checkWordsSpace(wordsInLine).forEach(wordsLine => {
        const line = utils.mergeElements<Word, Line>(
          new Line(new BoundingBox(0, 0, 0, 0)),
          ...wordsLine,
        );
        lines.push(line);
        line.properties.order = lineOrder + lines.length - 1;
      });
    });
    return lines;
  }

  private checkWordsSpace(words: Word[]): Word[][] {
    const wordsLine: Word[][] = [];
    let currentLine: Word[] = [];
    let avgSpace = this.avgWordsSpace(words);
    words.forEach(word => {
      const lastWord = currentLine[currentLine.length - 1];
      const tolerance = this.checkSpecialWord(currentLine, word) ? 5 : 1;
      if (!this.inSameLine(words, lastWord, word, avgSpace * tolerance)) {
        wordsLine.push(currentLine);
        avgSpace = this.avgWordsSpace(words.filter(w => !currentLine.includes(w)));
        currentLine = [];
      }
      currentLine.push(word);
      word.properties.order = this.wordsCounter;
      this.wordsCounter++;
    });
    if (currentLine.length > 0) {
      wordsLine.push(currentLine);
    }
    return wordsLine;
  }

  private checkSpecialWord(line: Word[], word: Word): boolean {
    return line.length === 1 && this.isListCandidate(line.concat([word]));
  }

  private isListCandidate(words: Word[]): boolean {
    const line = utils.mergeElements<Word, Line>(new Line(new BoundingBox(0, 0, 0, 0)), ...words);
    return ListDetectionModule.isBullet(line) || ListDetectionModule.isNumbering(line);
  }

  private avgWordsSpace(words: Word[]): number {
    const space =
      words
        .map((word, index) => {
          if (index === 0) return 0;
          const prevWordEnd = words[index - 1].left + words[index - 1].width;
          const distance = word.left - prevWordEnd;
          if (distance + this.options.modifyAvgWordsSpace < word.height * 0.2) {
            // If two words are too near then it will reduce avg space a lot
            // making each word to be a line
            return this.commonWordsSpace(words, index);
          }
          return distance + this.options.modifyAvgWordsSpace;
        })
        .reduce((a, b) => a + b, 0) /
      (words.length - 1);
    return Math.round(space * 2.5) + this.options.modifyAvgWordsSpace;
  }

  private commonWordsSpace(words: Word[], excludeIndex: number): number {
    const space =
      words
        .map((word, index) => {
          if (index === 0 || index === excludeIndex) return 0;
          const prevWordEnd = words[index - 1].left + words[index - 1].width;
          const distance = word.left - prevWordEnd;
          return distance + this.options.modifyCommonWordsSpace;
        })
        .reduce((a, b) => a + b, 0) /
      (words.length - 2);
    return Math.round(space * 1.2) + this.options.modifyCommonWordsSpace;
  }

  private inSameLine(lineWords: Word[], lastWord: Word, word: Word, avgSpace: number): boolean {
    if (!lastWord) return true;
    const lastWordEnd = lastWord.left + lastWord.width;
    if (lineWords.length === 2) {
      const totalHeight = lastWord.height + word.height;
      return word.left - lastWordEnd < totalHeight;
    }
    return Math.round(word.left - lastWordEnd) <= avgSpace;
  }

  private groupWordsVertically(words: Word[]): Word[][] {
    const aligned: Word[][] = [];
    let currentY: Word[] = [];
    words.forEach(element => {
      const lastWord = currentY[currentY.length - 1];
      if (
        currentY.length > 0 &&
        (!this.areVerticallyAligned(lastWord, element) ||
          !this.inSameVerticalLine(currentY, element))
      ) {
        aligned.push(currentY);
        currentY = [];
      }
      currentY.push(element);
    });
    if (currentY.length > 0) {
      aligned.push(currentY);
    }
    return aligned.map(line => line.sort(this.sortHorizontally));
  }

  private inSameVerticalLine(lineWords: Word[], word: Word): boolean {
    return lineWords.filter(w => w.top + w.height < word.top).length === 0;
  }

  private areVerticallyAligned(wordA: Word, wordB: Word): boolean {
    const case1 = wordA.top === wordB.top || wordA.bottom === wordB.bottom;
    const case3 = wordA.height - Math.abs(wordB.top - wordA.top) > wordA.height * 0.5;
    const case4 = wordB.height - Math.abs(wordB.top - wordA.top) > wordB.height * 0.5;
    return case1 || case3 || case4;
  }

  private sortByPosition(a: Element, b: Element): number {
    if (a.top == b.top) return a.left - b.left;
    return a.top - b.top;
  }
  private sortHorizontally(a: Element, b: Element): number {
    return a.left - b.left;
  }
}
