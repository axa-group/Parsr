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
  List,
  Paragraph,
  Table,
} from '../../types/DocumentRepresentation';
import { TableOfContents } from '../../types/DocumentRepresentation/TableOfContents';
import logger from '../../utils/Logger';
import { Exporter } from '../Exporter';

export class SimpleJsonExporter extends Exporter {
  private includeHeaderFooter: boolean;

  constructor(doc: Document, includeHeaderFooter: boolean) {
    super(doc);
    this.includeHeaderFooter = includeHeaderFooter;
  }

  public export(outputPath: string): Promise<any> {
    logger.info('Exporting markdown...');
    return this.writeFile(outputPath, this.getSimpleJSON());
  }

  private getSimpleJSON(): string {
    const simpleJSON = [];
    this.doc.pages.forEach((page) => {
      page.elements.forEach(element => {
        if (
          (element.properties.isHeader || element.properties.isFooter) &&
          !this.includeHeaderFooter
        ) {
          return;
        }
        if (element instanceof Heading) {
          simpleJSON.push(element.toSimpleJSON());
        } else if (element instanceof Paragraph) {
          simpleJSON.push(element.toSimpleJSON());
        } else if (element instanceof List) {
          simpleJSON.push(element.toSimpleJSON());
        } else if (element instanceof Table) {
          simpleJSON.push(element.toSimpleJSON());
        } else if (element instanceof TableOfContents) {
          simpleJSON.push(element.toSimpleJSON());
        }
      });
    });
    return JSON.stringify(simpleJSON);
  }
}
