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

import { expect } from 'chai';
import * as fs from 'fs';
import { withData } from 'leche';
import 'mocha';
import { TableOfContentsDetectionModule } from '../../server/src/processing/TableOfContentsDetectionModule/TableOfContentsDetectionModule';
import { Document, TableOfContents } from '../../server/src/types/DocumentRepresentation';
import { json2document } from '../../server/src/utils/json2document';
import { runModules } from './../helpers';

const assetsDir = __dirname + '/assets/';

describe('Table of Contents Detection Module', () => {
  withData(
    {
      'one TOC Item per paragraph': [
        '2_1_185_CarPolicyWording-3.json', 21,
      ],
      'multiple TOC Items per paragraph': [
        '756_pages-3-5.json', 49,
      ],
    },
    (fileName, tocItemCount) => {
      let docBefore: Document;
      let toc: TableOfContents;

      before(done => {
        const json = JSON.parse(
          fs.readFileSync(assetsDir + fileName, { encoding: 'utf8' }),
        );

        docBefore = json2document(json);
        docBefore.inputFile = assetsDir + fileName;
        const tableOfContentsDetectionModule = new TableOfContentsDetectionModule();
        runModules(docBefore, [tableOfContentsDetectionModule]).then(after => {
          toc = after.getElementsOfType<TableOfContents>(TableOfContents)[0];
          done();
        });
      });

      it(`should have correct amount of items`, () => {
        expect(toc.items.length).to.eq(tocItemCount);
      });
    },
  );
});
