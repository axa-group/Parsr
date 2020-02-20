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
import { Document, Image } from '../../types/DocumentRepresentation';
import * as utils from '../../utils';
import * as CommandExecuter from '../../utils/CommandExecuter';
import logger from '../../utils/Logger';
import { Module } from '../Module';

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

    if (!doc.assetsFolder) {
      logger.warn('MuPDF not installed !! Skip image detection.');
      return doc;
    }
    const images = doc.getElementsOfType(Image, true);
    if (images.length > 0) {
      images.forEach(img => (img.enabled = true));
      const assets: string[] = fs.readdirSync(doc.assetsFolder);
      const dumpPdfData = await this.getFileMetadata(doc.inputFile);
      if (dumpPdfData != null) {
        this.linkXObjectToImages(images, dumpPdfData);
        this.linkXObjectWithExtensions(images, assets);
      }
    }
    return doc;
  }

  private linkXObjectWithExtensions(images: Image[], assets: string[]) {
    images
      .filter(img => !!img.xObjId)
      .forEach(img => {
        const asset = assets.filter(filename => {
          return filename.startsWith('img-' + img.xObjId.padStart(4, '0'));
        });
        if (asset.length === 1) {
          img.xObjExt = asset[0].split('.').pop();
        }
      });
  }

  private linkXObjectToImages(images: Image[], xObjectData: string) {
    images.forEach(img => {
      const regepx = '<key>' + img.refId + '</key>\n<value><ref id="(\\d+)" /></value>';
      const xObjId = xObjectData.match(new RegExp(regepx));
      if (xObjId != null && xObjId.length === 2) {
        img.xObjId = xObjId[1];
      }
    });
  }

  private getFileMetadata(pdfFilePath: string): Promise<any> {
    return new Promise(resolve => {
      CommandExecuter.dumpPdf(pdfFilePath)
        .then(xmlOutputPath => {
          resolve(fs.readFileSync(xmlOutputPath, 'utf8'));
        })
        .catch(() => {
          resolve();
        });
    });
  }
}
