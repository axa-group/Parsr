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
import * as filetype from 'file-type';
import * as fs from 'fs';
import { BoundingBox, Document, Page, Word } from '../../types/DocumentRepresentation';
import * as utils from '../../utils';
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
    let mdLinks: JSON[] = [];
    const fileType: { ext: string; mime: string } = filetype(fs.readFileSync(doc.inputFile));
    if (fileType === null || fileType.ext !== 'pdf') {
      logger.warn(
        `Warning: Input file ${doc.inputFile} is not a PDF (${utils.prettifyObject(fileType)}); \
        not using meta info for link detection..`,
      );
    } else {
      mdLinks = await this.extractLinksFromMetadata(doc.inputFile);
      mdLinks = mdLinks.map((link, id) => ({
        ...link,
        id,
      }));
    }

    doc.pages.forEach((page: Page) => {
      const links = mdLinks.filter(link => parseInt((link as any).page, 10) === page.pageNumber);

      page.getElementsOfType<Word>(Word, true).forEach(word => {
        // for a given word, check if the word matches any not used link position.
        links.forEach(link => {
          const l = link as any;
          const linkBB = new BoundingBox(l.box.l, l.box.t, l.box.w, l.box.h);
          if (Math.abs(BoundingBox.getOverlap(linkBB, word.box).box2OverlapProportion) > 0.7) {
            word.properties.targetURL = this.buildLinkTarget(l);
          }
        });

        if (!word.properties.targetURL) {
          this.matchTextualLinks(word);
        }
      });
    });
    return doc;
  }

  private matchTextualLinks(word: Word) {
    const linkRegexp = /\b((http|https):\/\/?)[^\s()<>]+(?:\([\w\d]+\)|([^[:punct:]\s]|\/?))/;
    // tslint:disable-next-line:max-line-length
    const mailRegexp = /^(("[\w-\s]+")|([\w-]+(?:\.[\w-]+)*)|("[\w-\s]+")([\w-]+(?:\.[\w-]+)*))(@((?:[\w-]+\.)*\w[\w-]{0,66})\.([a-z]{2,6}(?:\.[a-z]{2})?)$)|(@\[?((25[0-5]\.|2[0-4][0-9]\.|1[0-9]{2}\.|[0-9]{1,2}\.))((25[0-5]|2[0-4][0-9]|1[0-9]{2}|[0-9]{1,2})\.){2}(25[0-5]|2[0-4][0-9]|1[0-9]{2}|[0-9]{1,2})\]?$)/;
    if (word.toString().match(linkRegexp)) {
      word.properties.targetURL = word.toString().match(linkRegexp)[0];
    } else if (word.toString().match(mailRegexp)) {
      word.properties.targetURL = `mailto:${word.toString().match(mailRegexp)[0]}`;
    }
  }

  /*
    runs the 'dumppdf.py' script and returns a JSON with all the metadata found in the file
  */
  private getFileMetadata(pdfFilePath: string): Promise<any> {
    return new Promise((resolve, reject) => {
      logger.info(`Extracting metadata with pdfminer's dumppdf.py tool...`);
      const xmlOutputFile: string = utils.getTemporaryFile('.xml');
      const dumppdfArguments = ['-a', '-o', xmlOutputFile, pdfFilePath];

      if (!fs.existsSync(xmlOutputFile)) {
        fs.appendFileSync(xmlOutputFile, '');
      }
      utils.CommandExecuter.run(['dumppdf.py', 'dumppdf'], dumppdfArguments)
        .then(() => {
          const xml: string = fs.readFileSync(xmlOutputFile, 'utf8');
          try {
            logger.debug(`Converting dumppdf's XML output to JS object..`);
            utils.parseXmlToObject(xml).then((obj: any) => {
              resolve(obj);
            });
          } catch (err) {
            reject(`parseXml failed: ${err}`);
          }
        })
        .catch(({ found, error }) => {
          logger.error(error);
          if (!found) {
            reject(`Could not find the necessary libraries..`);
          } else {
            reject(error);
          }
        });
    });
  }

  /*
    parses the JSON metadata given by dumppdf.py and returns only the matched links on each page
  */
  private async extractLinksFromMetadata(file: string): Promise<JSON[]> {
    const annots = [];
    try {
      const {
        pdf: { object: objects },
      } = await this.getFileMetadata(file);

      const pages = objects.filter(o => o.dict && o.dict[0].value.some(v => v.literal && v.literal.includes('Page')));
      const pagesWithAnnots = pages.filter(o => o.dict && o.dict[0].key.includes('Annots'));
      pagesWithAnnots.forEach(pageObject => {
        const pageHeightIndex = pageObject.dict[0].key.indexOf('MediaBox');
        const pageHeight = pageObject.dict[0].value[pageHeightIndex].list[0].number[3];

        let pageAnnots = [];
        const annotsValueIndex = pageObject.dict[0].key.indexOf('Annots');
        const annotsValue = pageObject.dict[0].value[annotsValueIndex];
        const annotObjIds = annotsValue.list
          ? annotsValue.list[0].ref.map(item => item.$.id)
          : annotsValue.ref.map(item => item.$.id);

        pageAnnots = (function deepSearchObjectsWithIds(ids: string[]): any[] {
          const result = [];
          ids.forEach(id => {
            const obj = objects.find(o => o.$.id === id);
            if (obj.dict) {
              result.push(obj);
            } else {
              result.push(...deepSearchObjectsWithIds(obj.list[0].ref.map(o => o.$.id)));
            }
          });
          return result;
        })(annotObjIds);

        pageAnnots = pageAnnots.map(annot => {
          const rectValueIndex = annot.dict[0].key.indexOf('Rect');
          const linkValueIndex = annot.dict[0].key.indexOf('A');
          if (rectValueIndex !== -1 && linkValueIndex !== -1) {
            const numbers = annot.dict[0].value[rectValueIndex].list[0].number;
            return {
              box: {
                l: parseFloat(numbers[0]),
                t: pageHeight - numbers[3],
                w: numbers[2] - numbers[0],
                h: numbers[3] - numbers[1],
              },
              link: this.parseLinkByActionType(annot.dict[0].value[linkValueIndex].dict[0]),
              page: pages.map(p => p.$.id).findIndex(p => p === pageObject.$.id) + 1,
            };
          } else {
            return undefined;
          }
        });

        annots.push(...pageAnnots.filter(a => a !== undefined));
      });

      logger.info('Found ' + annots.length + ' links in PDF metadata.');
    } catch (error) {
      logger.info(error);
    }
    return annots;
  }

  private parseAction(obj: any, type: string): any {
    const index = obj.key.findIndex(k => k === type);
    return obj.value[index].string[0]._;
  }

  private parseLinkByActionType(obj: any): any {
    const typeIndex = obj.key.findIndex(k => k === 'S');
    const type = obj.value[typeIndex].literal[0];
    const typeMap = {
      GoTo: 'D',
    };
    return {
      target: this.parseAction(obj, typeMap[type] || type),
      type,
    };
  }

  private buildLinkTarget(l: any): string {
    let targetURL = l.link.target;
    if (l.link.type === 'GoTo') {
      targetURL = '#'.concat(targetURL);
    }
    return targetURL;
  }
}
