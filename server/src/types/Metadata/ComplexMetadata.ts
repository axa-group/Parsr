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

import { Element } from '../DocumentRepresentation';
import { Metadata } from './Metadata';

export class ComplexMetadata<T> implements Metadata {
	/**
	 * Getter elements
	 * @return {Element[]}
	 */
	public get elements(): Element[] {
		return this._elements;
	}

	/**
	 * Setter elements
	 * @param {Element[]} value
	 */
	public set elements(value: Element[]) {
		this._elements = value;
	}

	/**
	 * Getter data
	 * @return {T}
	 */
	public get data(): T {
		return this._data;
	}

	/**
	 * Setter data
	 * @param {T} value
	 */
	public set data(value: T) {
		this._data = value;
	}

	private _elements: Element[];
	private _data: T;

	constructor(elements: Element[], data: T) {
		this._elements = elements;
		this._data = data;
	}
}
