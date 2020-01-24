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

import * as utils from '../../utils';
import logger from '../../utils/Logger';
import { BoundingBox } from './BoundingBox';
import { Font } from './Font';
import { Line } from './Line';
import { Text } from './Text';
import { Word } from './Word';

export type LineInfo = {
  line: Line;
  lineBreak: boolean;
  firstWordStyle: WordStyle;
  lastWordStyle: WordStyle;
  firstWordLink: string;
  lastWordLink: string;
};

enum WordStyle {
  Bold,
  Italic,
  BoldItalic,
}

/**
 * The Paragraph class represents a collection of lines, fused together to represent a block of text
 * which potentially represents a semantic grouping.
 */
export class Paragraph extends Text {
  private _content: Line[];
  private _language: string;

  constructor(boundingBox: BoundingBox, content: Line[] = []) {
    super(boundingBox);
    this.content = content;
  }

  /**
   * Converts the entire paragraph into a string form, with line breaks between lines and spaces between
   * words.
   */
  public toString(): string {
    const content: string[] = this.content.map(l => l.toString());
    if (content.length !== 0) {
      return content.reduce((l1, l2) => l1 + ' ' + l2, '').trim(); // TODO better carriage return handling
    } else {
      return '';
    }
  }

  /**
   * Converts the entire paragraph into a string form with formatting, with spaces between words.
   */
  public toMarkdown(): string {
    return this.export('md');
  }

  /**
   * Converts the entire element into a html code string (needed by MD table generation).
   */
  public toHTML(): string {
    return this.export('html');
  }

  /**
   * Get every words from the paragraph in a flat array.
   */
  public getWords(): Word[] {
    return this.content.map(l => l.content).reduce((a, b) => [...a, ...b], []);
  }

  /**
   * Get every words that compose a paragraph's substring.
   * @param start Beginning of the string
   * @param length Length of the string
   */
  public findWordsFromParagraphSubstring(start: number, length: number): Word[] {
    const allWords: Word[] = this.getWords();

    let startIndex: number = 0;
    for (let i = 0; i < allWords.length; i++) {
      if (
        allWords
          .slice(0, i + 1)
          .map(w => w.toString())
          .join(' ').length >= start
      ) {
        startIndex = i;
        break;
      }
    }

    let endIndex: number = 0;
    for (let i = startIndex; i < allWords.length; i++) {
      if (
        allWords
          .slice(startIndex, i + 1)
          .map(w => w.toString())
          .join(' ').length >= length
      ) {
        endIndex = i;
        break;
      }
    }

    return allWords.slice(startIndex, endIndex + 1);
  }

  /**
   * Returns the main font of the paragraph using a basket + voting mechanism. The most used font will be returned
   * as a valid Font object.
   */
  public getMainFont(): Font | undefined {
    const fonts: Font[] = this.content
      .map((line: Line) => {
        return line.content.map((word: Word) => word.font);
      })
      .reduce((a, b) => a.concat(b), []);

    const baskets: Font[][] = [];

    fonts.forEach((font: Font) => {
      let basketFound: boolean = false;
      baskets.forEach((basket: Font[]) => {
        if (basket.length > 0 && basket[0].isEqual(font)) {
          basket.push(font);
          basketFound = true;
        }
      });

      if (!basketFound) {
        baskets.push([font]);
      }
    });

    baskets.sort((a, b) => {
      return b.length - a.length;
    });

    if (baskets.length > 0 && baskets[0].length > 0) {
      return baskets[0][0];
    } else {
      logger.debug(`No font found for paragraph id ${this.id}`);
      return undefined;
    }
  }

