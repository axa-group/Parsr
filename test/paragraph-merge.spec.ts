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
import 'mocha';
import { LinesToParagraphModule } from '../server/src/processing/LinesToParagraphModule/LinesToParagraphModule';
import { ReadingOrderDetectionModule } from '../server/src/processing/ReadingOrderDetectionModule/ReadingOrderDetectionModule';
import { WhitespaceRemovalModule } from '../server/src/processing/WhitespaceRemovalModule/WhitespaceRemovalModule';
import { OutOfPageRemovalModule } from '../server/src/processing/OutOfPageRemovalModule/OutOfPageRemovalModule';
import {
	TableDetectionModule,
	TableExtractor,
} from '../server/src/processing/TableDetectionModule/TableDetectionModule';

import { WordsToLineModule } from '../server/src/processing/WordsToLineModule/WordsToLineModule';
import { Paragraph, Word } from '../server/src/types/DocumentRepresentation';
import { Document } from '../server/src/types/DocumentRepresentation/Document';
import { getPdf, runModules, TableExtractorStub } from './helpers';
import * as fs from 'fs';

let docBefore: Document;
let docAfter: Document;

function executePipeLine(pdfName: string, done, tableExtractor?: TableExtractor) {
	function cleaner(doc: Document) {
		if (!tableExtractor) {
			tableExtractor = new TableExtractorStub(0, '', '[]');
			console.log('No Table extractyor');
		} else {
			console.log('We have table extractor');
		}

		return runModules(doc, [
			new OutOfPageRemovalModule(),
			new WhitespaceRemovalModule(),
			new TableDetectionModule(null, tableExtractor),
			new ReadingOrderDetectionModule(),
			new WordsToLineModule(),
			new LinesToParagraphModule(),
		]);
	}

	getPdf(cleaner, pdfName).then(([docB, docA]) => {
		docBefore = docB;
		docAfter = docA;
		done();
	});
}
describe('Paragraph merge function', () => {
	before(done => {
		executePipeLine('paragraph-merge.pdf', done);
	});

	it('should merge side-by-side lines into paragraphs', () => {
		expect(docAfter.pages[0].getElementsOfType<Paragraph>(Paragraph))
			.to.be.an('array')
			.and.to.be.of.length(4);
	});

	it('should not alter the content', () => {
		const contentBefore = docBefore.pages[0]
			.getElementsOfType<Word>(Word)
			.map(w => w.toString().trim())
			.join(' ');
		const contentAfter = docAfter.pages[0].elements.join(' ');
		expect(contentAfter).to.be.equal(contentBefore);
	});
});

describe('Paragraph merge function with irregular line spaces', () => {
	before(done => {
		executePipeLine('paragraph-merge-2.pdf', done);
	});

	it('should merge side-by-side lines into paragraphs', () => {
		expect(docAfter.pages[0].getElementsOfType<Paragraph>(Paragraph))
			.to.be.an('array')
			.and.to.be.of.length(5);
	});
});

describe('Paragraph merge function with more irregular line spaces', () => {
	before(done => {
		executePipeLine('paragraph-merge-3.pdf', done);
	});

	it('should merge side-by-side lines into paragraphs', () => {
		expect(docAfter.pages[0].getElementsOfType<Paragraph>(Paragraph))
			.to.be.an('array')
			.and.to.be.of.length(6);
	});
});

describe('Paragraph merge function with tables ans more', () => {
	const extractorOutput = fs.readFileSync(
		`${__dirname}/assets/mocks/paragraph-merge-5.json`,
		'utf8',
	);
	const tableExtractor = new TableExtractorStub(0, '', extractorOutput);

	before(done => {
		executePipeLine('paragraph-merge-5.pdf', done, tableExtractor);
	});

	it('should merge side-by-side lines into paragraphs', () => {
		expect(docAfter.pages[0].getElementsOfType<Paragraph>(Paragraph, true))
			.to.be.an('array')
			.and.to.be.of.length(52);
	});
});
