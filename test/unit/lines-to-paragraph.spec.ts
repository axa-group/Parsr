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

import { expect } from 'chai';
import * as fs from 'fs';
import { withData } from 'leche';
import 'mocha';
import { LinesToParagraphModule } from '../../server/src/processing/LinesToParagraphModule/LinesToParagraphModule';
import { Document, Heading, Line } from '../../server/src/types/DocumentRepresentation';
import { json2document } from '../../server/src/utils/json2document';

import { runModules } from './../helpers';

describe('Lines to Paragraph Module', () => {
  withData(
    {
      'one paragraph doc': ['one-paragraph-with-lines.json', 1],
      'multiple paragraphs': ['paragraph-merge.json', 4],
      'multicolumn paragraphs': ['paragraph-merge-2.json', 5],
      'full content page': ['paragraph-merge-5.json', 11],
    },
    (fileName, paragraphCount) => {
      let docBefore: Document;
      let docAfter: Document;

      before(done => {
        const json = JSON.parse(
          fs.readFileSync(__dirname + '/assets/' + fileName, { encoding: 'utf8' }),
        );

        docBefore = json2document(json);

        runModules(docBefore, [new LinesToParagraphModule()]).then(after => {
          docAfter = after;
          done();
        });
      });

      it('should have the expected amount of paragraphs', () => {
        expect(docAfter.pages[0].elements)
          .to.be.an('array')
          .and.to.be.of.length(paragraphCount);
      });

      it('should not have Lines left except inside Paragraphs', () => {
        expect(docAfter.pages.some(page => page.elements.some(e => e instanceof Line))).to.eql(
          false,
        );
      });
    },
  );
});

describe('Heading Detection', () => {
  let docAfter: Document;
  let docBefore: Document;
  withData(
    {
      'multiple paragraphs with headings': ['paragraph-merge-3.json', 4],
      'complex pdf file': ['testReadingOrder.json', 8],
    },
    (fileName, headingCount) => {
      before(done => {
        const json = JSON.parse(
          fs.readFileSync(__dirname + '/assets/' + fileName, { encoding: 'utf8' }),
        );

        docBefore = json2document(json);
        runModules(docBefore, [new LinesToParagraphModule()]).then(after => {
          docAfter = after;
          done();
        });
      });

      it('should have the correct number of headings', () => {
        expect(docAfter.pages[0].getElementsOfType<Heading>(Heading).length).to.eq(headingCount);
      });
    },
  );
});
