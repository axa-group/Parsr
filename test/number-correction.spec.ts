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
import { NumberCorrectionModule } from '../server/src/modules/NumberCorrectionModule/NumberCorrectionModule';
import {
	BoundingBox,
	Document,
	Font,
	Line,
	Page,
	Paragraph,
	Table,
	TableCell,
	TableRow,
	Word,
} from '../server/src/types/DocumentRepresentation';
import { getPdf, runModules } from './helpers';

describe('Number correction from pdf', () => {
	const pdfName = 'number-correction-1.pdf';
	let pdfAfter: Document;

	before(done => {
		function transform(doc: Document) {
			return runModules(doc, [new NumberCorrectionModule()]);
		}

		getPdf(transform, pdfName)
		.then(([, pdfA]) => {
			pdfAfter = pdfA;
			done();
		});
	});

	// this is dirty and we want to get number of tests from the test file itself
	const testIds: number[] = Array.from(Array(11).keys());
	testIds.forEach(i => {
		it(`should fix number misrecognition looking like 0.00`, () => {
			const expected = pdfAfter.pages[0].elements[i].content;
			expect(expected).to.be.equal('0.00');
		});
	});
});

describe('Number correction from Abbyy-style table output', () => {
	const dummyBB = new BoundingBox(0, 0, 0, 0);
	const dummyFont = new Font('Arial', 12);
	const testDocument: Document = new Document([
		new Page(
			0,
			[
				new Table([
					new TableRow(
						[
							new TableCell(dummyBB, [
								new Paragraph(dummyBB, [
									new Line(dummyBB, [new Word(dummyBB, '1234', dummyFont), new Word(dummyBB, '00', dummyFont)]),
								]),
							]),
						],
						dummyBB,
					),
				]),
			],
			dummyBB,
		),
	]);

	const numberCorrectionModule = new NumberCorrectionModule();

	it(`should fix number misrecognition on testDocument`, () => {
		const wordsBefore = testDocument.pages[0].getElementsOfType<Word>(Word);
		expect(wordsBefore.length).to.be.equal(2);
		numberCorrectionModule.run(testDocument).then(document => {
			const wordsAfterCorrection = document.pages[0].getElementsOfType<Word>(Word);
			expect(wordsAfterCorrection.length).to.be.equal(1);
			expect(wordsAfterCorrection[0].content).to.be.equal('1234.00');
		});
	});
});

function testableSuggest(numberCorrectionModule, input: string, regexp: RegExp, whitelist: Set<string>) {
	const suggestions = numberCorrectionModule.suggestNumberCorrections(input, regexp, whitelist);
	if (suggestions.length > 0) {
		return suggestions[0][0];
	}
	return input;
}

describe('Single string number correction', () => {
	const accountingFormat = RegExp('^([0-9]{1,3},([0-9]{3},)*[0-9]{3}|[0-9]+)(\\.[0-9]{2})?$');
	const emptyWhitelist = new Set<string>();
	const numberCorrectionModule = new NumberCorrectionModule();

	withData(['ooo', 'OOO', 'o.O0', 'o.oo'], test => {
		it(`should fix number misrecognition "${test}" looking like "0.00"`, () => {
			expect(testableSuggest(numberCorrectionModule, test, accountingFormat, emptyWhitelist)).to.be.equal('0.00');
		});
	});
	withData(['001', 'OOI'], test => {
		it(`should fix number misrecognition "${test}" looking like "0.01"`, () => {
			expect(testableSuggest(numberCorrectionModule, test, accountingFormat, emptyWhitelist)).to.be.equal('0.01');
		});
	});
	withData(['9,999,99'], test => {
		it(`should fix number misrecognition "${test}" looking like "9,999.99"`, () => {
			expect(testableSuggest(numberCorrectionModule, test, accountingFormat, emptyWhitelist)).to.be.equal('9,999.99');
		});
	});
	withData(['S', ' S'], test => {
		it(`should fix number misrecognition "${test}" looking like "5"`, () => {
			expect(testableSuggest(numberCorrectionModule, test, accountingFormat, emptyWhitelist)).to.be.equal('5');
		});
	});
	withData(['155', ' ISS', '1SS'], test => {
		it(`should fix number misrecognition "${test}" looking like "155"`, () => {
			expect(testableSuggest(numberCorrectionModule, test, accountingFormat, emptyWhitelist)).to.be.equal('155');
		});
	});
	withData(['ISS'], test => {
		it(`should not change whitelisted word "${test}" looking like "155"`, () => {
			expect(testableSuggest(numberCorrectionModule, test, accountingFormat, new Set<string>(['ISS']))).to.be.equal(test);
		});
	});
	withData(['wooooooops', 'ooooolala', 'pony'], test => {
		it(`should not get any suggestions for legit words "${test}"`, () => {
			expect(testableSuggest(numberCorrectionModule, test, accountingFormat, emptyWhitelist)).to.be.equal(test);
		});
	});
	withData(['4000', '1234.344', '1,234.23'], test => {
		it(`should not change legit numbers "${test}"`, () => {
			expect(testableSuggest(numberCorrectionModule, test, accountingFormat, emptyWhitelist)).to.be.equal(test);
		});
	});
});
