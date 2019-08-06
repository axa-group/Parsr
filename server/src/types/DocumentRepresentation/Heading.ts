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

import { BoundingBox } from './BoundingBox';
import { Line } from './Line';
import { Paragraph } from './Paragraph';

/**
 * A derived class from Paragraph, used to represent headings in a document.
 * The attributes level represents the level of the heading; 1 being the highest level.
 */
export class Heading extends Paragraph {
	private _level: number;

	/**
	 * Getter level
	 * @return {number}
	 */
	public get level(): number {
		return this._level;
	}

	/**
	 * Setter level
	 * @param {number} value
	 */
	public set level(value: number) {
		this._level = value;
	}

	constructor(boundingBox: BoundingBox, content: Line[] = [], level: number = 0) {
		super(boundingBox, content);
		this.level = level;
	}
}
