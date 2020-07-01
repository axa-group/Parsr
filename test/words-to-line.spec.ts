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
import { WordsToLineNewModule } from '../server/src/processing/WordsToLineNewModule/WordsToLineNew';
import { Document, Line, Word } from '../server/src/types/DocumentRepresentation';
import { getDocFromJson, runModules } from './helpers';

describe('Words to Line Module', () => {
  withData(
    {
      'line-merge.pdfminer.json': [
        'line-merge.pdfminer.json',
        1,
        'I’m a sentence with multiple words.',
      ],
      'slightly unaligned words': [
        'line-merge-2-unaligned.pdfminer.json',
        1,
        'Lorem ipsum, sagittis a, dolor. Nullam turpis lacus.',
      ],
      'one paragraph': [
        'one-paragraph.pdfminer.json',
        7,
        "Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry's standard dummy text ever since the 1500s, when an unknown printer took a galley of type and scrambled it to make a type specimen book. It has survived not only five centuries, but also the leap into electronic typesetting, remaining essentially unchanged. It was popularised in the 1960s with the release of Letraset sheets containing Lorem Ipsum passages, and more recently with desktop publishing software like Aldus PageMaker including versions of Lorem Ipsum.",
      ],
    },
    (fileName, lineCount, textContent) => {
      let docAfter: Document;

      before(done => {
        function sortWords(doc: Document): Document {
          // sets each word 'order' property for WordsToLine module to work properly
          doc.pages.forEach(page => {
            page.elements.forEach((element, order) => {
              element.properties = { order };
            });
          });
          return doc;
        }

        getDocFromJson(
          doc => runModules(sortWords(doc), [new WordsToLineNewModule()]),
          fileName,
        ).then(after => {
          docAfter = after;
          done();
        });
      });

      it('should merge side-by-side words into a single block', () => {
        expect(docAfter.pages[0].elements)
          .to.be.an('array')
          .and.to.be.of.length(lineCount);
      });

      it('should not alter the content', () => {
        expect(
          (docAfter.pages[0].elements as Line[]).map(line => line.toString()).join(' '),
        ).to.be.equal(textContent);
      });

      it('should not have Words left except inside Lines', () => {
        expect(docAfter.pages.some(page => page.elements.some(e => e instanceof Word))).to.eql(
          false,
        );
      });
    },
  );
});
