/**
 * Copyright 2019 AXA Group Operations S.A.
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

import * as os from 'os';
import { Document } from '../../types/DocumentRepresentation';
import * as utils from '../../utils';
import { getTemporaryFile } from '../../utils';
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
    const markdownFilename: string = getTemporaryFile('.md');
    const markdownExporter = new MarkdownExporter(this.doc, this.includeHeaderFooter);
    markdownExporter.export(markdownFilename).then(() => {
      const pandocPath = utils.spawnSync('which', ['pandoc']).output.join('');
      if (pandocPath === '' || (/^win/i.test(os.platform()) && /no pandoc in/.test(pandocPath))) {
        logger.warn('Pandoc not installed !! Skip PDF export.');
        return Promise.reject();
      } else {
        const pandocSync = utils.spawnSync(
          'pandoc',
          [
            '-f',
            'markdown_github+all_symbols_escapable',
            '--pdf-engine=xelatex',
            '--quiet',
            '-s',
            markdownFilename,
            '-o',
            outputPath,
          ],
          {
            cwd: process.cwd(),
            env: process.env,
          },
        );
        if (pandocSync.status === 0) {
          logger.info(`Writing file: ${outputPath}`);
          return Promise.resolve(pandocSync.status);
        } else {
          logger.error(`Error writing PDF file ${outputPath}`);
          return Promise.reject(pandocSync.status);
        }
      }
    });
    return Promise.resolve();
  }
}
