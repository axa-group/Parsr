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

import { spawn } from 'child_process';
import * as fs from 'fs';
import { parseString } from 'xml2js';
import {
  BoundingBox,
  Character,
  Document,
  Element,
  Font,
  Page,
  Word,
} from '../../types/DocumentRepresentation';
import { PdfminerPage } from '../../types/PdfminerPage';
import { PdfminerText } from '../../types/PdfminerText';
import { PdfminerTextline } from '../../types/PdfminerTextline';
import * as utils from '../../utils';
import logger from '../../utils/Logger';

/**
 * Executes the pdfminer extraction function, reading an input pdf file and extracting a document representation.
 * This function involves recovering page contents like words, bounding boxes, fonts and other information that
 * the pdfminer tool's output provides. This function spawns the externally existing pdfminer tool.
 *
 * @param pdfInputFile The path including the name of the pdf file for input.
 * @returns The promise of a valid document (in the format DocumentRepresentation).
 */
export function execute(pdfInputFile: string): Promise<Document> {
  return new Promise<Document>((resolveDocument, rejectDocument) => {
    return repairPdf(pdfInputFile).then(repairedPdf => {
      const xmlOutputFile: string = utils.getTemporaryFile('.xml');
      let pdf2txtLocation: string = utils.getCommandLocationOnSystem('pdf2txt.py');
      if (!pdf2txtLocation) {
        pdf2txtLocation = utils.getCommandLocationOnSystem('pdf2txt');
      }
      if (!pdf2txtLocation) {
        logger.debug(
          `Unable to find pdf2txt, the pdfminer executable on the system. Are you sure it is installed?`,
        );
      } else {
        logger.debug(`pdf2txt was found at ${pdf2txtLocation}`);
      }
      logger.info(`Extracting PDF contents using pdfminer...`);
      logger.debug(
        `${pdf2txtLocation} ${[
          '-c',
          'utf-8',
          // '-A', crashes pdf2txt.py using Benchmark axa.uk.business.owntools.pdf
          '-t',
          'xml',
          '-o',
          xmlOutputFile,
          repairedPdf,
        ].join(' ')}`,
      );

      if (!fs.existsSync(xmlOutputFile)) {
        fs.appendFileSync(xmlOutputFile, '');
      }

      const pdfminer = spawn(pdf2txtLocation, [
        '-c',
        'utf-8',
        // '-A', crashes pdf2txt.py using Benchmark axa.uk.business.owntools.pdf
        '-t',
        'xml',
        '-o',
        xmlOutputFile,
        repairedPdf,
      ]);

      pdfminer.stderr.on('data', data => {
        logger.error('pdfminer error:', data.toString('utf8'));
      });

      function parseXmlToObject(xml: string): Promise<object> {
        const promise = new Promise<object>((resolveObject, rejectObject) => {
          parseString(xml, { attrkey: '_attr' }, (error, dataObject) => {
            if (error) {
              rejectObject(error);
            }
            resolveObject(dataObject);
          });
        });
        return promise;
      }

      pdfminer.on('close', async code => {
        if (code === 0) {
          const xml: string = fs.readFileSync(xmlOutputFile, 'utf8');
          try {
            logger.debug(`Converting pdfminer's XML output to JS object..`);
            parseXmlToObject(xml).then((obj: any) => {
              const pages: Page[] = [];
              obj.pages.page.forEach(pageObj => pages.push(getPage(pageObj)));
              resolveDocument(new Document(pages, pdfInputFile));
            });
          } catch (err) {
            rejectDocument(`parseXml failed: ${err}`);
          }
        } else {
          rejectDocument(`pdfminer return code is ${code}`);
        }
      });
      // return doc;
    });
  });
}

