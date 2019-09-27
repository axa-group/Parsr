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

import { BoundingBox } from './BoundingBox';
import { SvgShape } from './SvgShape';

export class SvgLine extends SvgShape {
	/**
	 * Getter lineType
	 * @return {string}
	 */
	public get lineType(): string {
		return this._lineType;
	}

	/**
	 * Setter lineType
	 * @param {string} value
	 */
	public set lineType(value: string) {
		this._lineType = value;
	}

	/**
	 * Getter thickness
	 * @return {number}
	 */
	public get thickness(): number {
		return this._thickness;
	}

	/**
	 * Setter thickness
	 * @param {number} value
	 */
	public set thickness(value: number) {
		this._thickness = value;
	}

	/**
	 * Getter fromX
	 * @return {number}
	 */
	public get from_x(): number {
		return this._fromX;
	}

	/**
	 * Getter fromY
	 * @return {number}
	 */
	public get from_y(): number {
		return this._fromY;
	}

	/**
	 * Getter toX
	 * @return {number}
	 */
	public get to_x(): number {
		return this._toX;
	}

	/**
	 * Getter toY
	 * @return {number}
	 */
	public get toY(): number {
		return this._toY;
	}

	/**
	 * Setter fromX
	 * @param {number} value
	 */
	public set fromX(value: number) {
		this._fromX = value;
	}

	/**
	 * Setter fromY
	 * @param {number} value
	 */
	public set fromY(value: number) {
		this._fromY = value;
	}

	/**
	 * Setter toX
	 * @param {number} value
	 */
	public set toX(value: number) {
		this._toX = value;
	}

	/**
	 * Setter toY
	 * @param {number} value
	 */
	public set toY(value: number) {
		this._toY = value;
	}
	public content: null = null;
	private _lineType: string;
	private _thickness: number;
	private _fromX: number;
	private _fromY: number;
	private _toX: number;
	private _toY: number;

	constructor(
		bbox: BoundingBox,
		thickness: number,
		fromX: number,
		fromY: number,
		toX: number,
		toY: number,
	) {
		super(bbox);
		this.thickness = thickness;
		this.fromX = fromX;
		this.fromY = fromY;
		this.toX = toX;
		this.toY = toY;
	}
}
