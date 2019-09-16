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

import { assert, expect } from 'chai';
import { withData } from 'leche';
import 'mocha';
import { BoundingBox, Font, Text, Word } from '../server/src/types/DocumentRepresentation';
import { Line } from '../server/src/types/DocumentRepresentation/Line';
import * as utils from '../server/src/utils';

const dummyFont = new Font('Arial', 12);

const t1 = new Word(new BoundingBox(10, 5, 30, 20), 'first', dummyFont);
t1.properties.order = 1;

// We can't clone t1 as the _id_ is a read only property
// and will inherently be different for each object on instantiation
const t1Dup = new Word(new BoundingBox(10, 5, 30, 20), 'first', dummyFont);
t1Dup.properties.order = 1;

const t2 = new Word(new BoundingBox(55, 60, 30, 40), 'second', dummyFont);
t2.properties.order = 2;
const t2Dup = new Word(new BoundingBox(55, 60, 30, 40), 'second', dummyFont);
t2Dup.properties.order = 2;

const t3 = new Word(new BoundingBox(155, 160, 10, 5), 'third', dummyFont);
t3.properties.order = 3;
const t3Dup = new Word(new BoundingBox(155, 160, 10, 5), 'third', dummyFont);
t3Dup.properties.order = 3;

describe('Utils sortTextsByOrder function', () => {
	it('should sort texts', () => {
		expect(utils.sortElementsByOrder(t1, t2)).to.be.lessThan(0);
		expect(utils.sortElementsByOrder(t2, t1)).to.be.greaterThan(0);
	});
});

describe('Utils mergeText function', () => {
	it('should merge texts', () => {
		const parent = new Line(null);
		const result: Text = utils.mergeElements(parent, t3, t1, t2);
		const resultString = (result.content as Text[]).map(e => e.content).join(' ');
		expect(resultString).to.be.equal('first second third');
		expect(result.top).to.be.equal(5);
		expect(result.left).to.be.equal(10);
		expect(result.height).to.be.equal(160);
		expect(result.width).to.be.equal(155);
	});

	it('should not have side effects', () => {
		function pseudoDeepCheck(elt1, elt2) {
			expect(elt1.box).to.be.deep.equal(elt2.box);
			expect(elt1.properties).to.be.deep.equal(elt2.properties);
			expect(elt1.children).to.be.deep.equal(elt2.children);
			expect(elt1.content).to.be.equal(elt2.content);
		}
		pseudoDeepCheck(t1, t1Dup);
		pseudoDeepCheck(t2, t2Dup);
		pseudoDeepCheck(t3, t3Dup);
	});

	it('should always return a Text', () => {
		assert.instanceOf(utils.mergeElements(t1), Text);
		assert.instanceOf(utils.mergeElements(t2, t3, t1), Text);
	});
});

describe('Utils getPageRegex function', () => {
	withData(
		[
			'3',
			'03',
			'(3)',
			'[3]',
			'[ 3 ]',
			'-3-',
			'- 3-',
			'- 3 -',
			'iii',
			'(iii)',
			'- CIX -',
			'Page 3',
			'Page | 3',
			'3 | Page',
			'Page 3 of 74',
			'3 of 32',
			'pages 3-4',
			'3 / 20',
			'Página 3 de 19',
			'3 of\n21',
			// '3 - General conditions PP 8601-01',
			// '3 - General Terms and Conditions September 2016',
			// 'Drive Motor Insurance Policy | 3',
			// 'Tradesman’s Combined 3',
			// 'PAGE NO.\n3\n77-53-46\nSIG\nSAN JUAN\nR',
			// 'Marine Legal Protection 3',
		],
		text => {
			it('should return a regex that matches page numbers', () => {
				assert(utils.getPageRegex().test(text));
			});
			it('should have a capturing group for the page number', () => {
				const match = text.match(utils.getPageRegex());
				let pageNumber;

				for (let i = 1; i < match.length; i++) {
					if (match[i]) {
						pageNumber = match[i];
					}
				}

				expect(pageNumber).to.exist;
				expect(pageNumber).to.not.be.empty;
			});
		},
	);
});
