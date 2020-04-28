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

import {
  BoundingBox,
  Document,
  Element,
  Font,
  Heading,
  Line,
  Page,
  Paragraph,
  TableCell,
  Word,
} from '../../types/DocumentRepresentation';
import * as utils from '../../utils';
import logger from '../../utils/Logger';
import { LinesToParagraphModule } from '../LinesToParagraphModule/LinesToParagraphModule';
import { Module } from '../Module';
import { DecisionTreeClassifier } from './train_model/model';
import { DecisionTreeClassifier as DecisionTreeClassifierLevel } from './train_model/model_level';

export class MlHeadingDetectionModule extends Module {
  public static moduleName = 'ml-heading-detection';
  public static dependencies = [LinesToParagraphModule];

  public main(doc: Document): Document {
    if (this.headingsDetected(doc)) {
      logger.warn(
        'Warning: this page already has some headings in it. Not performing heading detection.',
      );
      return doc;
    }

    // get the main body font from all the words in document
    const mainCommonFont = this.commonFont(doc);

    // get all the fonts to use for heading
    const headingFonts = this.headingFonts(doc);

    doc.pages.forEach((page: Page) => {
      const newContents = this.extractHeadings(
        page,
        mainCommonFont,
        headingFonts,
      );
      const paras: Paragraph[] = this.mergeLinesIntoParagraphs(newContents.paragraphLines);
      const headings: Heading[] = this.mergeLinesIntoHeadings(newContents.headingLines);
      page.elements = newContents.rootElements.concat([...headings, ...paras]);
    });

    if (this.headingsDetected(doc)) {
      this.computeHeadingLevels(doc);
    }
    return doc;
  }

  /**
   * Takes into account potential headings inside a paragraph
   * splits a paragraph into multiple ones and returns heading candidates
   * @param page Page to extract headings from each paragraph
   * @param commonFont Most used font in document
   * @param headingFonts Array of only fonts that all headings should use
   */
  private extractHeadings(
    page: Page,
    commonFont: Font,
    headingFonts: Font[],
  ): { headingLines: Line[][]; paragraphLines: Line[][]; rootElements: Element[] } {
    // get all paragraphs in page root
    const pageParagraphs = this.pageParagraphs(page);
    return {
      ...this.extractHeadingsInParagraphs(
        pageParagraphs,
        commonFont,
        headingFonts,
      ),
      rootElements: this.createHeadingsInOtherElements(
        this.pageOtherElements(page),
        commonFont,
        headingFonts,
      ),
    };
  }

  private createHeadingsInOtherElements(
    elements: Element[],
    commonFont: Font,
    headingFonts: Font[],
  ): Element[] {
    this.getElementsWithParagraphs(elements, [])
    // this is to avoid setting table content as headings
      .filter(e => !(e instanceof TableCell))
      .forEach(element => {
        const newContents = this.extractHeadingsInParagraphs(
          this.getParagraphsInElement(element),
          commonFont,
          headingFonts,
        );
        const paras: Paragraph[] = this.mergeLinesIntoParagraphs(newContents.paragraphLines);
        const headings: Heading[] = this.mergeLinesIntoHeadings(newContents.headingLines);

        element.content = [...headings, ...paras];
      });
    return elements;
  }

