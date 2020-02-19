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
import { getTemporaryFile } from '../../utils';
import * as CommandExecuter from '../../utils/CommandExecuter';
import logger from '../../utils/Logger';
import { Exporter } from '../Exporter';
import { MarkdownExporter } from '../markdown/MarkdownExporter';

export class PdfExporter extends Exporter {
  private includeHeaderFooter: boolean;

  constructor(doc: Document, includeHeaderFooter: boolean) {
    super(doc);
    this.includeHeaderFooter = includeHeaderFooter;
  }

  public export(outputPath: string): Promise<any> {
    logger.info('Exporting PDF...');
    const markdownFilename: string = getTemporaryFile('.md');
    const markdownExporter = new MarkdownExporter(this.doc, this.includeHeaderFooter);
    return markdownExporter.export(markdownFilename).then(() => {
      return CommandExecuter.pandocMdToPdf(markdownFilename, outputPath)
        .then(pdfPath => {
          logger.info(`Writing file: ${pdfPath}`);
          return Promise.resolve();
        })
        .catch(Promise.reject);
    });
  }
}
