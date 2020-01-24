import * as filetype from 'file-type';
import * as fs from 'fs';
import * as path from 'path';
import { Document } from '../types/DocumentRepresentation/Document';
import { CommandExecuter, pdfToImages } from '../utils';
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

    const args: string[] = [path.join(__dirname, '../../assets/ImageCorrection.py'), srcImg];
    try {
      const data = await CommandExecuter.run(CommandExecuter.COMMANDS.PYTHON, args);
      const rotationData = JSON.parse(data);
      correctionInfo.fileName = rotationData.filename;
      correctionInfo.degrees = rotationData.degrees;
      correctionInfo.origin = rotationData.origin;
      correctionInfo.translation = rotationData.translation;
    } catch ({ error }) {
      logger.error(error);
      logger.warn(`Error running image rotation calculation.. using the original image.`);
    }
    return correctionInfo;
  }
  private async ocrPDF(inputFile: string, fixRotation: boolean) {
    logger.info('Converting Pdf to images');
    const imagePaths = await pdfToImages(inputFile);
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
