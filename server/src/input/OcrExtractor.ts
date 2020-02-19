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
import { Document } from '../types/DocumentRepresentation/Document';
import * as CommandExecuter from '../utils/CommandExecuter';
import logger from '../utils/Logger';
import { Extractor } from './Extractor';
import { setPageDimensions } from './set-page-dimensions';

export abstract class OcrExtractor extends Extractor {
  public abstract scanImage(inputFile: string): Promise<Document>;
}

export type RotationCorrectionCoords = {
  x: number;
  y: number;
};

export type RotationCorrection = {
  fileName: string;
  degrees: number;
  origin: RotationCorrectionCoords;
  translation: RotationCorrectionCoords;
};

// tslint:disable-next-line: max-classes-per-file
export abstract class OcrExtractorFactory extends OcrExtractor {
  public async run(inputFile: string, rotationCorrection: boolean = true): Promise<Document> {
    return this.ocrFile(inputFile, rotationCorrection);
  }
  public async ocrFile(inputFile: string, fixRotation: boolean = true): Promise<Document> {
    if (this.isPdfFile(inputFile)) {
      return this.ocrPDF(inputFile, fixRotation);
    }
    return this.ocrImage(inputFile, fixRotation);
  }

  public isPdfFile(filePath: string): boolean {
    const fileType: { ext: string; mime: string } = filetype(fs.readFileSync(filePath));
    return fileType !== null && fileType.ext.toLowerCase() === 'pdf';
  }

  protected async correctImageForRotation(srcImg: string): Promise<RotationCorrection> {
    const correctionInfo: RotationCorrection = {
      fileName: srcImg,
      degrees: 0,
      origin: { x: 0, y: 0 },
      translation: { x: 0, y: 0 },
    };

    return CommandExecuter.imageCorrection(srcImg)
      .then(data => {
        const rotationData = JSON.parse(data);
        correctionInfo.fileName = rotationData.filename;
        correctionInfo.degrees = rotationData.degrees;
        correctionInfo.origin = rotationData.origin;
        correctionInfo.translation = rotationData.translation;
        return correctionInfo;
      })
      .catch(() => {
        logger.warn(`Error running image optimisation.. using the original image.`);
        return correctionInfo;
      });
  }

  private async ocrPDF(inputFile: string, fixRotation: boolean) {
    const imagePaths = await CommandExecuter.magickPdfToImages(inputFile);
    return this.ocrImages(imagePaths, fixRotation).then((doc: Document) => {
      doc.inputFile = inputFile;
      return doc;
    });
  }

  private async ocrImage(inputFile: string, fixRotation: boolean) {
    let rotationCorrection = null;
    const orignalInput = inputFile;
    try {
      if (fixRotation) {
        rotationCorrection = await this.correctImageForRotation(inputFile);
        inputFile = rotationCorrection.fileName;
      }
    } catch (e) {
      logger.info('There was an error while doing image rotation. Using original file...');
    }

    return this.scanImage(inputFile).then((doc: Document) => {
      setPageDimensions(doc, orignalInput);
      doc.inputFile = orignalInput;
      if (rotationCorrection && doc.pages.length > 0) {
        doc.pages[0].pageRotation = rotationCorrection;
      }
      return doc;
    });
  }

  private ocrImages(
    pages: string[],
    fixRotation: boolean,
    allPagesDoc: Document = new Document([]),
    index: number = 0,
  ) {
    logger.info('Running OCR - Page ' + (index + 1));
    return this.ocrImage(pages[index], fixRotation).then((doc: Document) => {
      allPagesDoc.pages = allPagesDoc.pages.concat(doc.pages);
      allPagesDoc.pages[index].pageNumber = index + 1;
      if (pages.length > index + 1) {
        return this.ocrImages(pages, fixRotation, allPagesDoc, index + 1);
      } else {
        return allPagesDoc;
      }
    });
  }
}
