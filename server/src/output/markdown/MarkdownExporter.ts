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

import {
  Document,
  Heading,
  Image,
  List,
  Paragraph,
  Table,
} from '../../types/DocumentRepresentation';
import { TableOfContents } from '../../types/DocumentRepresentation/TableOfContents';
import logger from '../../utils/Logger';
import { Exporter } from '../Exporter';

export class MarkdownExporter extends Exporter {
  private includeHeaderFooter: boolean;
  private docName: string;

  constructor(doc: Document, includeHeaderFooter: boolean, docName?: string) {
    super(doc);
    this.includeHeaderFooter = includeHeaderFooter;
    this.docName = docName;
  }

  public export(outputPath: string): Promise<any> {
    logger.info('Exporting markdown...');
    return this.writeFile(outputPath, this.getMarkdown());
  }

  private getMarkdown(): string {
    let output: string = '';
    this.doc.pages.forEach((page, pageN) => {
      page.elements.forEach(element => {
        if (
          (element.properties.isHeader || element.properties.isFooter) &&
          !this.includeHeaderFooter
        ) {
          return;
        }
        if (element instanceof Heading) {
          output += element.toMarkdown();
        } else if (element instanceof Paragraph) {
          output += element.toMarkdown();
        } else if (element instanceof List) {
          output += element.toMarkdown();
        } else if (element instanceof Table) {
          output += element.toMarkdown();
        } else if (element instanceof TableOfContents) {
          output += element.toMarkdown();
        } else if (element instanceof Image) {
          output += element.toMarkdownImage(this.docName);
        }
        output += '\n'.repeat(2);
      });
      // end of page
      if (this.doc.pages.length > pageN + 1) {
        output += '---\n\n';
      }
    });
    return output;
  }
}
