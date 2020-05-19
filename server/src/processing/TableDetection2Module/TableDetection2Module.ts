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
import * as CommandExecuter from '../../utils/CommandExecuter';
import { Options, TableDetectionModule, TableExtractor, TableExtractorResult } from '../TableDetectionModule/TableDetectionModule';

const tabulaExtractor: TableExtractor = {
  async readTables(inputFile: string, options: Options): Promise<TableExtractorResult> {
    let pages: string = 'all';
    if (options.pages.length !== 0) {
      pages = options.pages.toString();
    }
    return CommandExecuter.detectTables2(inputFile, pages)
      .then(stdout => ({
        stdout,
        stderr: '',
        status: 0,
      }))
      .catch(({ error }) => {
        return {
          stdout: '',
          stderr: error,
          status: 1,
        };
      });
  },
};

export class TableDetection2Module extends TableDetectionModule {
  public static moduleName = 'table-detection-2';

  constructor(options?: Options) {
    super(options);
  }

  public async main(doc: Document): Promise<Document> {
    super.setExtractor(tabulaExtractor);
    return super.main(doc);
  }
}
