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

import { Element } from './Element';

export abstract class Text extends Element {
	private _redundant: boolean;
	private _confidence: number;

	public abstract toString(): string;
	public abstract get content(): Text[] | string;
	public abstract set content(value: Text[] | string);

	/**
	 * Getter redundant
	 * @return {boolean}
	 */
	public get redundant(): boolean {
		return this._redundant;
	}

	/**
	 * Getter confidence
	 * @return {number}
	 */
	public get confidence(): number {
		return this._confidence;
	}

	/**
	 * Setter redundant
	 * @param {boolean} value
	 */
	public set redundant(value: boolean) {
		this._redundant = value;
	}

	/**
	 * Setter confidence
	 * @param {number} value
	 */
	public set confidence(value: number) {
		this._confidence = value;
	}
}
