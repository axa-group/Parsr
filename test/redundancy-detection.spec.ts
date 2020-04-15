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
import 'mocha';
import { resolve } from 'path';
import { RedundancyDetectionModule } from '../server/src/processing/RedundancyDetectionModule/RedundancyDetectionModule';
import { Word } from '../server/src/types/DocumentRepresentation';
import { Document } from '../server/src/types/DocumentRepresentation/Document';
import { json2document } from '../server/src/utils/json2document';
import { runModules } from './helpers';

const jsonName = 'redundancy-detection.pdf.new.json';

describe('Paragraph merge function', () => {
  let docAfter: Document;

  before(done => {
    const json = JSON.parse(fs.readFileSync(resolve(__dirname, 'assets', jsonName), 'utf8'));
    const document: Document = json2document(json);
    runModules(document, [new RedundancyDetectionModule()]).then(after => {
      docAfter = after;
      done();
    });
  });

  it('should remove duplicates', () => {
    const words: Word[] = docAfter.pages[0].getElementsOfType<Word>(Word);
    expect(words)
      .to.be.an('array')
      .and.to.be.of.length(2);

    expect(words[0].toString().trim()).to.be.equal('Redundant');
    expect(words[1].toString().trim()).to.be.equal('Text');
  });
});
