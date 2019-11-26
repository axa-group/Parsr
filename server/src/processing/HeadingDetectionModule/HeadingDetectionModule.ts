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
} from '../../types/DocumentRepresentation';
import * as utils from '../../utils';
import logger from '../../utils/Logger';
import { LinesToParagraphModule } from '../LinesToParagraphModule/LinesToParagraphModule';
import { Module } from '../Module';
import { DecisionTreeClassifier } from './model';

export class HeadingDetectionModule extends Module {
  public static moduleName = 'heading-detection';
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

    // get the main body font from all the words in document
    // const mainCommonLineHeight = this.commonLineHeight(doc);

    const headingLines = doc.getElementsOfType<Line>(Line, true)
      .filter((line, i, lines) => this.isHeadingCandidate(line, lines[i - 1], lines[i + 1]));

    doc.pages.forEach((page: Page) => {
      const newContents = this.extractHeadings(
        page,
        mainCommonFont,
        headingLines,
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
    detectedHeadings: Line[],
  ): { headingLines: Line[][]; paragraphLines: Line[][]; rootElements: Element[] } {
    // get all paragraphs in page root
    const pageParagraphs = this.pageParagraphs(page);
    return {
      ...this.extractHeadingsInParagraphs(
        pageParagraphs,
        commonFont,
        detectedHeadings,
      ),
      rootElements: this.createHeadingsInOtherElements(
        this.pageOtherElements(page),
        commonFont,
        detectedHeadings,
      ),
    };
  }

  private createHeadingsInOtherElements(
    elements: Element[],
    commonFont: Font,
    detectedHeadings: Line[],
  ): Element[] {
    this.getElementsWithParagraphs(elements, []).forEach(element => {
      const newContents = this.extractHeadingsInParagraphs(
        this.getParagraphsInElement(element),
        commonFont,
        detectedHeadings,
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
    detectedHeadings: Line[],
  ): { headingLines: Line[][]; paragraphLines: Line[][] } {
    const paragraphLines: Line[][] = [];
    const headingLines: Line[][] = [];
    paragraphs.forEach((paragraph) => {
      const linesInParagraph = paragraph.content;
      if (commonFont instanceof Font) {
        const headingIdx: number[] = linesInParagraph
          .map((line: Line, pos: number) => {
            if (detectedHeadings.includes(line)) {
              return pos;
            } else {
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

    return {
      headingLines: [],
      paragraphLines: paragraphs.map(paragraph => paragraph.content),
    };
  }

  private isHeadingCandidate(line: Line, previousLine?: Line, nextLine?: Line): boolean {
    const font = line.getMainFont();

    const titleCase = this.isTitleCase(line) ? 1 : 0;
    const isBold = font.weight === 'bold' && line.isUniqueFont() ? 1 : 0;
    const isUpper = line.toString().toUpperCase() === line.toString()
      && line.toString().toLowerCase() !== line.toString() ? 1 : 0;
    let prevLengthRatio = 0;
    let nextLengthRatio = 0;
    let prevSizeRatio = 0;
    let nextSizeRatio = 0;
    let sameColorPrev = 0;
    let sameColorNext = 0;

    if (previousLine) {
      const prevFont = previousLine.getMainFont();
      prevSizeRatio = font.size / prevFont.size;
      sameColorPrev = +(prevFont.color === font.color);
      prevLengthRatio = line.content.length / previousLine.content.length;
    }

    if (nextLine) {
      const nextFont = nextLine.getMainFont();
      nextSizeRatio = font.size / nextFont.size;
      sameColorNext = +(nextFont.color === font.color);
      nextLengthRatio = line.content.length / nextLine.content.length;
    }

    const clf = new DecisionTreeClassifier();
    const features = [
      prevSizeRatio,
      nextSizeRatio,
      isBold,
      isUpper,
      prevLengthRatio,
      nextLengthRatio,
      titleCase,
      sameColorPrev,
      sameColorNext];

    return clf.predict(features) === 1;
  }

  private isTitleCase(line: Line) {
    return line.content.map((word) => {
      const lengthThreshold = 4;
      const text = word.toString();
      if (text.length > lengthThreshold) {
        return (/^[A-Z]\w+/.test(text) || /^(?:\W*\d+\W*)+\w+/.test(text));
      } else {
        return true;
      }
    }).reduce((acc, curr) => acc && curr);
  }

  private groupHeadingsByFont(headingIndexes: number[], lines: Line[]): number[][] {
    // Skip join heading lines if they doesn't have same font
    const fontGroupedHeadings: number[][] = [];
    let joinedHeadings: number[] = [];
    headingIndexes.forEach((pos, i) => {
      const currentHeadingLineFont = lines[pos].getMainFont();
      const prevHeadingLineFont = i > 0 ? lines[i - 1].getMainFont() : null;
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

  /**
   * Returns most used line height in document
   * @param doc The document to extract main line height
   */
  /*private commonLineHeight(doc: Document): number {
    const allHeights = doc
      .getElementsOfType<Line>(Line, true)
      .map((l: Line) => l.height)
      .reduce((a, b) => a.concat(b), []);

    const groupedHeights = {};
    allHeights.forEach(i => {
      groupedHeights[i] = (groupedHeights[i] || 0) + 1;
    });

    const mostUsed = Object.keys(groupedHeights).sort(
      (a, b) => groupedHeights[b] - groupedHeights[a],
    );

    return Number(mostUsed[0]);
  }*/

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

  private computeHeadingLevels(document: Document) {
    const headings: Heading[] = document.getElementsOfType<Heading>(Heading, true);
    const fontInfo = (heading: Heading) => {
      return {
        size: heading.getMainFont().size,
        weight: heading.getMainFont().weight,
        upperCase: utils.isGeneralUpperCase(heading.content),
      };
    };
    // get all heading fonts sorted by size & upperCase
    // TODO: ¿ sort also by weight ?
    const sortedFonts = headings
      /*.filter(h => {
        console.log(
          h.toString() + ' Footer ' + h.properties.isFooter + ' header ' + h.properties.isHeader,
        );
        return !h.properties.isFooter && !h.properties.isHeader;
      })*/
      .map(h => fontInfo(h))
      .sort((a, b) => {
        if (a.size !== b.size) {
          return b.size - a.size;
        }
        return a.upperCase === b.upperCase ? 0 : a.upperCase ? -1 : 1;
      });
    // remove duplicates
    const uniqueSortedFonts = [...new Set(sortedFonts.map(f => JSON.stringify(f)))].map(s =>
      JSON.parse(s),
    );

    const serializeFont = (heading: Heading) => {
      return (
        fontInfo(heading).size + '|' + fontInfo(heading).weight + '|' + fontInfo(heading).upperCase
      );
    };

    // console.log(uniqueSortedFonts);

    headings.forEach(h => {
      const level = uniqueSortedFonts
        .map(f => f.size + '|' + f.weight + '|' + f.upperCase)
        .indexOf(serializeFont(h));
      h.level = level + 1;
    });
  }
}