  public mergeStyleLines(prevLine: LineInfo, line: LineInfo, output: any, format: string) {
    if (!prevLine) {
      return;
    }

    if (!!prevLine.lastWordLink && prevLine.lastWordLink === line.firstWordLink) {
      // gets the last link MD in the previous line
      const mdLinksInPreviousLine = output.paragraphOutput.match(new RegExp(/\[.*?\]\(.*?\)/gs));
      if (!mdLinksInPreviousLine) { return; }

      const lastWordLinkMD = mdLinksInPreviousLine[mdLinksInPreviousLine.length - 1];
      // gets the first link MD and description in the current line
      const firstLinkMDInLine = output.lineOutput.match(new RegExp(/\[.*?\]\((.*?)\)/));

      if (!firstLinkMDInLine) { return; }
      const lastLinkMDDescription = firstLinkMDInLine[0].replace(/\[(.*?)\]\(.*?\)/, '$1');

      // merges the last link in previous line with the description of the first link in current line
      const mergedLinkMD = lastWordLinkMD.replace(/\[(.*?)\]\((.*?)\)/s, `[$1  \n${lastLinkMDDescription}]($2)`);
      output.paragraphOutput = output.paragraphOutput.replace(lastWordLinkMD, mergedLinkMD).trim();

      // removes the first link in current line, to avoid duplicated (it's already merged in the previous line)
      output.lineOutput = output.lineOutput.slice(firstLinkMDInLine[0].length);
    }

    if (line.lineBreak) {
      return;
    }

    if (prevLine.lastWordStyle != null && prevLine.lastWordStyle === line.firstWordStyle) {
      const endTag = this.wordStyleEndTag(prevLine.lastWordStyle, format);
      const end = output.paragraphOutput.length - (endTag.length + 1);
      output.paragraphOutput = output.paragraphOutput.slice(0, end) + ' ';
      const startTag = this.wordStyleStartTag(prevLine.lastWordStyle, format);
      output.lineOutput = output.lineOutput.slice(startTag.length);
    }
  }

