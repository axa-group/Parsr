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

/**
 * BoundingBox represents the size as well the location of any DocumentRepresentation
 * element, using the elements height, width, left and top. Other than a regular constructor,
 * the bounding box can also be constructed using a merge of multiple existing bounding box types.
 */
export class BoundingBox {
  /**
   * Getter left
   * @return {number}
   */
  public get left(): number {
    return this._left;
  }

  /**
   * Getter top
   * @return {number}
   */
  public get top(): number {
    return this._top;
  }

  /**
   * Getter width
   * @return {number}
   */
  public get width(): number {
    return this._width;
  }

  /**
   * Getter height
   * @return {number}
   */
  public get height(): number {
    return this._height;
  }

  /**
   * Setter left
   * @param {number} value
   */
  public set left(value: number) {
    this._left = value;
  }

  /**
   * Setter top
   * @param {number} value
   */
  public set top(value: number) {
    this._top = value;
  }

  /**
   * Setter width
   * @param {number} value
   */
  public set width(value: number) {
    this._width = value;
  }

  /**
   * Setter height
   * @param {number} value
   */
  public set height(value: number) {
    this._height = value;
  }

  /**
   * Getter right
   * @return {number}
   */
  public get right(): number {
    return this.left + this.width;
  }

  /**
   * Setter right
   * @param {number} value
   */
  public set right(value: number) {
    this.width = value - this.left;
  }

  /**
   * Getter bottom
   * @return {number}
   */
  public get bottom(): number {
    return this.top + this.height;
  }

  /**
   * Setter bottom
   * @param {number} value
   */
  public set bottom(value: number) {
    this.height = value - this.top;
  }

  /**
   * Returns true if two bounding boxes are equal
   * @param b1 first bbox
   * @param b2 second bbox
   */
  public static isEqual(b1: BoundingBox, b2: BoundingBox): boolean {
    return (
      b1.height === b2.height && b1.width === b2.width && b1.top === b2.top && b1.left === b2.left
    );
  }

  /**
   * Computes the amount (between 0 to 1) of overlap between two bounding boxes
   * @param box1 First boundingbox
   * @param box2 Second boundingbox
   */
  public static getOverlap(box1: BoundingBox, box2: BoundingBox): number {
    let overlapValue: number;

    // coordinates of the intersection rectangle
    const intersectionRectangleLeft: number = Math.max(box1.left, box2.left);
    const intersectionRectangleRight: number = Math.min(box1.right, box2.right);
    const intersectionRectangleBottom: number = Math.min(box1.bottom, box2.bottom);
    const intintersectionRectangleTop: number = Math.max(box1.top, box2.top);

    if (
      intersectionRectangleRight < intersectionRectangleLeft &&
      intersectionRectangleBottom < intintersectionRectangleTop
    ) {
      overlapValue = 0.0; // no intersectionRectangle at all
    } else {
      const elem1Area: number = box1.height * box1.width;
      const elem2Area: number = box2.height * box2.width;
      const intersectionRectangleArea: number =
        (intersectionRectangleRight - intersectionRectangleLeft) *
        (intersectionRectangleBottom - intintersectionRectangleTop);
      const commonArea: number = elem1Area + elem2Area - intersectionRectangleArea;

      overlapValue = intersectionRectangleArea / commonArea;
    }
    return overlapValue;
  }

  /**
   * Merges a list of bounding boxes and returns a single one englobing all
   * the others
   * @param boxes list of bounding boxes to be merged
   * @returns a bounding box resulting from the complex hull of all the
   * bounding boxes described by 'boxes'
   */
  public static merge(boxes: BoundingBox[]): BoundingBox {
    if (boxes.length === 0) {
      return new BoundingBox(0, 0, 0, 0);
    }

    const top: number = Math.min(...boxes.map(l => l.top));
    const bottom: number = Math.max(...boxes.map(l => l.top + l.height));
    const height: number = bottom - top;
    const left: number = Math.min(...boxes.map(l => l.left));
    const right: number = Math.max(...boxes.map(l => l.left + l.width));
    const width: number = right - left;
    return new BoundingBox(left, top, width, height);
  }

  private _left: number;
  private _top: number;
  private _width: number;
  private _height: number;

  constructor(left: number, top: number, width: number, height: number) {
    this.left = left;
    this.top = top;
    this.width = width;
    this.height = height;
  }

  /**
   * Checks if the area of a bounding box is empty, by checking if either the height or the width
   * of the bounding box is equal to 0.
   * @returns true or false depending on weather the area of the bounding box is zero or not, respectively.
   */
  public areaIsEmpty(): boolean {
    return this.height === 0 || this.width === 0;
  }
}
