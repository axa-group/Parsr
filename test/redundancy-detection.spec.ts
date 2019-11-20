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
import 'mocha';
import { RedundancyDetectionModule } from '../server/src/processing/RedundancyDetectionModule/RedundancyDetectionModule';
import { Word } from '../server/src/types/DocumentRepresentation';
import { Document } from '../server/src/types/DocumentRepresentation/Document';
import { getPdf, runModules } from './helpers';

const pdfName = 'redundancy-detection.pdf';

describe('Paragraph merge function', () => {
  let doc: Document;

  before(done => {
    getPdf(d => runModules(d, [new RedundancyDetectionModule()]), pdfName).then(([, docAfter]) => {
      doc = docAfter;
      done();
    });
  });

  it('should remove duplicates', () => {
    const words: Word[] = doc.pages[0].getElementsOfType<Word>(Word);
    expect(words)
      .to.be.an('array')
      .and.to.be.of.length(2);

    expect(words[0].toString().trim()).to.be.equal('Redundant');
    expect(words[1].toString().trim()).to.be.equal('Text');
  });
});
