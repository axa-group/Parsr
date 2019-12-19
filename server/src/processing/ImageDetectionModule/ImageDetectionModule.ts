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
import { Document, Image } from '../../types/DocumentRepresentation';
import * as utils from '../../utils';
import logger from '../../utils/Logger';
import { Module } from '../Module';

export type ImageObject = {
  refId: string;
  xObjId: string;
};

export class ImageDetectionModule extends Module {
  public static moduleName = 'image-detection';

  public async main(doc: Document): Promise<Document> {
    const fileType: { ext: string; mime: string } = filetype(fs.readFileSync(doc.inputFile));
    if (fileType === null || fileType.ext !== 'pdf') {
      logger.warn(
        `Warning: Input file ${doc.inputFile} is not a PDF (${utils.prettifyObject(fileType)}); \
        not using meta info for image detection..`,
      );
      return doc;
    }
    const images = doc.getElementsOfType(Image, true);
    if (images.length > 0) {
      const dumpPdf = await this.getFileMetadata(doc.inputFile);
      this.linkXObjectToImages(images, dumpPdf);
    }
    return doc;
  }

  private linkXObjectToImages(images: Image[], xObjectData: string): ImageObject[] {
    const linkedImages = [];
    images.forEach(img => {
      const regepx = '<key>' + img.refId + '</key>\n<value><ref id="(\\d+)" /></value>';
      const xObjId = xObjectData.match(new RegExp(regepx));
      if (xObjId != null && xObjId.length === 2) {
        img.xObjId = xObjId[1];
      }
    });
    return linkedImages;
  }

  private getFileMetadata(pdfFilePath: string): Promise<any> {
    return new Promise((resolve, reject) => {
      logger.info(`Extracting metadata with pdfminer's dumppdf.py tool...`);
      const xmlOutputFile: string = utils.getTemporaryFile('.xml');
      const dumppdfArguments = ['-a', '-o', xmlOutputFile, pdfFilePath];

      if (!fs.existsSync(xmlOutputFile)) {
        fs.appendFileSync(xmlOutputFile, '');
      }
      utils.CommandExecuter.run(utils.CommandExecuter.COMMANDS.DUMPPDF, dumppdfArguments)
        .then(() => {
          resolve(fs.readFileSync(xmlOutputFile, 'utf8'));
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
}
