/**
 * Copyright 2019 AXA
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
import { JsonExporter } from '../server/src/output/json/JsonExporter';
import { HeadingDetectionModule } from '../server/src/processing/HeadingDetectionModule/HeadingDetectionModule';
import { HierarchyDetectionModule } from '../server/src/processing/HierarchyDetectionModule/HierarchyDetectionModule';
import { LinesToParagraphModule } from '../server/src/processing/LinesToParagraphModule/LinesToParagraphModule';
import { ReadingOrderDetectionModule } from '../server/src/processing/ReadingOrderDetectionModule/ReadingOrderDetectionModule';
import { WordsToLineModule } from '../server/src/processing/WordsToLineModule/WordsToLineModule';
import { Document, Element, JsonExport } from '../server/src/types/DocumentRepresentation';
import { json2document } from '../server/src/utils/json2document';
import { getPdf, runModules } from './helpers';

describe('JSON export and import', () => {
	withData(
		{
			'one line': 'line-merge.pdf',
			'big text': 'text-order-detection.pdf',
		},
		pdfName => {
			let pdfBefore: Document;
			let pdfAfter: Document;

			function clean(pdf: Document): Promise<Document> {
				Element.resetGlobalId();
				return runModules(pdf, [
					new ReadingOrderDetectionModule(),
					new WordsToLineModule(),
					new LinesToParagraphModule(),
					new HeadingDetectionModule(),
					new HierarchyDetectionModule(),
				]);
			}

			before(done => {
				function transform(pdf: Document): Promise<Document> {
					return clean(pdf)
					.then(doc => {
						const jsonExporter = new JsonExporter(doc, 'word');
						const jsonDoc: JsonExport = jsonExporter.getJson();
						pdfAfter = json2document(jsonDoc);
						return pdfAfter;
					});
				}

				getPdf(transform, pdfName).then(([pdfB, pdfA]) => {
					clean(pdfB)
					.then(pdfBClean => {
						pdfAfter = pdfA;
						pdfBefore = pdfBClean;
						done();
					});
				});
			});

			it('should not change the document structure', () => {
				const jsonBefore: JsonExport = new JsonExporter(pdfBefore, 'word').getJson();
				const jsonAfter: JsonExport = new JsonExporter(pdfAfter, 'word').getJson();

				const jsonObjBefore: object = jsonBefore;
				const jsonObjAfter: object = jsonAfter;

				expect(jsonObjBefore).to.eql(jsonObjAfter);
			});
		},
	);
});
