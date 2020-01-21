import * as filetype from 'file-type';
import * as fs from 'fs';
import * as path from 'path';
import { Document } from '../types/DocumentRepresentation/Document';
import { CommandExecuter, pdfToImages } from '../utils';
import logger from '../utils/Logger';
import { Extractor } from './Extractor';

export abstract class OcrExtractor extends Extractor {
  public abstract async ocrPDF(inputFile: string, fixRotation: boolean);
  public abstract ocrImages(pages: string[], fixRotation: boolean): Promise<Document>;
  public abstract ocrImage(page: string, fixRotation: boolean): Promise<Document>;
  public abstract isPdfFile(filePath: string): boolean;
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
export class OcrExtractorFactory extends OcrExtractor {
  public async ocrPDF(inputFile: string, fixRotation: boolean) {
    const imagePaths = await pdfToImages(inputFile);
    return this.ocrImages(imagePaths, fixRotation).then((doc: Document) => {
      doc.inputFile = inputFile;
      return doc;
    });
  }

  public ocrImages(
    pages: string[],
    fixRotation: boolean,
    allPagesDoc: Document = new Document([]),
    index: number = 0,
  ): Promise<Document> {
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

  public isPdfFile(filePath: string): boolean {
    const fileType: { ext: string; mime: string } = filetype(fs.readFileSync(filePath));
    return fileType !== null && fileType.ext.toLowerCase() === 'pdf';
  }

  public run(_inputFile: string): Promise<Document> {
    throw new Error('Method not implemented.');
  }

  public ocrImage(_page: string, _fixRotation: boolean): Promise<Document> {
    throw new Error('Method not implemented.');
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
}
