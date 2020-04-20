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
import { withData } from 'leche';
import 'mocha';
import { ReadingOrderDetectionModule } from '../server/src/processing/ReadingOrderDetectionModule/ReadingOrderDetectionModule';
import { WordsToLineModule } from '../server/src/processing/WordsToLineModule/WordsToLineModule';
import { Document, Element } from '../server/src/types/DocumentRepresentation';
import { getDocFromJson, runModules } from './helpers';

describe('Line merge function', () => {
  withData(
    {
      'one line': ['line-merge.pdf.new.json', 'I’m a sentence with multiple words.'],
      'justified text': [
        'line-merge-2.pdf.new.json',
        'Lorem ipsum, sagittis a, dolor. Nullam turpis lacus.',
      ],
    },
    (jsonName, text) => {
      let docAfter: Document;

      before(done => {
        function transform(json: Document) {
          return runModules(json, [new ReadingOrderDetectionModule(), new WordsToLineModule()]);
        }

        getDocFromJson(transform, jsonName).then(after => {
          docAfter = after;
          done();
        });
      });

      it('should merge side-by-side words into a single block', () => {
        expect(docAfter.pages[0].elements)
          .to.be.an('array')
          .and.to.be.of.length(1);
      });

      it('should not alter the content', () => {
        expect(
          (docAfter.pages[0].elements[0].content as Element[]).map(t => t.toString()).join(' '),
        ).to.be.equal(text);
      });

      // TODO Page should not have any Words left except in Lines (same for Paragraph-merge)
    },
  );
});
