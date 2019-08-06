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

export class NumberMetadata implements Metadata {
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
	 * Getter value
	 * @return {number}
	 */
	public get value(): number {
		return this._value;
	}

	/**
	 * Setter value
	 * @param {number} value
	 */
	public set value(value: number) {
		this._value = value;
	}

	private _value: number;
	private _elements: Element[];

	constructor(elements: Element[], value: number) {
		this.value = value;
		this.elements = elements;
	}
}
