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

import { Document, Page, Text } from '../../types/DocumentRepresentation';
import { Module } from '../Module';
import * as defaultConfig from './defaultConfig.json';

interface Options {
	minWidth?: number;
}

const defaultOptions = (defaultConfig as any) as Options;

/**
 * Stabiltiy: Stable
 * Remove any text block that contains nothing but whitespace.
 */
export class WhitespaceRemovalModule extends Module<Options> {
	public static moduleName = 'whitespace-removal';

	constructor(options?: Options) {
		super(options, defaultOptions);
	}

	public main(doc: Document): Document {
		doc.pages.forEach(page => {
			page.elements = page.elements.filter(e => {
				return (
					!(e instanceof Text) ||
					(e.width < this.options.minWidth ||
						(!/^\s*$/.test(e.toString()) && !isOverlapping(e, page)))
				);
			});
		});

		// Remove any space that are overlapping with text
		// This is a weird but common case
		function isOverlapping(text1: Text, page: Page): boolean {
			const pageTexts = page.getTexts();
			for (const text2 of pageTexts) {
				if (
					text1 !== text2 &&
					text1.top === text2.top &&
					text1.left === text2.left &&
					/^[ \t]*$/.test(text1.toString())
				) {
					return true;
				}
			}

			return false;
		}

		return doc;
	}
}
