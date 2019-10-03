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
import { WordsToLineModule } from '../server/src/processing/WordsToLineModule/WordsToLineModule';
import { Paragraph, Word } from '../server/src/types/DocumentRepresentation';
import { Document } from '../server/src/types/DocumentRepresentation/Document';
import { getPdf, runModules } from './helpers';

const pdfName = 'paragraph-merge.pdf';

describe('Paragraph merge function', () => {
	let docBefore: Document;
	let docAfter: Document;

	before(done => {
		function cleaner(doc: Document) {
			return runModules(doc, [
				new WhitespaceRemovalModule(),
				new ReadingOrderDetectionModule(),
				new WordsToLineModule(),
				new WhitespaceRemovalModule(),
				new LinesToParagraphModule(),
			]);
		}

		getPdf(cleaner, pdfName).then(([docB, docA]) => {
			docBefore = docB;
			docAfter = docA;
			done();
		});
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
