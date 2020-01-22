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
import { ReadingOrderDetectionModule } from '../server/src/processing/ReadingOrderDetectionModule/ReadingOrderDetectionModule';
import { getImage, getPdf, runModules } from './helpers';

const imageName = 'number-digits-preservation.jpg';
const pdfName = 'number-digits-preservation.pdf';
const expectedWords = ['FR76', '1234', '5678', '0004', '0066', '9012', '345'];

describe('Number parsing on images', () => {
  let words: string[];

  before(async () => {
    const [, imageAfter] = await getImage(
      d => runModules(d, [new ReadingOrderDetectionModule()]),
      imageName,
    );

    words = imageAfter.pages[0].elements
      .sort((a, b) => a.properties.order - b.properties.order)
      .map(elem => elem.toString());
  });

  it('should preserve all digits in a number', () => {
    expect(words.filter(w => w !== '').sort()).to.eql(expectedWords.sort());
  });
});

describe('Number parsing on PDFs', () => {
  let words: string[];

  before(async () => {
    const [, pdfAfter] = await getPdf(
      d => runModules(d, [new ReadingOrderDetectionModule()]),
      pdfName,
    );

    words = pdfAfter.pages[0].elements
      .sort((a, b) => a.properties.order - b.properties.order)
      .map(elem => elem.toString());
  });

  it('should preserve all digits in a number', () => {
    expect(words.filter(w => w !== '').sort()).to.eql(expectedWords.sort());
  });
});
