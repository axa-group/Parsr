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
  Word,
} from '../../types/DocumentRepresentation';

import * as utils from '../../utils';
import logger from '../../utils/Logger';
import { Module } from '../Module';
import { ReadingOrderDetectionModule } from '../ReadingOrderDetectionModule/ReadingOrderDetectionModule';
import { WordsToLineModule } from '../WordsToLineModule/WordsToLineModule';
import * as defaultConfig from './defaultConfig.json';

interface Options {
  tolerance?: number;
  computeHeadings?: boolean;
}

const defaultOptions = (defaultConfig as any) as Options;

type LineSpace = {
  distance: number;
  usageRatio: number;
  distanceHeightRatio: number;
  totalHeight: number;
  lines: Line[];
};
/**
 * Stability: Stable
 * Merge lines into paragraphs
 */
export class LinesToParagraphModule extends Module<Options> {
  public static moduleName = 'lines-to-paragraph';
  public static dependencies = [ReadingOrderDetectionModule, WordsToLineModule];
  public maxLineDistance = 0;

  constructor(options?: Options) {
    super(options, defaultOptions);
  }

  public main(doc: Document): Document {
    // get the main body font from all the words in document
    const textBodyFont: Font = utils.findMostCommonFont(
      this.getAllDocumentLines(doc)
        .map((l: Line) => l.content)
        .reduce((a, b) => a.concat(b), [])
        .map(w => w.font)
        .filter(f => f !== undefined),
    );

    // const ratioFonts = this.avgFontUse(doc);
    // console.log(ratioFonts.length);

    doc.pages.forEach((page: Page) => {
      this.maxLineDistance = page.height * 0.2;
      const existingHeadings = page.getElementsOfType<Heading>(Heading);
      const existingParagraphs = page.getElementsOfType<Paragraph>(Paragraph);
      if (existingHeadings.length > 0 || existingParagraphs.length > 0) {
        logger.warn(
          'Warning: this page already has some headings or pragrpahs in it. Not performing paragraph merge.',
        );
        return page;
      }

      // get all the lines
      const lines = this.getPageLines(page);

      // get all the fonts to use for heading
      const headingFonts = this.heagingFonts(doc);

      // get the spaces between all lines
      const interLinesSpaces: LineSpace[] = this.getInterLinesSpace(lines);

      // join lines among them using the spaces computed above
      const joinedLines: Line[][] = this.joinLinesWithSpaces(lines, interLinesSpaces);

      // perform line merge for all the lines inside other elements
      let otherElements: Element[] = this.getElementsExcept(page, lines);
      otherElements = this.joinLinesInElements(otherElements, textBodyFont, headingFonts);

      // Clean the properties.cr  information as it is not usefull down the line
      joinedLines.forEach((theseLines: Line[]) => {
        theseLines.forEach((thisLine: Line) => {
          thisLine.content.forEach((thisWord: Word) => {
            if (thisWord.properties && thisWord.properties.cr) {
              delete thisWord.properties.cr;
              delete thisWord.properties.cl;
            }
          });
        });
      });

      if (this.options.computeHeadings) {
        const newStructures = this.extractHeadings(joinedLines, textBodyFont, headingFonts);
        const paras: Paragraph[] = this.mergeLinesIntoParagraphs(newStructures.newLines);
        const headings: Heading[] = this.mergeLinesIntoHeadings(newStructures.headingLines);
        page.elements = otherElements.concat([...headings, ...paras]);

        logger.debug(
          `Made ${headings.length} headings and ${paras.length} paras from ${lines.length} lines`,
        );
      } else {
        const paras: Paragraph[] = this.mergeLinesIntoParagraphs(joinedLines);
        page.elements = otherElements.concat(paras);

        logger.debug(`Made ${paras.length} paras from ${lines.length} lines`);
      }
      // this.getPageParagraphs(page).map(paragraph => {
      // console.log('Paragraph ' + paragraph.id + ' order ' + paragraph.properties.order);
      // TODO: Set fine paragraph order
      // });
      return page;
    });

    if (this.options.computeHeadings) {
      this.computeHeadingLevels(doc);
    }
    return doc;
  }

  private isHeadingCandidate(
    line: Line,
    mostCommonFont: Font,
    headingFonts: Font[],
    generalUpperCase: boolean,
    generalTitleCase: boolean,
  ): boolean {
    const serializedHeadingFonts = headingFonts.map(font => JSON.stringify(font));
    if (!serializedHeadingFonts.includes(JSON.stringify(this.noColourFont(line.getMainFont())))) {
      /*console.log(
        'Line ' + line.id + ' has not heading font ' + this.noColourFont(line.getMainFont()),
      );*/
      return false;
    }
    return this.isHeadingLine(line, mostCommonFont, generalUpperCase, generalTitleCase);
  }

