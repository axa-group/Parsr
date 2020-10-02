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
import { Document, Font, Image, Word } from '../../types/DocumentRepresentation';
import * as utils from '../../utils';
import logger from '../../utils/Logger';
import { Module } from '../Module';
import * as defaultConfig from './defaultConfig.json';
import { ImageExtractor, PdfJsImageExtractor, PdfminerImageExtractor } from './extractors';

interface Options {
  ocrImages?: boolean;
  wordsImagesSource?: boolean;
}

type DocumentImages = {
  pageNumber: number;
  path: string;
  image: Image;
};
const defaultOptions = (defaultConfig as any) as Options;

export class ImageDetectionModule extends Module<Options> {
  public static moduleName = 'image-detection';

  private extractor: ImageExtractor = null;

  constructor(options?: Options) {
    super(options, defaultOptions);
  }

  public async main(doc: Document, config: Config): Promise<Document> {
    try {
      if (!fs.existsSync(doc.inputFile)) {
        logger.warn(`Input file ${doc.inputFile} cannot be found. Not performing image detection.`);
        return doc;
      }
    } catch (err) {
      logger.error(`Could not check if the input file ${doc.inputFile} exists: ${err}..`);
      return doc;
    }

    const fileType: { ext: string; mime: string } = filetype(fs.readFileSync(doc.inputFile));
    if (fileType === null || fileType.ext !== 'pdf') {
      logger.warn(
        `Warning: Input file ${doc.inputFile} is not a PDF (${utils.prettifyObject(fileType)}); \
        not using meta info for image detection..`,
      );
      return doc;
    }

    switch (config.extractor.pdf) {
      case 'pdfjs':
        this.extractor = new PdfJsImageExtractor();
        break;
      case 'pdfminer':
        this.extractor = new PdfminerImageExtractor();
        break;
      default:
        logger.warn(`No image extractor implemented for ${config.extractor.pdf}`);
        return doc;
    }

    await this.extractor.run(doc);
    return this.ocrImages(doc, config)
      .then(() => doc)
      .catch(() => doc);
  }

  private ocrImages(doc: Document, config: Config): Promise<Document> {
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

  private scanImages(
    doc: Document,
    imagesToScan: DocumentImages[],
    ocr: OcrExtractor,
    index: number = 0,
  ): Promise<Document> {
    if (index + 1 > imagesToScan.length) {
      return Promise.resolve(doc);
    }
    logger.info(`Running OCR in image ${index + 1} of ${imagesToScan.length}`);
    return (
      ocr
        .run(imagesToScan[index].path)
        .then(document => {
          if (document && document.pages.length > 0) {
            const pageIndex = imagesToScan[index].pageNumber - 1;
            const resizedWords = this.scaleWordsToFitImageBox(document, imagesToScan[index].image);
            if (this.options.wordsImagesSource === true) {
              this.setWordPropertieSrcImage(resizedWords, document.inputFile);
            }
            this.removeImage(doc, imagesToScan[index]);
            doc.pages[pageIndex].elements = doc.pages[pageIndex].elements.concat(resizedWords);
            doc.pages[pageIndex].pageRotation = document.pages[pageIndex].pageRotation;
          }
          return this.scanImages(doc, imagesToScan, ocr, index + 1);
        })
        // if the current image throws an error when OCR'ing, continue with the next
        .catch((error: Error) => {
          logger.error(error.stack);
          logger.error("An error was found while OCR'ing image. Skipping...");
          return this.scanImages(doc, imagesToScan, ocr, index + 1);
        })
    );
  }

  private removeImage(document: Document, imageDetected: DocumentImages) {
    const noImageElements = document.pages[imageDetected.pageNumber - 1].elements.filter(
      element => element !== imageDetected.image,
    );
    document.pages[imageDetected.pageNumber - 1].elements = noImageElements;
  }

  private setWordPropertieSrcImage(imgWords: Word[], srcFile: string) {
    imgWords.forEach(word => {
      word.properties.srcImage = srcFile;
    });
  }

  private scaleWordsToFitImageBox(document: Document, image: Image): Word[] {
    const pageBox = document.pages[0].box;
    const imageBox = image.box;
    const newScale = {
      x: imageBox.width / pageBox.width,
      y: imageBox.height / pageBox.height,
    };
    return document.getElementsOfType(Word, true).map(word => {
      word.left = word.left * newScale.x + imageBox.left;
      word.width *= newScale.x;
      word.top = word.top * newScale.y + imageBox.top;
      word.height *= newScale.y;
      if (word.font !== Font.undefinedFont) {
        // Abbyy OCR is able to detect fonts in words the we have to scale font size
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
}
