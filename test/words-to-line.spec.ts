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
import { withData } from 'leche';
import 'mocha';
import { ReadingOrderDetectionModule } from '../server/src/processing/ReadingOrderDetectionModule/ReadingOrderDetectionModule';

import { WordsToLineModule } from '../server/src/processing/WordsToLineModule/WordsToLineModule';
import { Line } from '../server/src/types/DocumentRepresentation';
import { Document } from '../server/src/types/DocumentRepresentation/Document';
import { getPdf, runModules } from './helpers';

let docAfter: Document;
describe('Words to line module', () => {
	withData(
		{
			'one line document': ['line-merge.pdf', 1],
			'multiple lines simple document': ['paragraph-merge-1.pdf', 4],
			'multiple lines multiple columns document': ['paragraph-merge-2.pdf', 72],
			'two lines at the same vertical position': ['page-number.pdf', 2],
        },
		(pdfName, expectedLines) => {
			before(done => {
				function transform(pdf: Document) {
					return runModules(pdf, [new ReadingOrderDetectionModule(), new WordsToLineModule()]);
				}

				getPdf(transform, pdfName).then(([, pdfA]) => {
					docAfter = pdfA;
					done();
				});
			});

			it('should have the correct amount of lines', () => {
				expect(docAfter.pages[0].getElementsOfType<Line>(Line))
					.to.be.an('array')
					.and.to.be.of.length(expectedLines);
			});
		},
	);
});