  public lineToMarkDown(line: Line) {
    const words: Word[] = line.content;
    let biWordsIdx: number[][] = Array<number[]>(1).fill([]);
    let bWordsIdx: number[][] = Array<number[]>(1).fill([]);
    let iWordsIdx: number[][] = Array<number[]>(1).fill([]);
    const linkWordsIdx = {};

    words.forEach((w, index) => {
      const style = this.wordStyle(w);
      if (style === WordStyle.BoldItalic) {
        biWordsIdx[0].push(index);
      } else if (style === WordStyle.Bold) {
        bWordsIdx[0].push(index);
      } else if (style === WordStyle.Italic) {
        iWordsIdx[0].push(index);
      }

      // grouping word ids in line by link target
      if (w.properties.targetURL) {
        if (!linkWordsIdx[w.properties.targetURL]) {
          linkWordsIdx[w.properties.targetURL] = Array<number[]>(1).fill([]);
        }
        linkWordsIdx[w.properties.targetURL][0].push(index);
      }
    });

    biWordsIdx = utils.groupConsecutiveNumbersInArray(biWordsIdx[0]).filter(p => p.length !== 0);
    bWordsIdx = utils.groupConsecutiveNumbersInArray(bWordsIdx[0]).filter(p => p.length !== 0);
    iWordsIdx = utils.groupConsecutiveNumbersInArray(iWordsIdx[0]).filter(p => p.length !== 0);

    Object.keys(linkWordsIdx).forEach((link) => {
      linkWordsIdx[link] = utils.groupConsecutiveNumbersInArray(linkWordsIdx[link][0] as number[]);
    });

    // prepare the result
    const result: string[] = words.map(w => w.toMarkDown());

    biWordsIdx.forEach(idGroup => {
      result[idGroup[0]] = '***' + result[idGroup[0]];
      result[idGroup[idGroup.length - 1]] = result[idGroup[idGroup.length - 1]] + '***';
    });

    bWordsIdx.forEach(idGroup => {
      result[idGroup[0]] = '**' + result[idGroup[0]];
      result[idGroup[idGroup.length - 1]] = result[idGroup[idGroup.length - 1]] + '**';
    });

    iWordsIdx.forEach(idGroup => {
      result[idGroup[0]] = '*' + result[idGroup[0]];
      result[idGroup[idGroup.length - 1]] = result[idGroup[idGroup.length - 1]] + '*';
    });

    /*
      merging consecutive words with the same link
        ex:
        input: [Google](https://www.google.com) [link](https://www.google.com)
        returns: [Google link](https://www.google.com)
    */
    Object.keys(linkWordsIdx).forEach(lw => {
      linkWordsIdx[lw].forEach(idGroup => {
        let linkDescription = idGroup.map(id => result[id].replace(/\[(.*?)\]\(.*?\)/, "$1")).join(' ');
        const emphazisChars = utils.getEmphazisChars(linkDescription);
        if (emphazisChars !== '') {
          linkDescription = linkDescription.split(emphazisChars)[1];
        }
        result[idGroup[0]] = `${emphazisChars}[${linkDescription.trim()}](${lw.trim()})${emphazisChars}`;

        // after the merging, i set as null the rest of the words with that link so it doesn't repeat.
        for (let i = 1; i < idGroup.length; i++) {
          result[idGroup[i]] = null;
        }
      });
    });

    return result
      .filter(w => !!w)
      .map(w => w.trim())
      .join(' ')
      .replace(/^([\d]+)([.)] )/gm, '$1\\$2') // escape dots and closing parentheses only for ordered list bullets
      .replace(/^([+-] )/gm, '\\$1'); // escape dashes and plus signs only for unordered list bullets
  }

  public lineToHTML(line: Line) {
    const words: Word[] = line.content;
    let biWordsIdx: number[][] = Array<number[]>(1).fill([]);
    let bWordsIdx: number[][] = Array<number[]>(1).fill([]);
    let iWordsIdx: number[][] = Array<number[]>(1).fill([]);
    const linkWordsIdx = {};

    words.forEach((w, index) => {
      const style = this.wordStyle(w);
      if (style === WordStyle.BoldItalic) {
        biWordsIdx[0].push(index);
      } else if (style === WordStyle.Bold) {
        bWordsIdx[0].push(index);
      } else if (style === WordStyle.Italic) {
        iWordsIdx[0].push(index);
      }

      // grouping word ids in line by link target
      if (w.properties.targetURL) {
        if (!linkWordsIdx[w.properties.targetURL]) {
          linkWordsIdx[w.properties.targetURL] = Array<number[]>(1).fill([]);
        }
        linkWordsIdx[w.properties.targetURL][0].push(index);
      }
    });
    biWordsIdx = utils.groupConsecutiveNumbersInArray(biWordsIdx[0]).filter(p => p.length !== 0);
    bWordsIdx = utils.groupConsecutiveNumbersInArray(bWordsIdx[0]).filter(p => p.length !== 0);
    iWordsIdx = utils.groupConsecutiveNumbersInArray(iWordsIdx[0]).filter(p => p.length !== 0);

    Object.keys(linkWordsIdx).forEach((link) => {
      linkWordsIdx[link] = utils.groupConsecutiveNumbersInArray(linkWordsIdx[link][0] as number[]);
    });

    // prepare the result
    const result: string[] = words.map(w => w.toMarkDown());

    biWordsIdx.forEach(idGroup => {
      result[idGroup[0]] = '<b><i>' + result[idGroup[0]];
      result[idGroup[idGroup.length - 1]] = result[idGroup[idGroup.length - 1]] + '</i></b>';
    });

    bWordsIdx.forEach(idGroup => {
      result[idGroup[0]] = '<b>' + result[idGroup[0]];
      result[idGroup[idGroup.length - 1]] = result[idGroup[idGroup.length - 1]] + '</b>';
    });

    iWordsIdx.forEach(idGroup => {
      result[idGroup[0]] = '<i>' + result[idGroup[0]];
      result[idGroup[idGroup.length - 1]] = result[idGroup[idGroup.length - 1]] + '</i>';
    });

    /*
    merging consecutive words with the same link
      ex:
      input: [Google](https://www.google.com) [link](https://www.google.com)
      returns: <a href="https://www.google.com">Google link</a>
    */
    Object.keys(linkWordsIdx).forEach(lw => {
      linkWordsIdx[lw].forEach(idGroup => {
        const linkDescription = idGroup.map(id => result[id].replace(/\[(.*?)\]\(.*?\)/, "$1")).join(' ');
        result[idGroup[0]] = `<a href="${lw.trim()}">${linkDescription.trim()}</a>`;

        // after the merging, i set as null the rest of the words with that link so it doesn't repeat.
        for (let i = 1; i < idGroup.length; i++) {
          result[idGroup[i]] = null;
        }
      });
    });

    return result
      .filter(w => !!w)
      .map(w => w.trim())
      .reduce((w1, w2) => w1 + ' ' + w2, '')
      .trim();
  }

  public getLinesInfo(): LineInfo[] {
    return this.content.map((l, index) => {
      return {
        line: l,
        lineBreak: this.isLineBreak(index),
        firstWordStyle: this.wordStyle(l.content[0]),
        lastWordStyle: this.wordStyle(l.content[l.content.length - 1]),
        firstWordLink: l.content[0].properties.targetURL,
        lastWordLink: l.content[l.content.length - 1].properties.targetURL,
      };
    });
  }

  public wordStyle(word: Word): WordStyle {
    if (word.font.isItalic && word.font.weight === 'bold') {
      return WordStyle.BoldItalic;
    } else if (!word.font.isItalic && word.font.weight === 'bold') {
      return WordStyle.Bold;
    } else if (word.font.isItalic && word.font.weight !== 'bold') {
      return WordStyle.Italic;
    }
    return null;
  }

  public isLineBreak(index: number): boolean {
    if (index + 1 >= this.content.length) {
      return false;
    }
    const line: Line = this.content[index];
    const wordsAvgSpace = this.avgWordSpace(line);
    const nextLine: Line = this.content[index + 1];
    const spaceParagraphToLine = line.left - this.left;
    const availableSpace = this.width - line.width - wordsAvgSpace - spaceParagraphToLine;
    return availableSpace >= nextLine.content[0].width;
  }

  /**
   * Getter content
   * @return {Line[]}
   */
  public get content(): Line[] {
    return this._content;
  }

  /**
   * Getter language
   * @return {string}
   */
  public get language(): string {
    return this._language;
  }

  /**
   * Setter content
   * @param {Line[]} value
   */
  public set content(value: Line[]) {
    this._content = value;
  }

  /**
   * Setter language
   * @param {string} value
   */
  public set language(value: string) {
    this._language = value;
  }

  private avgWordSpace(line: Line): number {
    const margins = line.content.map((word, index) => {
      if (index > 0) {
        return word.left - line.content[index - 1].right;
      }
      return 0;
    });

    return margins.reduce((a, b) => a + b, 0) / margins.length;
  }

  private wordStyleEndTag(style: WordStyle, format: string): string {
    return this.wordStyleTag(style, format, true);
  }

  private wordStyleStartTag(style: WordStyle, format: string): string {
    return this.wordStyleTag(style, format, false);
  }

  private wordStyleTag(style: WordStyle, format: string, closingTag: boolean): string {
    switch (style) {
      case WordStyle.BoldItalic:
        return format === 'md'
          ? '***'
          : '<' + (closingTag ? '/' : '') + 'i><' + (closingTag ? '/' : '') + 'b>';
      case WordStyle.Bold:
        return format === 'md' ? '**' : '<' + (closingTag ? '/' : '') + 'b>';
      case WordStyle.Italic:
        return format === 'md' ? '*' : '<' + (closingTag ? '/' : '') + 'i>';
    }
    return '';
  }

  private export(format: string): string {
    const lines: LineInfo[] = this.getLinesInfo();
    let output: string = '';
    let prevLine: LineInfo = null;
    lines.forEach((line, index) => {
      let lineOutput = this.lineToMarkDown(line.line);
      if (format === 'html') {
        lineOutput = this.lineToHTML(line.line);
      }
      const mergedStyles = { paragraphOutput: output, lineOutput };
      this.mergeStyleLines(prevLine, line, mergedStyles, format);
      output = mergedStyles.paragraphOutput;
      output += mergedStyles.lineOutput;
      if (line.lineBreak) {
        output += format === 'md' ? '  \n' : '<br/>';
      } else if (index + 1 < lines.length) {
        output += ' ';
      }
      prevLine = line;
    });
    return output;
  }
}
