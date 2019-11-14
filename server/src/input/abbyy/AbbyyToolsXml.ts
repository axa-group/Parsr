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

import { readFileSync } from 'fs';
import { Document } from '../../types/DocumentRepresentation';
import logger from '../../utils/Logger';
import { AbbyyTools } from './AbbyyTools';

export class AbbyyToolsXml extends AbbyyTools {
  public run(inputFile: string): Promise<Document> {
    const promise = new Promise<Document>((resolve, reject) => {
      const xml: string = readFileSync(inputFile, 'utf-8');
      this.abbyyXMLToObject(xml)
        .then((obj: any) => {
          const document = new Document();
          document.inputFile = inputFile;
          try {
            const doc = obj.document.page;
            for (const pageNumber in doc) {
              const pageObj = doc[pageNumber];
              // the last argument signifies that blade lines are calculate automatically
              this.parseAbbyyPage(pageObj, parseInt(pageNumber, 10)).then(page => {
                document.pages.push(page);
              });
            }
          } catch (err) {
            logger.error('Error during document construction.');
            reject(err);
          }
          resolve(document);
        })
        .catch(err => {
          logger.error('There was an error while interfacing with the server:', err);
        });
    });

    return promise;
  }
}
