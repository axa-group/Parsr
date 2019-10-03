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

import { Color } from './Color';

export interface FontOptions {
	weight?: string;
	isItalic?: boolean;
	isUnderline?: boolean;
	color?: Color;
	url?: string;
	scaling?: number;
}

/**
 * The Font class representing a font, including all the attiributes necessary to represent an instance
 * of the format of text, including the font name, size, italics, weight, color, etc.
 */
export class Font {
	/**
	 * Getter name
	 * @return {string}
	 */
	public get name(): string {
		return this._name;
	}

	/**
	 * Getter size
	 * @return {number}
	 */
	public get size(): number {
		return this._size;
	}

	/**
	 * Getter weight
	 * @return {string}
	 */
	public get weight(): string {
		return this._weight;
	}

	/**
	 * Getter isItalic
	 * @return {boolean}
	 */
	public get isItalic(): boolean {
		return this._isItalic;
	}

	/**
	 * Getter isUnderline
	 * @return {boolean}
	 */
	public get isUnderline(): boolean {
		return this._isUnderline;
	}

	/**
	 * Getter color
	 * @return {Color}
	 */
	public get color(): Color {
		return this._color;
	}

	/**
	 * Getter url
	 * @return {string}
	 */
	public get url(): string {
		return this._url;
	}

	/**
	 * Getter scaling
	 * @return {number}
	 */
	public get scaling(): number {
		return this._scaling;
	}

	/**
	 * Setter name
	 * @param {string} value
	 */
	public set name(value: string) {
		this._name = value;
	}

	/**
	 * Setter size
	 * @param {number} value
	 */
	public set size(value: number) {
		this._size = value;
	}

	/**
	 * Setter weight
	 * @param {string} value
	 */
	public set weight(value: string) {
		this._weight = value;
	}

	/**
	 * Setter isItalic
	 * @param {boolean} value
	 */
	public set isItalic(value: boolean) {
		this._isItalic = value;
	}

	/**
	 * Setter isUnderline
	 * @param {boolean} value
	 */
	public set isUnderline(value: boolean) {
		this._isUnderline = value;
	}

	/**
	 * Setter color
	 * @param {Color} value
	 */
	public set color(value: Color) {
		this._color = value;
	}

	/**
	 * Setter url
	 * @param {string} value
	 */
	public set url(value: string) {
		this._url = value;
	}

	/**
	 * Setter scaling
	 * @param {string} value
	 */
	public set scaling(value: number) {
		this._scaling = value;
	}

	public static undefinedFont: Font = new Font('undefined', 0);
	private _name: string;
	private _size: number;
	private _weight: string;
	private _isItalic: boolean;
	private _isUnderline: boolean;
	private _color: Color;
	private _url?: string;
	private _scaling?: number;

	constructor(name: string, size: number, options?: FontOptions) {
		this.name = name;
		this.size = size;

		if (typeof options === 'undefined') {
			options = {};
		}

		if (options.weight) {
			this.weight = options.weight;
		} else {
			this.weight = 'medium';
		}

		if (options.isItalic) {
			this.isItalic = options.isItalic;
		} else {
			this.isItalic = false;
		}

		if (options.isUnderline) {
			this.isUnderline = options.isUnderline;
		} else {
			this.isUnderline = false;
		}

		if (options.color) {
			this.color = options.color;
		} else {
			this.color = '#000000';
		}

		if (options.scaling) {
			this.scaling = options.scaling;
		}
	}

	/**
	 * Compares a given font's properties with the current font's properties, to check if they are equal.
	 * @param font The name of the target font to be compared to 'this'.
	 * @return true/false depending on weather or not the font specified as parameter is the same as the one
	 * in 'this'.
	 */
	public isEqual(font: Font): boolean {
		if (
			font.name === this.name &&
			font.size === this.size &&
			font.weight === this.weight &&
			font.isItalic === this.isItalic &&
			font.isUnderline === this.isUnderline &&
			font.color === this.color &&
			font.scaling === this.scaling
		) {
			return true;
		}
		return false;
	}
}
