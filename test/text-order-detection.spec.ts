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
import {readFileSync} from 'fs';
import 'mocha';
import { resolve } from 'path';
import { ReadingOrderDetectionModule } from '../server/src/processing/ReadingOrderDetectionModule/ReadingOrderDetectionModule';
import { Document } from '../server/src/types/DocumentRepresentation';
import { Element } from '../server/src/types/DocumentRepresentation/Element';
import { json2document } from './../server/src/utils/json2document';
import { runModules } from './helpers';

const documentName = 'text-order-detection.json';

describe('Text order detection function', () => {
  let first: Element;
  let second: Element;
  let third: Element;
  let fourth: Element;

  before(done => {
    const json = readFileSync(resolve(__dirname, 'assets', documentName), 'utf8');
    const document: Document = json2document(JSON.parse(json));
    runModules(document, [new ReadingOrderDetectionModule()])
    .then((docAfter) => {
      docAfter.pages[0].elements.forEach(elt => {
          switch (elt.toString()) {
            case 'FIRST':
              first = elt;
              break;
            case 'SECOND':
              second = elt;
              break;
            case 'THIRD':
              third = elt;
              break;
            case 'FOURTH':
              fourth = elt;
              break;
          }
        });
      done();
      },
    );
  });

  it('should have order properties', () => {
    expect(first.properties.hasOwnProperty('order'));
    expect(second.properties.hasOwnProperty('order'));
    expect(third.properties.hasOwnProperty('order'));
    expect(fourth.properties.hasOwnProperty('order'));
  });

  it('should be in the right order', () => {
    expect(first.properties.order).to.be.lessThan(second.properties.order);
    expect(second.properties.order).to.be.lessThan(third.properties.order);
    expect(third.properties.order).to.be.lessThan(fourth.properties.order);
  });
});
