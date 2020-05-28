/**
 * Copyright 2020 AXA Group Operations S.A.
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
   * Getter line color
   * @return {string} in hex format
   */
  public get color(): string {
    return this._color;
  }

  /**
   * Setter color
   * @param {string} value
   */
  public set color(value: string) {
    this._color = value;
  }

  /**
   * Getter fromX
   * @return {number}
   */
  public get fromX(): number {
    return this._fromX;
  }

  /**
   * Getter fromY
   * @return {number}
   */
  public get fromY(): number {
    return this._fromY;
  }

  /**
   * Getter toX
   * @return {number}
   */
  public get toX(): number {
    return this._toX;
  }

  /**
   * Getter toY
   * @return {number}
   */
  public get toY(): number {
    return this._toY;
  }

  public get fillOpacity(): number {
    return this._fillOpacity;
  }

  public get strokeOpacity(): number {
    return this._strokeOpacity;
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

  public set fillOpacity(value: number) {
    this._fillOpacity = value;
  }

  public set strokeOpacity(value: number) {
    this._strokeOpacity = value;
  }

  public content: null = null;
  private _lineType: string;
  private _thickness: number;
  private _fromX: number;
  private _fromY: number;
  private _toX: number;
  private _toY: number;
  private _color: string;
  private _fillOpacity: number;
  private _strokeOpacity: number;

  constructor(
    bbox: BoundingBox,
    thickness: number,
    fromX: number,
    fromY: number,
    toX: number,
    toY: number,
    color: string = '#000000',
  ) {
    super(bbox);
    this.thickness = thickness;
    this.color = color;
    this.fromX = fromX;
    this.fromY = fromY;
    this.toX = toX;
    this.toY = toY;
  }

  // https://stackoverflow.com/questions/9043805/test-if-two-lines-intersect-javascript-function
  public intersects(line: SvgLine): boolean {
    const a = this.fromX;
    const b = this.fromY;
    const c = this.toX;
    const d = this.toY;

    const p = line.fromX;
    const q = line.fromY;
    const r = line.toX;
    const s = line.toY;

    const det = (c - a) * (s - q) - (r - p) * (d - b);
    if (det === 0) {
      return false;
    } else {
      const lambda = ((s - q) * (r - a) + (p - r) * (s - b)) / det;
      const gamma = ((b - d) * (r - a) + (c - a) * (s - b)) / det;
      return (0 <= lambda && lambda <= 1) && (0 <= gamma && gamma <= 1);
    }
  }

  public move(xDiff: number, yDiff: number) {
    this.fromX += xDiff;
    this.toX += xDiff;
    this.fromY += yDiff;
    this.toY += yDiff;
  }

  public isVertical(): boolean {
    return Math.abs(this.rotationAngle()) === 90;
  }

  public isHorizontal(): boolean {
    return this.rotationAngle() === 0 || this.rotationAngle() === 180;
  }

  private rotationAngle(): number {
    return Math.atan2(this.toY - this.fromY, this.toX - this.fromX) * 180 / Math.PI;
  }
}
