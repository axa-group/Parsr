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

import { Document, Text } from '../../types/DocumentRepresentation';
import { Module } from '../Module';

// TODO Handle ordered list.
/**
 * Stability: Unstable
 * Merge lines containing bullet points characters and tag them accordingly.
 * Doesn't handle odered list (with bullet such as `1)`, `I.`, `a)`, `i.`, etc.) yet.
 */
export class ListDetectionModule extends Module {
	public static moduleName = 'list-detection-module';

	public main(doc: Document): Document {
		const maxSpace = 60; // space width between bullet and text in px
		const maxBulletLength = 3;

		doc.pages.forEach(page => {
			// let texts: Text[] = page.getTexts();
		});

		return doc;

		function isAligned(bullet: Text, text: Text): boolean {
			return (
				bullet.left + bullet.width + maxSpace >= text.left &&
				bullet.left < text.left + text.width &&
				((bullet.top <= text.top && bullet.top + bullet.height >= text.top) ||
					(bullet.top >= text.top && bullet.top <= text.top + text.height))
			);
		}
	}
}
