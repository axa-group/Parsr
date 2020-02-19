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

import { readFileSync } from 'fs';
import { resolve } from 'path';
import { Document } from '../../server/src/types/DocumentRepresentation/Document';
import { json2document } from '../../server/src/utils/json2document';

let document: Document;

describe('PDFMiner - page orientations', () => {
  before(done => {
    const json = readFileSync(resolve(__dirname, 'assets', 'tables_rotated.json'), 'utf8');
    document = json2document(JSON.parse(json));
    done();
  });

  it('each page should have the correct rotation info', () => {
    expect(document.pages[0].getMainRotationAngle()).to.equal(0);
    expect(document.pages[1].getMainRotationAngle()).to.equal(91);
    expect(document.pages[2].getMainRotationAngle()).to.equal(180);
    expect(document.pages[3].getMainRotationAngle()).to.equal(-90);
    expect(document.pages[4].getMainRotationAngle()).to.equal(0);
    });
  });
