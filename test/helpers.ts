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

import * as clone from 'clone';
import { readFileSync } from 'fs';
import { PdfJsonExtractor } from '../server/src/input/pdf2json/PdfJsonExtractor';
import { PdfminerExtractor } from '../server/src/input/pdfminer/PdfminerExtractor';
import { Module } from '../server/src/processing/Module';
import { Config } from '../server/src/types/Config';
import { Document } from '../server/src/types/DocumentRepresentation/Document';

export function getPdfUsingPdfMiner(
	func: (doc: Document) => Promise<Document>,
	filename: string,
): Promise<[Document, Document]> {
	const config: Config = JSON.parse(readFileSync(`${__dirname}/../server/defaultConfig.json`, 'utf8'));

	let docBefore: Document;

	return new PdfminerExtractor(config)
	.run(`${__dirname}/assets/${filename}`)
	.then((doc: Document) => {
		docBefore = clone(doc);
		const docAfterPromise: Promise<Document> = func(doc);
		return docAfterPromise;
	})
	.then(docAfter => {
		return [docBefore, docAfter] as [Document, Document]; // required because TS doesn't handle tuples correctly
	});
}

export function getPdf(
	func: (doc: Document) => Promise<Document>,
	filename: string,
): Promise<[Document, Document]> {
	const config: Config = JSON.parse(readFileSync(`${__dirname}/../server/defaultConfig.json`, 'utf8'));

	let docBefore: Document;

	return new PdfJsonExtractor(config)
	.run(`${__dirname}/assets/${filename}`)
	.then((doc: Document) => {
		docBefore = clone(doc);
		const docAfterPromise: Promise<Document> = func(doc);
		return docAfterPromise;
	})
	.then(docAfter => {
		return [docBefore, docAfter] as [Document, Document]; // required because TS doesn't handle tuples correctly
	});
}

export function runModules(originalDocument: Document, modules: Module[]): Promise<Document> {
	return runNextModule(originalDocument, 0);

	function runNextModule(document: Document, i: number): Promise<Document> {
		if (i < modules.length) {
			return modules[i].run(document).then((newDoc: Document) => {
				return runNextModule(newDoc, i + 1);
			});
		} else {
			return Promise.resolve(document);
		}
	}
}
