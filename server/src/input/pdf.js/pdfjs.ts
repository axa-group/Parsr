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

import * as fs from 'fs';
import * as limit from 'limit-async';
import * as pdfjs from 'pdfjs-dist';
import {
  BoundingBox,
  Document,
  Font,
  Page,
  Word,
} from '../../types/DocumentRepresentation';
import * as utils from '../../utils';
import logger from '../../utils/Logger';

/**
 * Executes the pdfjs extraction function, reading an input pdf file and extracting a document representation.
 * This function involves recovering page contents like words, bounding boxes, fonts and other information that
 * the pdfjs tool's output provides.
 *
 * @param pdfInputFile The path including the name of the pdf file for input.
 * @returns The promise of a valid document (in the format DocumentRepresentation).
 */

// this is for limiting page fetching to 10 at the same time and avoid memory overflows
const limiter = limit(10);

export function execute(pdfInputFile: string): Promise<Document> {
  return new Promise<Document>((resolveDocument, rejectDocument) => {
    return repairPdf(pdfInputFile).then((repairedPdf: string) => {
      const pages: Array<Promise<Page>> = [];
      try {
        return (pdfjs.getDocument(repairedPdf) as any).promise.then(doc => {
          const numPages = doc.numPages;
          for (let i = 0; i < numPages; i += 1) {
            pages.push(limiter(loadPage)(doc, i + 1));
          }
          return Promise.all(pages).then((p: Page[]) => {
            resolveDocument(new Document(p, repairedPdf));
          });
        });
      } catch (e) {
        return rejectDocument(e);
      }
    });
  });
}

async function loadPage(document: any, pageNum: number): Promise<Page> {
  const page = await document.getPage(pageNum);
  const viewport = page.getViewport({ scale: 1.0 });
  const textContent = await page.getTextContent({
    normalizeWhitespace: true,
    disableCombineTextItems: true,
  });

  const pageElements: Word[] = [];
  const fontStyles = textContent.styles;

  /*
    each 'item.str' returned by pdf.js can be a string with multiple words and even have a splitted word.
    for this reason, we:
      - split the 'item.str' into words,
      - calculate each single word's BBox,
      - search for splitted words to join them together
  */
  textContent.items.forEach(item => {
    const font = new Font(fontStyles[item.fontName].fontFamily || 'undefined', item.transform[0]);
    const text = item.str;
    if (text.length > 0) {
      const words = text.split(' ');

      let wordLeft = item.transform[4];
      const avgCharWidth = item.width / text.length;
      words.forEach((word) => {
        const wordWidth = (word.length / text.length) * item.width;
        const wordBB = new BoundingBox(
          wordLeft,
          viewport.height - (item.transform[5] + item.height),
          wordWidth,
          item.height,
        );

        /*
          if this condition is met, it means that the actual word was splitted in half
          and it should be part of the last word pushed to the pageElements array.
        */
        if (
          pageElements[pageElements.length - 1]
          && pageElements[pageElements.length - 1].left
          + pageElements[pageElements.length - 1].width + 1 > wordBB.left
          && pageElements[pageElements.length - 1].left
          + pageElements[pageElements.length - 1].width - 1 < wordBB.left
        ) {
          pageElements[pageElements.length - 1].width += wordBB.width;
          pageElements[pageElements.length - 1].content = pageElements[pageElements.length - 1].content.concat(word);
        } else {
          pageElements.push(
            new Word(
              wordBB,
              word,
              font,
            ),
          );
        }

        /*
          the X coordinate of the next word is calculated using the width of the actual word
          and an average space width for the 'item.str'
        */
        wordLeft += wordWidth + avgCharWidth;
      });
    }
  });

  return new Page(
    pageNum,
    pageElements,
    new BoundingBox(0, 0, viewport.width, viewport.height),
  );
}

/**
 * Repair a pdf using the external qpdf and mutool utilities.
 * Use qpdf to decrcrypt the pdf to avoid errors due to DRMs.
 * @param filePath The absolute filename and path of the pdf file to be repaired.
 */
function repairPdf(filePath: string) {
  const qpdfPath = utils.getCommandLocationOnSystem('qpdf');
  let qpdfOutputFile = utils.getTemporaryFile('.pdf');
  if (qpdfPath) {
    const process = utils.spawnSync('qpdf', ['--decrypt', filePath, qpdfOutputFile]);

    if (process.status === 0) {
      logger.info(
        `qpdf repair successfully performed on file ${filePath}. New file at: ${qpdfOutputFile}`,
      );
    } else {
      logger.warn(
        'qpdf error for file ${filePath}:',
        process.status,
        process.stdout.toString(),
        process.stderr.toString(),
      );
      qpdfOutputFile = filePath;
    }
  } else {
    logger.warn(`qpdf not found on the system. Not repairing the PDF...`);
    qpdfOutputFile = filePath;
  }

  return new Promise<string>(resolve => {
    const mutoolPath = utils.getCommandLocationOnSystem('mutool');
    if (!mutoolPath) {
      logger.warn('MuPDF not installed !! Skip clean PDF.');
      resolve(qpdfOutputFile);
    } else {
      const mupdfOutputFile = utils.getTemporaryFile('.pdf');
      const pdfFixer = utils.spawn('mutool', ['clean', qpdfOutputFile, mupdfOutputFile]);
      pdfFixer.on('close', () => {
        // Check that the file is correctly written on the file system
        fs.fsyncSync(fs.openSync(qpdfOutputFile, 'r+'));
        logger.info(
          `mupdf cleaning successfully performed on file ${qpdfOutputFile}. Resulting file: ${mupdfOutputFile}`,
        );
        resolve(mupdfOutputFile);
      });
    }
  });
}