function getPage(pageObj: PdfminerPage): Page {
  const boxValues: number[] = pageObj._attr.bbox.split(',').map(v => parseFloat(v));
  const pageBbox: BoundingBox = new BoundingBox(
    boxValues[0],
    boxValues[1],
    boxValues[2],
    boxValues[3],
  );

  let elements: Element[] = [];

  // treat paragraphs
  if (pageObj.textbox !== undefined) {
    pageObj.textbox.forEach(para => {
      para.textline.map(line => {
        elements = [...elements, ...breakLineIntoWords(line, ',', pageBbox.height)];
      });
    });
  }
  return new Page(parseFloat(pageObj._attr.id), elements, pageBbox);
}

// Pdfminer's bboxes are of the format: x0, y0, x1, y1. Our BoundingBox dims are as: left, top, width, height
function getBoundingBox(
  bbox: string,
  splitter: string = ',',
  pageHeight: number = 0,
  scalingFactor: number = 1,
): BoundingBox {
  const values: number[] = bbox.split(splitter).map(v => parseFloat(v) * scalingFactor);
  const width: number = Math.abs(values[2] - values[0]); // right - left = width
  const height: number = Math.abs(values[1] - values[3]); // top - bottom = height
  const left: number = values[0];
  const top: number = Math.abs(pageHeight - values[1]) - height; // invert x direction (pdfminer's (0,0)
  // is on the bottom left)
  return new BoundingBox(left, top, width, height);
}

function getMostCommonFont(theFonts: Font[]): Font {
  const fonts: Font[] = theFonts.reduce((a, b) => a.concat(b), []);

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
    return Font.undefinedFont;
  }
}

/**
 * Fetches the character a particular pdfminer's textual output represents
 * TODO: This placeholder will accomodate the solution at https://github.com/aarohijohal/pdfminer.six/issues/1 ...
 * TODO: ... For now, it returns a '?' when a (cid:) is encountered
 * @param character the character value outputted by pdfminer
 * @param font the font associated with the character  -- TODO to be taken into consideration here
 */