  private extractHeadingsInParagraphs(
    paragraphs: Paragraph[],
    commonFont: Font,
    headingFonts: Font[],
  ): { headingLines: Line[][]; paragraphLines: Line[][] } {
    const paragraphLines: Line[][] = [];
    const headingLines: Line[][] = [];

    paragraphs.map(paragraph => paragraph.content)
      .forEach(linesInParagraph => {
        // let initiatedHeading = false;
        if (commonFont instanceof Font) {
          const headingIdx: number[] = linesInParagraph.map((line: Line, pos: number) => {
            // const prevLine: Line = linesInParagraph[pos-1];
            // const nextLine: Line = linesInParagraph[pos+1];
            if (this.isHeadingCandidate(line, commonFont, headingFonts)) {
              return pos;
            } else {
              return undefined;
            }
          }).filter((i: number) => i !== undefined);
          if (headingIdx.length > 0) {
            const lineIdx: number[] = [...Array(linesInParagraph.length).keys()].filter(
              x => !headingIdx.includes(x),
            );
            utils.groupConsecutiveNumbersInArray(lineIdx).forEach((group: number[]) => {
              const newLines: Line[] = [];
              group.forEach((id: number) => {
                newLines.push(linesInParagraph[id]);
              });
              if (newLines.length > 0) {
                paragraphLines.push(newLines);
              }
            });
            this.groupHeadingsByFont(headingIdx, linesInParagraph).forEach(headingGroup => {
              utils.groupConsecutiveNumbersInArray(headingGroup).forEach((group: number[]) => {
                const newHeadings: Line[] = [];
                group.forEach((id: number) => {
                  newHeadings.push(linesInParagraph[id]);
                });
                if (newHeadings.length > 0) {
                  headingLines.push(newHeadings);
                }
              });
            });
          } else {
            paragraphLines.push(linesInParagraph);
          }
        } else {
          logger.warn("can't account for headings while para merge - no font info available");
        }
      });

    if (headingLines.length > 0) {
      return { headingLines, paragraphLines };
    }

    return { headingLines: [], paragraphLines: paragraphs.map(paragraph => paragraph.content) };
  }

  private isHeadingCandidate(line: Line, mostCommonFont: Font, headingFonts: Font[]): boolean {
    const serializedHeadingFonts = headingFonts.map(font => JSON.stringify(font));

    if (!serializedHeadingFonts.includes(JSON.stringify(this.noColourFont(line.getMainFont())))) {
      return false;
    }

    return this.isHeadingLine(line, mostCommonFont);
  }

  private isHeadingLine(line: Line, commonFont: Font): boolean {
    const lineStr = line.toString();
    if (lineStr.length === 1 || !isNaN(lineStr as any)) {
      return false;
    }
    const wordCount = line.content.length;
    const isDifferentStyle = line.getMainFont().weight !== commonFont.weight;
    const isFontBigger = line.getMainFont().size > commonFont.size;
    const isFontUnique = line.isUniqueFont();
    const differentColor = line.getMainFont().color !== commonFont.color;
    const isNumber = !isNaN(lineStr as any);
    const textCase = this.textCase(lineStr);

    const features = [isDifferentStyle, isFontBigger, isFontUnique, textCase, wordCount, differentColor, isNumber];
    const clf = new DecisionTreeClassifier();

    return clf.predict(features) === 1;
  }

  private textCase(lineStr: string) {
    const isTitleCase = lineStr.split(" ").map((word) => {
      const lengthThreshold = 4;
      if (word.length > lengthThreshold) {
        return (/^[A-Z]\w+/.test(word) || /^(?:\W*\d+\W*)+\w+/.test(word));
      } else {
        return true;
      }
    }).reduce((acc, curr) => acc && curr);
    const isLowerCase = lineStr.toLowerCase() === lineStr;
    const isUpperCase = lineStr.toUpperCase() === lineStr;

    let textCase = 3;
    if (isTitleCase) {
      textCase = 2;
    } else if (isLowerCase) {
      textCase = 0;
    } else if (isUpperCase) {
      textCase = 1;
    }

    return textCase;
  }

  private groupHeadingsByFont(headingIndexes: number[], lines: Line[]): number[][] {
    // Skip join heading lines if they doesn't have same font
    const fontGroupedHeadings: number[][] = [];
    let joinedHeadings: number[] = [];
    headingIndexes.forEach((pos, index) => {
      const currentHeadingLineFont = lines[pos].getMainFont();
      const prevHeadingLineFont = index > 0 ? lines[index - 1].getMainFont() : null;
      if (!prevHeadingLineFont || currentHeadingLineFont.isEqual(prevHeadingLineFont)) {
        joinedHeadings.push(pos);
      } else {
        fontGroupedHeadings.push(joinedHeadings);
        joinedHeadings = [pos];
      }
    });
    if (joinedHeadings.length > 0) {
      fontGroupedHeadings.push(joinedHeadings);
    }

    return fontGroupedHeadings;
  }

