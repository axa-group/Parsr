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
  public abstract scanFile(inputFile: string): Promise<Document>;
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
  public async run(inputFile: string, fixRotation: boolean = true): Promise<Document> {
    let rotationCorrection = null;
    const orignalInput = inputFile;
    try {
      if (fixRotation && !this.isPdfFile(inputFile)) {
        rotationCorrection = await this.correctImageForRotation(inputFile);
        inputFile = rotationCorrection.fileName;
      }
    } catch (e) {
      logger.info('There was an error while doing image rotation. Using original file...');
    }

    return this.scanFile(inputFile)
      .then((doc: Document) => {
        if (this.isPdfFile(inputFile)) {
          return doc;
        }
        return setPageDimensions(doc, orignalInput);
      })
      .then((doc: Document) => {
        doc.inputFile = orignalInput;
        if (rotationCorrection && doc.pages.length > 0) {
          doc.pages[0].pageRotation = rotationCorrection;
        }
        return doc;
      })
      .catch((error: Error) => {
        logger.info(`Error OCR scanning file ${error}`);
        return new Document([]);
      });
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
}
