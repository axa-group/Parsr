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
import { getDocFromJson, runModules } from './helpers';
import { readFileSync, copyFileSync } from 'fs';
import { join } from 'path';
import { json2document } from '../server/src/utils/json2document';
import { getTemporaryFile } from '../server/src/utils';

/* global describe, before, it */
describe('Drawing Detection and Reconstruction', () => {
  describe('drawing detection', () => {
    withData(
      {
        'outlined table and bottom line': [
          'column_span_2.json',
          join(__dirname, 'assets', 'drawings-column_span_2.json'),
          2,
        ],
        'two drawings': [
          'two-tables.json',
          join(__dirname, 'assets', 'drawings-two-tables.json'),
          2,
        ],
      },
      (fileName, drawingsJson, drawingCount) => {
        let drawings;
        before(done => {
          //making tmp file to aviod modifying main asset on DrawingDetectionModule
          const tmpJsonFile = getTemporaryFile('.json');
          copyFileSync(drawingsJson, tmpJsonFile);
          getDocFromJson(
            doc => {
              doc.drawingsFile = tmpJsonFile;
              return runModules(doc, [new DrawingDetectionModule()]);
            },
            fileName,
            fileName.replace('.json', '.pdf'),
          ).then(after => {
            const drawingsDoc = json2document(
              JSON.parse(
                readFileSync(after.drawingsFile, { encoding: 'utf8' }),
              ),
            );
            drawings = drawingsDoc.getElementsOfType<Drawing>(Drawing);
            done();
          });
        });

        it(`should have the correct amount of drawings`, () => {
          expect(drawings.length).to.eq(drawingCount);
        });
      },
    );
  });
});
