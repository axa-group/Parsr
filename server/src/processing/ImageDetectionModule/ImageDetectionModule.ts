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
import * as path from 'path';
import { OcrExtractor } from '../../input/OcrExtractor';
import { Config } from '../../types/Config';
import { Document, Image, Word } from '../../types/DocumentRepresentation';
import * as utils from '../../utils';
import logger from '../../utils/Logger';
import { Module } from '../Module';
import * as defaultConfig from './defaultConfig.json';
import * as DumpPdf from './DumpPdfParsr';

interface Options {
  ocrImages?: boolean;
}

type DocumentImages = {
  pageNumber: number;
  path: string;
  image: Image;
};
const defaultOptions = (defaultConfig as any) as Options;

export class ImageDetectionModule extends Module<Options> {
  public static moduleName = 'image-detection';

  private extractorDetectedImages: number = 0;
  private linkedDumpPdfImages: number = 0;
  private missedDumpPdfImages: number = 0;
  private mutoolMissedImages: number = 0;

  constructor(options?: Options) {
    super(options, defaultOptions);
  }

  public async main(doc: Document, config: Config): Promise<Document> {
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

    this.extractorDetectedImages = this.totalDocumentImages(doc);
    if (this.extractorDetectedImages === 0) {
      logger.info('No images detected !! Skip image detection.');
      return doc;
    }

    await this.extractImages(doc);
    return this.ocrImages(doc, config)
      .then(() => doc)
      .catch(() => doc);
  }

  private async ocrImages(doc: Document, config: Config): Promise<Document> {
    if (!this.options.ocrImages) {
      return Promise.resolve(doc);
    }

    const imagesToScan: DocumentImages[] = [];
    doc.pages.forEach(page => {
      page.getElementsOfType(Image, true).forEach(image => {
        const imagePath = this.imagePath(image, doc);
        if (imagePath !== null) {
          imagesToScan.push({ pageNumber: page.pageNumber, path: imagePath, image });
        }
      });
    });

    if (imagesToScan.length === 0) {
      return Promise.resolve(doc);
    }

    return this.scanImages(doc, imagesToScan, utils.getOcrExtractor(config));
  }

  private async scanImages(
    doc: Document,
    imagesToScan: DocumentImages[],
    ocr: OcrExtractor,
    index: number = 0,
  ): Promise<Document> {
    if (index + 1 > imagesToScan.length) {
      return Promise.resolve(doc);
    }
    logger.info(`Running OCR in image ${index + 1} of ${imagesToScan.length}`);
    return ocr.run(imagesToScan[index].path).then(document => {
      const pageIndex = imagesToScan[index].pageNumber - 1;
      const resizedWords = this.scaleWordsToFitImageBox(document, imagesToScan[index].image);
      doc.pages[pageIndex].elements = doc.pages[pageIndex].elements.concat(resizedWords);
      return this.scanImages(doc, imagesToScan, ocr, index + 1);
    });
  }

  private scaleWordsToFitImageBox(document: Document, image: Image): Word[] {
    const pageBox = document.pages[0].box;
    const imageBox = image.box;
    const newScale = {
      x: imageBox.width / pageBox.width,
      y: imageBox.height / pageBox.height,
    };
    logger.info(`Scaling image contents with scale ${JSON.stringify(newScale)}`);
    return document.getElementsOfType(Word, true).map(word => {
      word.left = word.left * newScale.x + imageBox.left;
      word.width *= newScale.x;
      word.top = word.top * newScale.y + imageBox.top;
      word.height *= newScale.y;
      if (word.font != null) {
        logger.info(`Word font ${JSON.stringify(word.font)}`);
        word.font.size = word.font.size * newScale.x;
      }
      return word;
    });
  }

  private imagePath(image: Image, doc: Document) {
    const assets: string[] = fs.readdirSync(doc.assetsFolder);
    return path.resolve(
      doc.assetsFolder +
        '/' +
        assets
          .filter(
            fileName => fileName === 'img-' + image.xObjId.padStart(4, '0') + '.' + image.xObjExt,
          )
          .pop(),
    );
  }

  private async extractImages(doc: Document) {
    const dumpPdfData = await DumpPdf.getFileMetadata(doc.inputFile);
    if (dumpPdfData != null) {
      const assets: string[] = fs.readdirSync(doc.assetsFolder);
      const pageIds = DumpPdf.extractPageNodeIds(dumpPdfData);
      doc.pages.forEach((page, index) => {
        const images = page.getElementsOfType(Image, true);
        images.forEach(img => (img.enabled = true));
        if (images.length > 0) {
          this.linkImages(images, pageIds[index], dumpPdfData, index);
          this.linkXObjectWithExtensions(images, assets, index, pageIds[index]);
        }
      });

      logger.info(
        `Images Detected ${this.extractorDetectedImages} Reconstructed ${this.linkedDumpPdfImages -
          this.mutoolMissedImages -
          this.missedDumpPdfImages} Mutool missed ${this.mutoolMissedImages} DumpPDF missed ${
          this.missedDumpPdfImages
        }`,
      );
    }
  }

  private linkXObjectWithExtensions(
    images: Image[],
    assets: string[],
    pageIndex: number,
    pageNodeId: string,
  ) {
    images
      .filter(img => !!img.xObjId)
      .forEach(img => {
        const asset = assets.filter(filename => {
          return filename.startsWith('img-' + img.xObjId.padStart(4, '0'));
        });
        if (asset.length === 1) {
          img.xObjExt = asset[0].split('.').pop();
        } else {
          this.mutoolMissedImages++;
          logger.warn(
            `Page ${pageIndex + 1} \(nodeId ${pageNodeId}\) image ${
              img.refId
            } no extension found for file ${img.xObjId}`,
          );
        }
      });
  }

  private linkImages(images: Image[], pageNodeId: string, data: string, pageIndex: number) {
    let rootNode = DumpPdf.getNode(pageNodeId, data);
    const resourcesNodeId = DumpPdf.getResourceId(rootNode);
    if (resourcesNodeId != null) {
      pageNodeId = resourcesNodeId;
      rootNode = DumpPdf.getNode(resourcesNodeId, data);
    }
    images.forEach(img => {
      const imgRefId = DumpPdf.getImageRefId(img.refId, rootNode, data);
      if (imgRefId != null) {
        img.xObjId = imgRefId;
        this.linkedDumpPdfImages = this.linkedDumpPdfImages + 1;
      } else {
        this.missedDumpPdfImages = this.missedDumpPdfImages + 1;
        logger.warn(`Page ${pageIndex + 1} Xml node missed for image Id ${img.refId}`);
      }
    });
  }

  private totalDocumentImages(doc: Document): number {
    return doc.getElementsOfType(Image, true).length;
  }
}