  private isHeadingLine(
    line: Line,
    commonFont: Font,
    upperCase: boolean,
    titleCase: boolean,
  ): boolean {
    return (
      line.getMainFont().size > commonFont.size ||
      (line.getMainFont().weight === 'bold' && commonFont.weight !== 'bold') ||
      (line.content.map(w => RegExp(/^[a-z][A-z]*$/gm).test(w.toString())).filter(p => p).length >
        0 &&
        (line.toString().toUpperCase() === line.toString() && !upperCase)) ||
      (line.content.map(w => RegExp(/^[a-z][A-z]*$/gm).test(w.toString())).filter(p => p).length >
        0 &&
        (utils.toTitleCase(line.toString()) === line.toString() && !titleCase))
    );
  }

  private joinLinesInElements(
    elements: Element[],
    textBodyFont: Font,
    headingFonts: Font[],
  ): Element[] {
    const withLines: Element[] = [];
    this.getElementsWithLines(elements, withLines);
    withLines.forEach(element => {
      const lines = this.getLinesInElement(element);
      const interLinesSpaces = this.getInterLinesSpace(lines);
      const joinedLines: Line[][] = this.joinLinesWithSpaces(lines, interLinesSpaces);
      if (this.options.computeHeadings) {
        const newStructures = this.extractHeadings(joinedLines, textBodyFont, headingFonts);
        const paras: Paragraph[] = this.mergeLinesIntoParagraphs(newStructures.newLines);
        const headings: Heading[] = this.mergeLinesIntoHeadings(newStructures.headingLines);
        element.content = [...headings, ...paras];
      } else {
        element.content = this.mergeLinesIntoParagraphs(joinedLines);
      }
    });
    return elements;
  }

  private getLinesInElement(element: Element): Line[] {
    if (Array.isArray(element.content)) {
      const lines = element.content;
      return lines.filter(item => item instanceof Line).map(line => line as Line);
    }
    return [];
  }

  private getElementsWithLines(elements: Element[], withLines: Element[]) {
    elements.forEach(element => {
      const lines = this.getLinesInElement(element);
      if (lines.length > 0) {
        withLines.push(element);
      } else if (Array.isArray(element.content)) {
        element.content.forEach(child => {
          if (child.content as Element[]) {
            this.getElementsWithLines(child.content as Element[], withLines);
          }
        });
      }
    });
  }

  private getElementsExcept(page: Page, excludeLines: Line[]): Element[] {
    return page.elements.filter(
      element => !(element instanceof Line) || !excludeLines.includes(element),
    );
  }

  private getPageLines(page: Page): Line[] {
    return page.getElementsOfType<Line>(Line, false).sort(utils.sortElementsByOrder);
  }

  private getAllDocumentLines(document: Document): Line[] {
    return document.getElementsOfType<Line>(Line, true);
  }

  private joinLinesWithSpaces(lines: Line[], lineSpaces: LineSpace[]): Line[][] {
    const toBeMerged: Line[][] = [];
    let paragraphLines: Line[] = [];

    const isLineInsideParagraph = (lineToFind: Line) => {
      return toBeMerged
        .reduce((prev, curr) => {
          return prev.concat(curr);
        }, [])
        .map(line => line.id)
        .includes(lineToFind.id);
    };

    lineSpaces.forEach(space => {
      lines.forEach((line, index) => {
        const nextLine = this.getNextLine(index, lines);
        let currentLineDistance = this.getInterLineDistance(line, nextLine);

        if (this.shouldAdjustLineDistance(currentLineDistance, lineSpaces)) {
          currentLineDistance = this.findAccuratedDistance(currentLineDistance, lineSpaces);
        }

        if (currentLineDistance != null && currentLineDistance <= space.distance) {
          if (!isLineInsideParagraph(line)) {
            paragraphLines.push(line);
          } else if (paragraphLines.length > 0) {
            toBeMerged.push([...paragraphLines]);
            paragraphLines = [];
          }

          if (currentLineDistance > this.maxLineDistance && paragraphLines.length > 0) {
            toBeMerged.push([...paragraphLines]);
            paragraphLines = [];
          }
        } else if (
          (currentLineDistance > space.distance && paragraphLines.length > 0) ||
          currentLineDistance == null
        ) {
          if (paragraphLines.length > 0) {
            if (!isLineInsideParagraph(line)) {
              paragraphLines.push(line);
            }
            toBeMerged.push([...paragraphLines]);
            paragraphLines = [];
          } else if (!isLineInsideParagraph(line)) {
            paragraphLines.push(line);
            if (currentLineDistance == null) {
              toBeMerged.push([...paragraphLines]);
              paragraphLines = [];
            }
          }
        }
      });
    });

    if (lines.length === 1 && lineSpaces.length === 0) {
      toBeMerged.push(lines);
    }
    return toBeMerged;
  }