function getValidCharacter(character: string): string {
  return RegExp(/\(cid:/gm).test(character) ? '?' : character;
}

function breakLineIntoWords(
  line: PdfminerTextline,
  wordSeperator: string = ' ',
  pageHeight: number,
  scalingFactor: number = 1,
): Word[] {
  const notAllowedChars = ['\u200B']; // &#8203 Zero Width Space
  const words: Word[] = [];
  const fakeSpaces = thereAreFakeSpaces(line);
  const chars: Character[] = line.text
    .filter(char => !notAllowedChars.includes(char._) && !isFakeChar(char, fakeSpaces))
    .map(char => {
      if (char._ === undefined) {
        return undefined;
      } else {
        const font: Font = new Font(char._attr.font, parseFloat(char._attr.size), {
          weight: RegExp(/bold/gim).test(char._attr.font) ? 'bold' : 'medium',
          isItalic: RegExp(/italic/gim).test(char._attr.font) ? true : false,
          isUnderline: RegExp(/underline/gim).test(char._attr.font) ? true : false,
          color: ncolourToHex(char._attr.ncolour),
        });
        const charContent: string = getValidCharacter(char._);
        return new Character(
          getBoundingBox(char._attr.bbox, ',', pageHeight, scalingFactor),
          charContent,
          font,
        );
      }
    });
  if (chars[0] === undefined || chars[0].content === wordSeperator) {
    chars.splice(0, 1);
  }
  if (chars[chars.length - 1] === undefined || chars[chars.length - 1].content === wordSeperator) {
    chars.splice(chars.length - 1, chars.length);
  }

  if (chars.length === 0 || (chars.length === 1 && chars[0] === undefined)) {
    return words;
  }

  if (
    chars
      .filter(c => c !== undefined)
      .map(c => c.content.length)
      .filter(l => l > 1).length > 0
  ) {
    logger.debug(`pdfminer returned some characters of size > 1`);
  }

  const sepLocs: number[] = chars
    .map((c, i) => {
      if (c === undefined) {
        return i;
      } else {
        return undefined;
      }
    })
    .filter(l => l !== undefined)
    .filter(l => l !== 0)
    .filter(l => l !== chars.length);

  let charSelection: Character[] = [];
  if (sepLocs.length === 0) {
    charSelection = chars.filter(c => c !== undefined);
    words.push(
      new Word(
        BoundingBox.merge(charSelection.map(c => c.box)),
        charSelection,
        getMostCommonFont(charSelection.map(c => c.font)),
      ),
    );
  } else {
    charSelection = chars.slice(0, sepLocs[0]).filter(c => c !== undefined);
    if (charSelection.length > 0) {
      words.push(
        new Word(
          BoundingBox.merge(charSelection.map(c => c.box)),
          charSelection,
          getMostCommonFont(charSelection.map(c => c.font)),
        ),
      );
    }
    for (let i = 0; i !== sepLocs.length; ++i) {
      let from: number;
      let to: number;
      from = sepLocs[i] + 1;
      if (i !== sepLocs.length - 1) {
        to = sepLocs[i + 1];
      } else {
        to = chars.length;
      }
      charSelection = chars.slice(from, to).filter(c => c !== undefined);
      if (charSelection.length > 0) {
        words.push(
          new Word(
            BoundingBox.merge(charSelection.map(c => c.box)),
            charSelection,
            getMostCommonFont(charSelection.map(c => c.font)),
          ),
        );
      }
    }
  }
  return words;
}

function thereAreFakeSpaces(lines: PdfminerTextline): boolean {
  // Will remove all <text> </text> only if in line we found
  // <text> </text> follwed by empty <text> but with attributes
  // <text font="W" bbox="W" colourspace="X" ncolour="Y" size="Z"> </text>
  const emptyWithAttr = lines.text
    .map((word, index) => {
      return { text: word, pos: index };
    })
    .filter(word => word.text._ === undefined && word.text._attr !== undefined)
    .map(word => word.pos);
  const emptyWithNoAttr = lines.text
    .map((word, index) => {
      return { text: word, pos: index };
    })
    .filter(word => word.text._ === undefined && word.text._attr === undefined)
    .map(word => word.pos);

  let fakeSpaces = false;
  emptyWithNoAttr.forEach(pos => {
    if (emptyWithAttr.includes(pos + 1)) {
      fakeSpaces = true;
    }
  });
  return fakeSpaces;
}

function isFakeChar(word: PdfminerText, fakeSpacesInLine: boolean): boolean {
  if (fakeSpacesInLine && word._ === undefined && word._attr === undefined) {
    return true;
  }

  return false;
}

function ncolourToHex(color: string) {
  const rgbToHex = (r, g, b) =>
    '#' +
    [r, g, b]
      .map(x => {
        const hex = Math.ceil(x * 255).toString(16);
        return hex.length === 1 ? '0' + hex : hex;
      })
      .join('');

  const rgbColor = color
    .replace('[', '')
    .replace(']', '')
    .split(',');

  return rgbToHex(rgbColor[0], rgbColor[1] || rgbColor[0], rgbColor[2] || rgbColor[0]);
}

/**
 * Repair a pdf using the external mutool utility.
 * @param filePath The absolute filename and path of the pdf file to be repaired.
 */
function repairPdf(filePath: string) {
  return new Promise<string>(resolve => {
    const mutoolPath = utils.getCommandLocationOnSystem('mutool');
    if (!mutoolPath) {
      logger.warn('MuPDF not installed !! Skip clean PDF.');
      resolve(filePath);
    } else {
      const pdfOutputFile = utils.getTemporaryFile('.pdf');
      const pdfFixer = spawn('mutool', ['clean', filePath, pdfOutputFile]);
      pdfFixer.on('close', () => {
        // Check that the file is correctly written on the file system
        fs.fsyncSync(fs.openSync(filePath, 'r+'));
        resolve(pdfOutputFile);
      });
    }
  });
}
