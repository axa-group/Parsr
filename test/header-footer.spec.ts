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
import { HeaderFooterDetectionModule } from '../server/src/processing/HeaderFooterDetectionModule/HeaderFooterDetectionModule';
import { Document, Word } from '../server/src/types/DocumentRepresentation';
import { getDocFromJson, runModules } from './helpers';

describe('Header footer detection', () => {
  withData(
    {
      'Document with header & footer': ['header_footer.json'],
    },
    jsonName => {
      let docAfter: Document;
      let allWords: Word[];

      before(done => {
        function transform(json: Document) {
          return runModules(json, [
            new HeaderFooterDetectionModule({ ignorePages: [], maxMarginPercentage: 4 }),
          ]);
        }

        getDocFromJson(transform, jsonName).then(after => {
          docAfter = after;
          allWords = docAfter.pages[0].getElementsOfType(Word, true);
          done();
        });
      });

      it('document word with id 350 has to be header content', () => {
        expect(
          allWords.filter(w => w.id === 350).pop().properties.isHeader,
          `/'book./' word has to be header`,
        ).to.equal(true);
      });

      it('document word with id 964 has to be footer content', () => {
        expect(
          allWords.filter(w => w.id === 964).pop().properties.isFooter,
          `/'content./' word has to be footer`,
        ).to.equal(true);
      });
    },
  );
});
