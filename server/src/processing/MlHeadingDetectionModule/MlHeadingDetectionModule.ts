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
import { RandomForestClassifier } from './train_model/model';
import { DecisionTreeClassifier } from './train_model/model_level';

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

    doc.pages.forEach((page: Page) => {
      const newContents = this.extractHeadings(page, mainCommonFont, doc);
      const paras: Paragraph[] = this.mergeLinesIntoParagraphs(newContents.paragraphLines);
      const headings: Heading[] = this.mergeLinesIntoHeadings(newContents.headingLines);
      page.elements = newContents.rootElements.concat([...headings, ...paras]);
    });

    if (this.headingsDetected(doc)) {
      this.computeHeadingLevels(doc, mainCommonFont);
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
    doc: Document,
  ): { headingLines: Line[][]; paragraphLines: Line[][]; rootElements: Element[] } {
    // get all paragraphs in page root
    const pageParagraphs = this.pageParagraphs(page);
    return {
      ...this.extractHeadingsInParagraphs(pageParagraphs, commonFont, doc),
      rootElements: this.createHeadingsInOtherElements(
        this.pageOtherElements(page),
        commonFont,
        doc,
      ),
    };
  }

  private createHeadingsInOtherElements(
    elements: Element[],
    commonFont: Font,
    doc: Document,
  ): Element[] {
    this.getElementsWithParagraphs(elements, [])
      // this is to avoid setting table content as headings
      .filter(e => !(e instanceof TableCell))
      .forEach(element => {
        const newContents = this.extractHeadingsInParagraphs(
          this.getParagraphsInElement(element),
          commonFont,
          doc,
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
    doc: Document,
  ): { headingLines: Line[][]; paragraphLines: Line[][] } {
    const paragraphLines: Line[][] = [];
    const headingLines: Line[][] = [];

    paragraphs
      .map(paragraph => paragraph.content)
      .forEach(linesInParagraph => {
        let initiatedHeading = false;
        if (commonFont instanceof Font) {
          const headingIdx: number[] = linesInParagraph
            .map((line: Line, pos: number) => {
              if (
                (pos === 0 || initiatedHeading) &&
                this.isHeadingLine(line, commonFont, doc)
              ) {
                initiatedHeading = true;
                return pos;
              } else {
                initiatedHeading = false;
                return undefined;
              }
            })
            .filter((i: number) => i !== undefined);
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

  private isHeadingLine(line: Line, commonFont: Font, doc: Document): boolean {
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
    const fontRatio = this.fontRatio(doc, line.getMainFont());

    const features = [
      isDifferentStyle,
      isFontBigger,
      isFontUnique,
      textCase,
      wordCount,
      differentColor,
      isNumber,
      fontRatio,
    ];
    const clf = new RandomForestClassifier();

    return clf.predict(features) === 1;
  }

  private textCase(lineStr: string) {
    const isTitleCase = lineStr
      .split(' ')
      .map(word => {
        const lengthThreshold = 4;
        if (word.length > lengthThreshold) {
          return /^[A-Z]\w+/.test(word) || /^(?:\W*\d+\W*)+\w+/.test(word);
        } else {
          return true;
        }
      })
      .reduce((acc, curr) => acc && curr);
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

  /*
  🤔 Maybe we should also use 'page font ratio' as feature because I really think 
  that it could help a lot to decrease false positives. For instance think about 
  one document with a lot of pages with too much text but first page only contains one
  H1 and two or three or four lines in the bottom part with some annotation text.
  Font ratio for H1 could be like 0.0001 (for instance) and for bottom paragraph could be 
  0.002.
  But if we take care of page ratio then we could have:
  - H1 ratio 0.01
  - Bottom paragraph 0.99
  Having this ratios I really think that bottom paragraph should not be considered as header
  */
 // Currently making tests to verify this ('fontRatiosByPage')
  private fontRatio(document: Document, font: Font) {
    const allWords = document.getElementsOfType<Word>(Word, true);
    const allFonts = [...allWords.map(w => w.font).filter(f => f !== undefined)];
    const count = allFonts.filter(f => f.name === font.name && f.size === font.size && f.weight === font.weight && f.isItalic === font.isItalic && f.isUnderline === font.isUnderline && f.color === font.color).length;

    return count / allFonts.length;
  }
  // private fontRatiosByPage(page: Page, font: Font) {
  //   const wordsInPage = page.getElementsOfType<Word>(Word, true);
  //   const fontsInPage = [...wordsInPage.map(w => w.font).filter(f => f !== undefined)];
  //   const count = fontsInPage.filter(f => f.name === font.name && f.size === font.size && f.weight === font.weight && f.isItalic === font.isItalic && f.isUnderline === font.isUnderline && f.color === font.color).length;

  //   return count / fontsInPage.length;
  // }

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

  /**
   * Returns most used font in document
   * @param doc The document to extract heading fonts
   * 🤔 I'm not sure if having only one 'main font' is enought because a 
   * normal document should have only one main font for texts but there 
   * are a lot of cases that one document uses 'main font' and 'secodnary font'
   */
  // TODO: consider multiple common fonts, criteria: the font ratio is > threshold (to be determined)
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

  private headingsDetected(doc: Document): boolean {
    let detected = false;
    doc.pages.forEach(page => {
      if (page.getElementsOfType<Heading>(Heading, true).length > 0) {
        detected = true;
      }
    });
    return detected;
  }

  private computeHeadingLevels(document: Document, commonFont: Font) {
    const headings: Heading[] = document.getElementsOfType<Heading>(Heading, true);
    const clf = new DecisionTreeClassifier();

    headings.forEach(h => {
      const size = h.getMainFont().size;
      const weight = h.getMainFont().weight === 'bold' ? 1 : 0;
      const textCase = this.textCase(h.toString());
      const isFontBigger = size > commonFont.size ? 1 : 0;
      const differentColor = h.getMainFont().color !== commonFont.color ? 1 : 0;
      const features = [size, weight, textCase, isFontBigger, differentColor];
      h.level = clf.predict(features) + 1;
    });
  }
}