  private findAccuratedDistance(distance: number, lineSpaces: LineSpace[]): number {
    const accurated = lineSpaces
      .map(space => {
        return {
          distance: space.distance,
          dif: Math.abs(distance.valueOf() - space.distance.valueOf()),
        };
      })
      .sort((a, b) => a.dif - b.dif);

    if (accurated.length > 0) {
      return accurated[0].distance;
    }
    return distance;
  }

  private shouldAdjustLineDistance(distance: number, lineSpaces: LineSpace[]): boolean {
    if (distance == null) {
      return false;
    }
    return lineSpaces.filter(space => space.distance === distance).shift() == null;
  }

  private getNextLine(index: number, inLines: Line[]): Line {
    if (index + 1 >= inLines.length) {
      return null;
    }

    const nextLine = inLines[index + 1];
    const currentLine = inLines[index];
    if (nextLine.top < currentLine.top) {
      return null;
    }

    return nextLine;
  }

  private getInterLinesSpace(lines: Line[]): LineSpace[] {
    const interLineSpaces = this.getPercentagedLineSpaces(lines);
    return this.removeMinorDistancesChanges(interLineSpaces);
  }

  private removeMinorDistancesChanges(lines: LineSpace[]): LineSpace[] {
    const sortedByDistance = lines.sort((a, b) => {
      return a.distance.valueOf() - b.distance.valueOf();
    });
    // .filter(space => space.distance >= 0);

    const mergedDistances: LineSpace[] = [];
    sortedByDistance.forEach((distance, index) => {
      if (
        index > 0 &&
        distance.distanceHeightRatio.valueOf() -
          sortedByDistance[index - 1].distanceHeightRatio.valueOf() <
          this.options.tolerance
      ) {
        const mergedTotalHeight =
          mergedDistances[mergedDistances.length - 1].totalHeight.valueOf() +
          distance.totalHeight.valueOf();
        const mergedLines = [
          ...mergedDistances[mergedDistances.length - 1].lines,
          ...distance.lines,
        ];
        mergedDistances[mergedDistances.length - 1] = {
          distance: distance.distance,
          usageRatio:
            mergedDistances[mergedDistances.length - 1].usageRatio.valueOf() +
            distance.usageRatio.valueOf(),
          lines: mergedLines,
          totalHeight: mergedTotalHeight,
          distanceHeightRatio:
            distance.distance.valueOf() / (mergedTotalHeight / mergedLines.length),
        };
      } else {
        mergedDistances.push(distance);
      }
    });

    return mergedDistances.sort((a, b) => {
      return b.usageRatio.valueOf() - a.usageRatio.valueOf();
    });
    // .filter(space => space.distance >= 0);
  }

  private getPercentagedLineSpaces(lines: Line[]): LineSpace[] {
    const linesSpaces = [];
    lines.forEach((line, index) => {
      const nextLine = index + 1 < lines.length ? lines[index + 1] : null;
      const distance = this.getInterLineDistance(line, nextLine);
      if (distance != null) {
        const existingDistance = linesSpaces.filter(space => space.distance === distance).shift();
        if (existingDistance) {
          existingDistance.lines.push(line.id);
          existingDistance.usageRatio = Number(
            (existingDistance.lines.length / lines.length).toPrecision(3),
          );
          existingDistance.totalHeight += line.height;
        } else {
          linesSpaces.push({
            distance,
            usageRatio: Number((1 / lines.length).toPrecision(3)),
            lines: [line.id],
            totalHeight: line.height,
          });
        }
      }
    });

    linesSpaces.map(space => {
      space.distanceHeightRatio = space.distance / (space.totalHeight / space.lines.length);
    });

    return linesSpaces.sort((a, b) => {
      return b.usageRatio.valueOf() - a.usageRatio.valueOf();
    });
  }

