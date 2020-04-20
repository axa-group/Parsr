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
import { withData } from 'leche';
import 'mocha';
import { TableOfContentsDetectionModule } from '../server/src/processing/TableOfContentsDetectionModule/TableOfContentsDetectionModule';
import { TableOfContents } from '../server/src/types/DocumentRepresentation';
import { getDocFromJson, runModules } from './helpers';

let toc: TableOfContents;

function executePipeLine(fileName: string, done) {
  getDocFromJson(doc => runModules(doc, [new TableOfContentsDetectionModule()]), fileName).then(
    after => {
      [toc] = after.getElementsOfType<TableOfContents>(TableOfContents);
      done();
    },
  );
}

describe('Table of Contents Detection Module', () => {
  withData(
    {
      'one TOC Item per paragraph': ['2_1_185_CarPolicyWording-3.json', 21],
      'multiple TOC Items per paragraph': ['756_pages-3-5.json', 49],
    },
    (fileName, tocItemCount) => {
      before(done => {
        executePipeLine(fileName, done);
      });

      it(`should have correct amount of items`, () => {
        expect(toc.items.length).to.eq(tocItemCount);
      });
    },
  );

  withData(
    {
      '(1) document with no Table of Contents': ['testReadingOrder.json'],
      '(2) document with no Table of Contents': ['paragraph-merge-2.json'],
      '(3) document with no Table of Contents': ['paragraph-merge-3.json'],
      '(4) document with no Table of Contents': ['paragraph-merge-5.json'],
    },
    fileName => {
      before(done => {
        executePipeLine(fileName, done);
      });
      it('document should not have a TOC', () => {
        // tslint:disable-next-line: no-unused-expression
        expect(toc).to.be.undefined;
      });
    },
  );
});
