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
import { DrawingDetectionModule } from '../server/src/processing/DrawingDetectionModule/DrawingDetectionModule';
import { Drawing } from '../server/src/types/DocumentRepresentation';
import { getDocFromJson, runModules, TableExtractorStub } from './helpers';
import { TableDetectionModule } from '../server/src/processing/TableDetectionModule/TableDetectionModule';
import { readFileSync } from 'fs';

/* global describe, before, it */
describe('Drawing Detection and Reconstruction', () => {
  describe('drawing detection', () => {
    withData(
      {
        'only one drawing': [
          'column_span_2.json',
          1,
        ],
        'two drawings': [
          'two-tables.json',
          2,
        ],
      },
      (fileName, drawingCount) => {
        let drawings;
        before(done => {
          getDocFromJson(
            doc => runModules(doc, [new DrawingDetectionModule()]),
            fileName,
            fileName.replace('.json', '.pdf'),
          ).then(after => {
            drawings = after.getElementsOfType<Drawing>(Drawing);
            done();
          });
        });

        it(`should have the correct amount of drawings`, () => {
          expect(drawings.length).to.eq(drawingCount);
        });
      },
    );
  });

  describe('drawing line merge', () => {
    withData({
      'fuel-saving-oportunities': [
        'fuel-saving-opportunities.json',
        1,
        16,
      ],
    },
      (fileName, drawingCount, linesCount) => {
        let drawings;
        before(done => {
          const camelotOutput = readFileSync(`${__dirname}/assets/camelot-fuel-saving-opportunities.json`, { encoding: 'utf8' });
          
          const tableExtractor = new TableExtractorStub(0, '', camelotOutput);
          const td = new TableDetectionModule();
          td.setExtractor(tableExtractor);

          getDocFromJson(
            doc => runModules(doc, [new DrawingDetectionModule(), td]),
            fileName,
            fileName.replace('.json', '.pdf'),
          ).then(after => {
            drawings = after.getElementsOfType<Drawing>(Drawing);
            done();
          });
        });

        it('should have correct amount of lines', () => {
          expect(drawings.length).to.eq(drawingCount);
          expect(drawings.reduce((acc, d) => acc + d.content.length, 0)).to.eq(linesCount);
        });
      });
  });
});
