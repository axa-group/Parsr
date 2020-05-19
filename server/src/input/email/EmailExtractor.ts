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

import { readFileSync, writeFileSync } from 'fs';
import { simpleParser } from 'mailparser';
import * as mergePDFs from 'pdfmerge';
import { Document } from '../../types/DocumentRepresentation';
import * as CommandExecuter from '../../utils/CommandExecuter';
import { Extractor } from '../Extractor';
import { convertHTMLToPDF, getPdfExtractor, getTemporaryFile } from './../../utils';

interface MailAttachmentData {
  type: string;
  contentType: string;
  partId: string;
  release: string;
  content: Buffer;
  contentDisposition: string;
  filename: string;
  contentId: string;
  cid: string;
  headers: object;
  checksum: string;
  size: number;
}

export class EmailExtractor extends Extractor {
  public async run(inputFile: string): Promise<Document> {
    const fullPDF = await this.convertEMLtoPDF(inputFile);
    const mainDocument: Document = await getPdfExtractor(this.config).run(fullPDF);
    return mainDocument;
  }

  private async convertEMLtoPDF(inputFile: string): Promise<string> {
    const page = {
      width: '210mm',
      height: '297mm',
    };

    const styles = `
      <style>
      body, html {
        height: ${page.height} !important;
        width: ${page.width} !important;
      }
      table {
        width: 100% !important;
      }
      </style>
    `;
    const data = readFileSync(inputFile);
    const raw = await simpleParser(data);
    const mainPDF = convertHTMLToPDF((raw.html || '').concat(styles));
    const pdfFilesToJoin: Array<Promise<string>> = [
      mainPDF,
      ...(raw.attachments || []).map(this.attachmentToPDF.bind(this)(raw.html)),
    ].filter(f => !!f);

    const files = (await Promise.all(pdfFilesToJoin)).filter(f => !!f);
    const fullPDF = inputFile.replace('.eml', '-tmp.pdf');
    await mergePDFs(files, fullPDF);
    return fullPDF;
  }

  private attachmentToPDF(rawHTML: string): (data: MailAttachmentData) => Promise<string> {
    return (attachment: MailAttachmentData): Promise<string> => {
      if (attachment.contentType === 'application/pdf') {
        return Promise.resolve(this.pdfAttachmentToPDF(attachment));
      }

      if (attachment.contentType.startsWith('image/')) {
        return this.imageAttachmentToPDF(attachment, rawHTML);
      }

      return null;
    };
  }

  private pdfAttachmentToPDF(attachment: MailAttachmentData): string {
    const outputFilePath = getTemporaryFile('.pdf');
    writeFileSync(outputFilePath, attachment.content);
    return outputFilePath;
  }

  private imageAttachmentToPDF(attachment: MailAttachmentData, rawHTML: string): Promise<string> {
    // const outputFilePath = getTemporaryFile('.pdf');
    /*
      if the attached image is represented in the HTML body as a base64-encoded img
      then it's not considered as an attached *extra* file
      (e.g., logo images, social media link images, etc)
    */
    const imageSrcRegexp = new RegExp(/src="data:image\/[a-z]{3,4};base64,([a-zA-Z0-9/+=]+)/gm);
    const imagesInHTML = rawHTML.match(imageSrcRegexp);
    const fileBase64 = attachment.content.toString('base64');
    if (imagesInHTML && imagesInHTML.some(i => i.split(',')[1] === fileBase64)) {
      return null;
    }

    const imageFile = getTemporaryFile('.' + attachment.filename.split('.')[1]);
    writeFileSync(imageFile, attachment.content);
    return CommandExecuter.magickImageToPdf(imageFile);
  }
}