  private getInterLineDistance(line: Line, nextLine: Line): number {
    if (!nextLine) {
      return null;
    }
    const distance = nextLine.top - line.bottom;
    return Math.round(distance);
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

  /**
   * Takes into account potential headings inside a paragraph
   * splits a paragraph into multiple ones and returns heading candidates
   * @param lineGroups List of joined lines to be alterered
   */
  private extractHeadings(
    lineGroups: Line[][],
    textBodyFont: Font,
    headingFonts: Font[],
  ): { headingLines: Line[][]; newLines: Line[][] } {
    const newLineGroups: Line[][] = [];
    const newHeadingGroups: Line[][] = [];
    lineGroups.forEach(lineGroup => {
      if (textBodyFont instanceof Font) {
        const headingIdx: number[] = lineGroup
          .map((line: Line, pos: number) => {
            if (
              this.isHeadingCandidate(
                line,
                textBodyFont,
                headingFonts,
                utils.isGeneralUpperCase(lineGroup),
                utils.isGeneralTitleCase(lineGroup),
              )
            ) {
              return pos;
            } else {
              return undefined;
            }
          })
          .filter((i: number) => i !== undefined);
        if (headingIdx.length > 0) {
          const lineIdx: number[] = [...Array(lineGroup.length).keys()].filter(
            x => !headingIdx.includes(x),
          );
          utils.groupConsecutiveNumbersInArray(lineIdx).forEach((group: number[]) => {
            const newLines: Line[] = [];
            group.forEach((id: number) => {
              newLines.push(lineGroup[id]);
            });
            if (newLines.length > 0) {
              newLineGroups.push(newLines);
            }
          });
          this.groupHeadingsByFont(headingIdx, lineGroup).forEach(headingGroup => {
            utils.groupConsecutiveNumbersInArray(headingGroup).forEach((group: number[]) => {
              const newHeadings: Line[] = [];
              group.forEach((id: number) => {
                newHeadings.push(lineGroup[id]);
              });
              if (newHeadings.length > 0) {
                newHeadingGroups.push(newHeadings);
              }
            });
          });
        } else {
          newLineGroups.push(lineGroup);
        }
      } else {
        logger.warn("can't account for headings while para merge - no font info available");
      }
    });
    if (newHeadingGroups.length > 0) {
      return { headingLines: newHeadingGroups, newLines: newLineGroups };
    } else {
      return { headingLines: [], newLines: lineGroups };
    }
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

    headings.forEach(h => {
      const level = uniqueSortedFonts
        .map(f => f.size + '|' + f.weight + '|' + f.upperCase)
        .indexOf(serializeFont(h));
      h.level = level + 1;
    });
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

  /**
   * Returns an array of fonts to be used for heading detection
   * @param doc The document to extract heading fonts
   */
  private heagingFonts(doc: Document): Font[] {
    const allWords = doc.getElementsOfType<Word>(Word, true);
    // console.log('Total Words ' + allWords.length.toString());
    // const allLines = doc.getElementsOfType<Line>(Line, true).filter(line => line.isUniqueFont());
    // const allFonts = allLines.map(line => this.noColouredFont(line.getMainFont()));
    const allFonts = [...allWords.map(w => this.noColourFont(w.font)).filter(f => f !== undefined)];

    let uniqueFonts: Font[] = [];
    allFonts.forEach(font => {
      if (uniqueFonts.filter(f => f.isEqual(font)).length === 0) {
        uniqueFonts.push(font);
      }
    });

    // console.log('Total Fonts ' + uniqueFonts.length.toString());
    uniqueFonts = uniqueFonts.filter(font => {
      const avg = allWords.filter(w => this.noColourFont(w.font).isEqual(font)).length;
      // Only fonts that are used less than 10% of
      // all words will be used to exctract headings
      // TODO: Add a module param to change this value
      return avg / allWords.length < 0.02;
    });

    // console.log('Heading Fonts');
    // console.log(uniqueFonts);
    // console.log('Heading Fonts ' + uniqueFonts.length.toString());
    // .map(font => this.noColouredFont(font)); // Skip fonts that only have diferent color

    return uniqueFonts;
  }

  /*
  private heagingFonts(doc: Document): Font[] {
    const allWords = doc.getElementsOfType<Word>(Word, true);
    const allFonts = [
      ...allWords.map(w => this.noColouredFont(w.font)).filter(f => f !== undefined),
    ];

    let uniqueFonts: Font[] = [];
    allFonts.forEach(font => {
      if (uniqueFonts.filter(f => f.isEqual(font)).length === 0) {
        uniqueFonts.push(font);
      }
    });

    console.log('All fonts');

    uniqueFonts = uniqueFonts.filter(font => {
      const avg = allWords.filter(w => this.noColouredFont(w.font).isEqual(font)).length;
      // Only fonts that are less used than 20% of
      // all words will be used to exctract headings
      console.log(font);
      console.log('AVG ' + (avg / allWords.length).toString());
      // TODO: Add a module param to change this value
      return avg / allWords.length < 0.2;
    });
    // .map(font => this.noColouredFont(font)); // Skip fonts that only have diferent color

    console.log('Heading fonts');
    console.log(uniqueFonts);

    return uniqueFonts;
  }
  */

  private noColourFont(font: Font): Font {
    const newFont = new Font(font.name, font.size);
    newFont.weight = font.weight;
    newFont.isItalic = font.isItalic;
    newFont.isUnderline = font.isUnderline;
    newFont.color = null;
    return newFont;
  }
}
