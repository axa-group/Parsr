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
import * as fs from 'fs';
import 'mocha';
import { TableDetectionModule } from '../server/src/processing/TableDetectionModule/TableDetectionModule';
import { TableRow } from '../server/src/types/DocumentRepresentation';
import { Table } from '../server/src/types/DocumentRepresentation/Table';
import { getDocFromJson, runModules, TableExtractorStub } from './helpers';

const jsonName = 'table-detection.pdf.new.json';
const pdfName = 'table-detection.pdf';

describe('No Table detection function', () => {
  let tableNumber: number;
  const noTableDetectedExtractor = new TableExtractorStub(0, '', '[]');
  const tableDetectionModule = new TableDetectionModule();
  tableDetectionModule.setExtractor(noTableDetectedExtractor);

  before(done => {
    getDocFromJson(doc => runModules(doc, [tableDetectionModule]), jsonName, pdfName).then(
      docAfter => {
        tableNumber = docAfter.pages[0].getElementsOfType<Table>(Table).length;
        done();
      },
    );
  });

  it('should have no table detected', () => {
    expect(tableNumber).to.eql(0);
  });
});

describe('One Table detection function', () => {
  let table: Table;
  let tableRows: TableRow[];
  const extractorOutput = fs.readFileSync(
    `${__dirname}/assets/mocks/table-detection-one-table.json`,
    'utf8',
  );
  const oneTableDetectedExtractor = new TableExtractorStub(0, '', extractorOutput);
  const tableDetectionModule = new TableDetectionModule();
  tableDetectionModule.setExtractor(oneTableDetectedExtractor);

  before(done => {
    getDocFromJson(d => runModules(d, [tableDetectionModule]), jsonName, pdfName).then(docAfter => {
      docAfter.pages[0].getElementsOfType<Table>(Table).forEach(elt => {
        table = elt;
        tableRows = table.content;
      });
      done();
    });
  });

  it('should have one table detected', () => {
    // tslint:disable-next-line
    expect(table).exist;
  });

  it('should have first row cell with row span', () => {
    expect(tableRows[0].content[0].rowspan).to.equal(2);
  });

  it('should have first row last cell with col span', () => {
    expect(tableRows[0].content[4].colspan).to.equal(2);
  });
});