  private mergeLinesIntoParagraphs(joinedLines: Line[][]): Paragraph[] {
    return joinedLines.map((group: Line[]) => {
      const paragraph: Paragraph = utils.mergeElements<Line, Paragraph>(
        new Paragraph(BoundingBox.merge(group.map((l: Line) => l.box))),
        ...group,
      );
      paragraph.properties.order = group[0].properties.order;
      return paragraph;
    });
  }

  private mergeLinesIntoHeadings(joinedLines: Line[][]): Heading[] {
    return joinedLines.map((group: Line[]) => {
      const heading: Heading = utils.mergeElements<Line, Heading>(
        new Heading(BoundingBox.merge(group.map((l: Line) => l.box))),
        ...group,
      );
      heading.properties.order = group[0].properties.order;
      return heading;
    });
  }

  private noColourFont(font: Font): Font {
    const newFont = new Font(font.name, font.size);
    newFont.weight = font.weight;
    newFont.isItalic = font.isItalic;
    newFont.isUnderline = font.isUnderline;
    newFont.color = null;
    return newFont;
  }

  /**
   * Returns most used font in document
   * @param doc The document to extract heading fonts
   */
  private commonFont(doc: Document): Font {
    return utils.findMostCommonFont(
      doc
        .getElementsOfType<Line>(Line, true)
        .map((l: Line) => l.content)
        .reduce((a, b) => a.concat(b), [])
        .map(w => w.font)
        .filter(f => f !== undefined),
    );
  }

  private pageOtherElements(page: Page): Element[] {
    return page.elements.filter(element => !(element instanceof Paragraph));
  }

  private getElementsWithParagraphs(elements: Element[], withParagraphs: Element[]): Element[] {
    elements.forEach(element => {
      const paragraphs = this.getParagraphsInElement(element);
      if (paragraphs.length > 0) {
        withParagraphs.push(element);
      } else if (Array.isArray(element.content)) {
        element.content.forEach(child => {
          if (child.content as Element[]) {
            this.getElementsWithParagraphs(child.content as Element[], withParagraphs);
          }
        });
      }
    });
    return withParagraphs;
  }

  private getParagraphsInElement(element: Element): Paragraph[] {
    if (Array.isArray(element.content)) {
      return element.content
        .filter(item => item instanceof Paragraph)
        .map(paragraph => paragraph as Paragraph);
    }
    return [];
  }

  private pageParagraphs(page: Page): Paragraph[] {
    return page.getElementsOfType<Paragraph>(Paragraph, false);
  }

  /**
   * Returns an array of fonts to be used for heading detection
   * @param doc The document to extract heading fonts
   */
  private headingFonts(doc: Document): Font[] {
    const allWords = doc.getElementsOfType<Word>(Word, true);
    const allFonts = [...allWords.map(w => this.noColourFont(w.font)).filter(f => f !== undefined)];

    const uniqueFonts: Font[] = [];
    allFonts.forEach(font => {
      if (uniqueFonts.filter(f => f.isEqual(font)).length === 0) {
        uniqueFonts.push(font);
      }
    });

    return uniqueFonts;
  }

  private headingsDetected(doc: Document): boolean {
    let detected = false;
    doc.pages.forEach(page => {
      if (page.getElementsOfType<Heading>(Heading, true).length > 0) {
        detected = true;
      }
    });
    return detected;
  }

  private computeHeadingLevels(document: Document) {

    const headings: Heading[] = document.getElementsOfType<Heading>(Heading, true);
    const clf = new DecisionTreeClassifierLevel();

    // TODO: try to normalize the features
    headings.forEach(h => {
      const size = h.getMainFont().size;
      const weight = h.getMainFont().weight === 'bold' ? 1 : 0;
      const textCase = this.textCase(h.toString());
      const features = [size, weight, textCase];
      // need to add 1 because the prediction is an index
      h.level = clf.predict(features) + 1;
    });
  }
}
