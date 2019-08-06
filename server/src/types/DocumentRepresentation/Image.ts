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
import { Element } from './Element';

/**
 * Image element represents an image in a document, with the url attribute representing the location of
 * the image.
 */
export class Image extends Element {
	/**
	 * Getter url
	 * @return {string}
	 */
	public get url(): string {
		return this._url;
	}

	/**
	 * Setter url
	 * @param {string} value
	 */
	public set url(value: string) {
		this._url = value;
	}

	public content: null = null;
	private _url: string;

	constructor(boundingBox: BoundingBox, url?: string) {
		super(boundingBox);
		this.url = url;
	}
}
