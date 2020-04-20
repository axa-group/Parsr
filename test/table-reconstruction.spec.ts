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
import { withData } from 'leche';
import 'mocha';
import { TableDetectionModule } from '../server/src/processing/TableDetectionModule/TableDetectionModule';
import { Table } from '../server/src/types/DocumentRepresentation';
import { getDocFromJson, runModules, TableExtractorStub } from './helpers';

const assetsDir = __dirname + '/assets/';

describe('Table Reconstruction Module', () => {
  describe('horizontal cell merge', () => {
    withData(
      {
        'table with no joined cells': [
          'table-very-simple-output.json',
          [
            [1, 1, 1, 1, 1, 1],
            [1, 1, 1, 1, 1, 1],
            [1, 1, 1, 1, 1, 1],
          ],
        ],
        'only one cell merge': [
          'table-one-cell-merged.json',
          [
            [2, 1, 1, 1, 1],
            [1, 1, 1, 1, 1, 1],
            [1, 1, 1, 1, 1, 1],
          ],
        ],
        'two different merges in same row': [
          'table-two-different-merges-in-same-row.json',
          [
            [2, 1, 1, 2],
            [1, 2, 2, 1],
            [1, 1, 1, 1, 1, 1],
          ],
        ],
        'two different consecutive merges in same row': [
          'table-two-different-consecutive-merges-in-same-row.json',
          [
            [2, 2, 1, 1],
            [1, 1, 1, 1, 1, 1],
            [1, 2, 2, 1],
          ],
        ],
        'multiple colspan merge in multiple rows': [
          'table-multiple-colspan-merge.json',
          [[4, 1, 1], [1, 3, 2], [6]],
        ],
      },
      (fileName, cellInfo) => {
        let table: Table;
        before(done => {
          const camelotOutput = fs.readFileSync(assetsDir + fileName, { encoding: 'utf8' });

          const tableExtractor = new TableExtractorStub(0, '', camelotOutput);
          const tableDetectionModule = new TableDetectionModule();
          tableDetectionModule.setExtractor(tableExtractor);
          getDocFromJson(
            doc => runModules(doc, [tableDetectionModule]),
            'table-reconstruction.json',
            'test-table-reconstruction.pdf',
          ).then(after => {
            table = after.getElementsOfType<Table>(Table)[0];
            done();
          });
        });

        it(`should have correctly merged cells`, () => {
          cellInfo.forEach((row, rowIndex) => {
            row.forEach((colspan, colIndex) => {
              expect(table.content[rowIndex].content[colIndex].colspan).to.equal(colspan);
            });
          });
        });

        it(`row should have correct amount of cells`, () => {
          cellInfo.forEach((row, rowIndex) => {
            expect(table.content[rowIndex].content.length).to.equal(row.length);
          });
        });
      },
    );
  });
});
