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
import 'mocha';
import { LinesToParagraphModule } from '../server/src/processing/LinesToParagraphModule/LinesToParagraphModule';
import { OutOfPageRemovalModule } from '../server/src/processing/OutOfPageRemovalModule/OutOfPageRemovalModule';
import { ReadingOrderDetectionModule } from '../server/src/processing/ReadingOrderDetectionModule/ReadingOrderDetectionModule';
import { WhitespaceRemovalModule } from '../server/src/processing/WhitespaceRemovalModule/WhitespaceRemovalModule';

import { WordsToLineModule } from '../server/src/processing/WordsToLineModule/WordsToLineModule';
import { Document } from '../server/src/types/DocumentRepresentation/Document';
import { getPdf, runModules } from './helpers';

let docAfter: Document;

function executePipeLine(pdfName: string, done) {
  function cleaner(doc: Document) {

    return runModules(doc, [
      new OutOfPageRemovalModule(),
      new WhitespaceRemovalModule(),
      new ReadingOrderDetectionModule(),
      new WordsToLineModule(),
      new LinesToParagraphModule(),
    ]);
  }

  getPdf(cleaner, pdfName).then(([_, docA]) => {
    docAfter = docA;
    done();
  });
}
describe('PDFMiner - page orientations', () => {
  before(done => {
    executePipeLine('tables_rotated.pdf', done);
  });

  it('each page should have the same content', () => {
    const md = docAfter.pages[0].getAllElements().map(e => e.toString()).join(' ');
    expect(docAfter.pages.every(p => p.getAllElements().map(e => e.toString()).join(' ') === md)).to.eql(true);
  });
});
