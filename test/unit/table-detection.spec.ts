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
import {
	Document,
	Table,
	TableCell,
	TableRow,
} from '../../server/src/types/DocumentRepresentation';
import { json2document } from '../../server/src/utils/json2document';

import { runModules } from './../helpers';

describe('Table Detection Module', () => {
	withData(
		{
			'simple table': ['table-detection.json', 1, 6, 31],
			'table inside document': ['foo.json', 1, 7, 43],
		},
		(fileName, tableCount, rowCount, cellCount) => {
			let docBefore: Document;
			let docAfter: Document;

			before(done => {
				const json = JSON.parse(
					fs.readFileSync(__dirname + '/assets/' + fileName, { encoding: 'utf8' }),
				);

				docBefore = json2document(json);
				docBefore.inputFile = __dirname + '/assets/' + fileName.replace('.json', '.pdf');

				runModules(docBefore, [new TableDetectionModule()]).then(after => {
					docAfter = after;
					done();
				});
			});

			it('should have the expected amount of tables', () => {
				expect(docAfter.pages[0].getElementsOfType<Table>(Table))
					.to.be.an('array')
					.and.to.be.of.length(tableCount);
			});

			it('should have the correct amount of rows', () => {
				expect(docAfter.pages[0].getElementsOfType<TableRow>(TableRow))
					.to.be.an('array')
					.and.to.be.of.length(rowCount);
			});

			it('should have the correct amount of cells', () => {
				expect(docAfter.pages[0].getElementsOfType<TableCell>(TableCell))
					.to.be.an('array')
					.and.to.be.of.length(cellCount);
			});
		},
	);
});
