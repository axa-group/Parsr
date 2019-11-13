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
import { TableDetectionModule } from '../../server/src/processing/TableDetectionModule/TableDetectionModule';
import { Document, Table } from '../../server/src/types/DocumentRepresentation';
import { json2document } from '../../server/src/utils/json2document';

import { runModules, TableExtractorStub } from './../helpers';

const assetsDir = __dirname + '/assets/table-reconstruction/';

describe('Table Reconstruction Module', () => {
  withData(
    {
      'table with no joined cells': [
        'very-simple-output.json', [
          { row: 1, col: 0, colspan: 1, rowspan: 1 },
          { row: 1, col: 1, colspan: 1, rowspan: 1 },
          { row: 1, col: 2, colspan: 1, rowspan: 1 },
          { row: 1, col: 3, colspan: 1, rowspan: 1 },
          { row: 1, col: 4, colspan: 1, rowspan: 1 },
          { row: 1, col: 5, colspan: 1, rowspan: 1 },
        ],
      ],
    },
    (fileName, cellInfo) => {
      let docBefore: Document;
      let docAfter: Document;

      before(done => {
        const json = JSON.parse(
          fs.readFileSync(assetsDir + 'test-table-reconstruction.json', { encoding: 'utf8' }),
        );
        const camelotOutput = fs.readFileSync(assetsDir + fileName, { encoding: 'utf8' });

        docBefore = json2document(json);
        docBefore.inputFile = assetsDir + 'test-table-reconstruction.pdf';
        const tableExtractor = new TableExtractorStub(0, '', camelotOutput);
        runModules(docBefore, [new TableDetectionModule(null, tableExtractor)]).then(after => {
          docAfter = after;
          done();
        });
      });

      it('should have correctly merged cells', () => {
        const table = docAfter.getElementsOfType<Table>(Table)[0];
        cellInfo.forEach(cell => {
          const { row, col, colspan, rowspan } = cell;
          if (colspan) {
            expect(table.content[row].content[col].colspan).to.equal(colspan);
          }
          if (rowspan) {
            expect(table.content[row].content[col].rowspan).to.equal(rowspan);
          }
        });
      });

    },
  );
});
