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
import * as filetype from 'file-type';
import * as fs from 'fs';
import { BoundingBox, Document, Page, Word } from '../../types/DocumentRepresentation';
import * as utils from '../../utils';
import * as CommandExecuter from '../../utils/CommandExecuter';
import { DumpPdfLink, DumpPdfLinksResponse, extractLinks } from '../../utils/DumpPdfUtils';
import logger from '../../utils/Logger';
import { Module } from '../Module';

// TODO Test on other types of links (actionGoToR, actionLaunch, etc.)
//      Maybe HTML isn't the right format to use.
//      Putting all of this as metadata/property may be a better solution.
/**
 * Stability: Experimental
 * Convert PDF links to HTML links
 */

export class LinkDetectionModule extends Module {
  public static moduleName = 'link-detection';

  public async main(doc: Document): Promise<Document> {
    let mdLinks: DumpPdfLinksResponse[] = [];
    const fileType: { ext: string; mime: string } =
      doc.inputFile && filetype(fs.readFileSync(doc.inputFile));
    if (!fileType || fileType === null || (fileType && fileType.ext !== 'pdf')) {
      logger.warn(
        `Warning: Input file ${doc.inputFile} is not a PDF (${utils.prettifyObject(fileType)}); \
        not using meta info for link detection..`,
      );
    } else {
      mdLinks = await this.getFileMetadata(doc.inputFile);
    }

    const count = mdLinks.reduce((acc, l) => acc + l.links.length, 0);
    logger.info('Found ' + count + ' links in document metadata.');
    let splittedLinkPart: Word = null;

    doc.pages.forEach((page: Page) => {
      const pageLinks = mdLinks.find(l => l.pageNumber + 1 === page.pageNumber);
      for (let i = 0; i < page.getElementsOfType<Word>(Word, true).length; i++) {
        // for a given word, check if the word matches any not used link position.
        let word = page.getElementsOfType<Word>(Word, true)[i];
        let nextWord = page.getElementsOfType<Word>(Word, true)[i + 1];
        (pageLinks || { links: [] }).links.forEach(pageLink => {
          const linkBB = new BoundingBox(
            pageLink.box.left,
            page.height - pageLink.box.top,
            pageLink.box.width,
            pageLink.box.height,
          );

          if (Math.abs(BoundingBox.getOverlap(linkBB, word.box).box2OverlapProportion) > 0.7) {
            word.properties.targetURL = this.buildLinkTarget(pageLink);
          }
        });

        // Set the targetURL property if it match the link or mail pattern.
        // For the link it will first match the beginning of link and then the full link pattern
        // to be able to rebuild a link which is separated on two lines.
        if (!word.properties.targetURL) {
          const linkRegexp = /\b((http|https):\/\/?|(www))[^\s()<>]+(?:\([\w\d]+\)|([^[:punct:]\s]|\/?))/;
          const fullLinkRegexp = /(https?:\/\/(?:www\.|(?!www))[a-zA-Z0-9][a-zA-Z0-9-]+[a-zA-Z0-9]\.[^\s]{2,}|www\.[a-zA-Z0-9][a-zA-Z0-9-]+[a-zA-Z0-9]\.[^\s]{2,}|https?:\/\/(?:www\.|(?!www))[a-zA-Z0-9]+\.[^\s]{2,}|www\.[a-zA-Z0-9]+\.[^\s]{2,})/;
          const mailRegexp = /^(("[\w-\s]+")|([\w-]+(?:\.[\w-]+)*)|("[\w-\s]+")([\w-]+(?:\.[\w-]+)*))(@((?:[\w-]+\.)*\w[\w-]{0,66})\.([a-z]{2,6}(?:\.[a-z]{2})?)$)|(@\[?((25[0-5]\.|2[0-4][0-9]\.|1[0-9]{2}\.|[0-9]{1,2}\.))((25[0-5]|2[0-4][0-9]|1[0-9]{2}|[0-9]{1,2})\.){2}(25[0-5]|2[0-4][0-9]|1[0-9]{2}|[0-9]{1,2})\]?$)/;
          if (splittedLinkPart) {
            word.properties.targetURL = splittedLinkPart
                .toString()
                .concat(word.toString())
                .match(linkRegexp)[0];
            splittedLinkPart = null;
            word.properties.splittedLink = true;
          } else if (word.toString().match(linkRegexp)) {
            if (!word.toString().match(fullLinkRegexp)) {
              word.properties.targetURL = word
                .toString()
                .concat(nextWord.toString())
                .match(linkRegexp)[0];
              splittedLinkPart = word;
              word.properties.splittedLink = true;
            } else {
              word.properties.targetURL = word.toString().match(linkRegexp)[0];
            }
          } else if (word.toString().match(mailRegexp)) {
            word.properties.targetURL = `mailto:${word.toString().match(mailRegexp)[0]}`;
          }
        }
      }
    });
    return doc;
  }

  /*
    runs the 'dumppdf.py' script and returns a JSON with all the metadata found in the file
  */
  private getFileMetadata(pdfFilePath: string): Promise<DumpPdfLinksResponse[]> {
    return new Promise(resolve => {
      CommandExecuter.dumpPdf(pdfFilePath)
        .then(utils.sanitizeXML)
        .then(extractLinks)
        .then(links => {
          resolve(links);
        })
        .catch(() => {
          resolve([]);
        });
    });
  }

  private buildLinkTarget(l: DumpPdfLink): string {
    let targetURL = l.anchor.target;
    if (l.anchor.type === 'GoTo') {
      targetURL = '#'.concat(targetURL);
    }
    return targetURL;
  }
}
