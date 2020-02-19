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

import { Document } from '../../types/DocumentRepresentation';
import { convertHTMLToPDF, getPdfExtractor } from '../../utils';
import * as CommandExecuter from '../../utils/CommandExecuter';
import { Extractor } from '../Extractor';

export class DocxExtractor extends Extractor {
  public async run(inputFile: string): Promise<Document> {
    const html = await CommandExecuter.pandocDocxToHtml(inputFile);
    const htmlToPdf = await convertHTMLToPDF(
      this.applyStyles(html),
      inputFile.replace('.docx', '-tmp.pdf'),
    );
    const mainDocument: Document = await getPdfExtractor(this.config).run(htmlToPdf);
    return mainDocument;
  }

  private applyStyles(html: string): string {
    return `
      <style>
      body, html {
        height: 210mm !important;
        width: 297mm !important;
      }
      table {
        width: 100% !important;
      }
      td, table, tr {
        border: 1px solid black;
        border-collapse: collapse;
      }
      </style>
      `.concat(html);
  }
}
