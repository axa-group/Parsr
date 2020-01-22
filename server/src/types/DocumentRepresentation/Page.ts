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

import { RotationCorrection } from '../../input/OcrExtractor';
import { findMostCommonFont, isInBox } from '../../utils';
import logger from '../../utils/Logger';
import { BoundingBox } from './BoundingBox';
import { Element } from './Element';
import { Font } from './Font';
import { Paragraph } from './Paragraph';
import { Text } from './Text';

export type directionType = 'horizontal' | 'vertical';
/**
 * A page in a document is represented by the Page class, which contains a list of elements, vertical and horizontal
 * occupancy areas, and a page number.
 */
export class Page {
  // Syntactic sugars for getters and setters
  public set left(value: number) {
    this.box.left = value;
  }
  public get left(): number {
    return this.box.left;
  }
  public set top(value: number) {
    this.box.top = value;
  }
  public get top(): number {
    return this.box.top;
  }
  public set width(value: number) {
    this.box.width = value;
  }
  public get width(): number {
    return this.box.width;
  }
  public set height(value: number) {
    this.box.height = value;
  }
  public get height(): number {
    return this.box.height;
  }
  private _pageNumber: number;
  private _elements: Element[];
  private _box: BoundingBox;
  private _horizontalOccupancy: boolean[];
  private _verticalOccupancy: boolean[];
  private _pageRotation: RotationCorrection;

  constructor(pageNumber: number, elements: Element[], boundingBox: BoundingBox) {
    this.pageNumber = pageNumber;
    this.elements = elements;
    this.box = boundingBox;
    this.horizontalOccupancy = [];
    this.verticalOccupancy = [];
    this.pageRotation = null;
    this.computePageOccupancy();
  }

  /**
   * Computes all horizontal and vertical page occupancies
   */
  public computePageOccupancy() {
    this.horizontalOccupancy = Array<boolean>(Math.floor(this.box.height)).fill(false);
    this.verticalOccupancy = Array<boolean>(Math.floor(this.box.width)).fill(false);

    const horizontalBarriers: number[][] = this.getBarriers('horizontal');
    horizontalBarriers.forEach(a => {
      for (let i = Math.floor(a[0]); i <= Math.floor(a[1]) + 1; ++i) {
        if (!this.horizontalOccupancy[i]) {
          this.horizontalOccupancy[i] = true;
        }
      }
    });
    const verticalBarriers: number[][] = this.getBarriers('vertical');
    verticalBarriers.forEach(a => {
      for (let i = Math.floor(a[0]); i <= Math.floor(a[1]) + 1; ++i) {
        if (!this.verticalOccupancy[i]) {
          this.verticalOccupancy[i] = true;
        }
      }
    });
  }

  /**
   * Return the coordinates of each of the elements in a given list.
   * @param elements The list of elements for which locations need to be returned.
   * @param returnCenters Boolean indicating if the centers of the elements should be returned as location.
   */
  public getLocationOfElements(elements: Element[], returnCenters: boolean = false): number[][] {
    if (returnCenters) {
      return elements.map((elem: Element) => [
        elem.box.left + elem.box.width / 2,
        elem.box.top + elem.box.height / 2,
      ]);
    } else {
      return elements.map((elem: Element) => [elem.box.left, elem.box.top]);
    }
  }

  /**
   * Return the subset of all the elements completely inside a rectangle defining a subset of the given page.
   * @param box Elements of the subset should be inside this bounding box.
   * @param textOnly Elements of the subset should only be the textual elements.
   */
  public getElementsSubset(box: BoundingBox, textOnly: boolean = false): Element[] {
    return this.elements.filter(e => e instanceof Text || textOnly).filter(e => isInBox(e, box));
  }

  /**
   * Get first level text elements only
   *
   * @return {Text[]}
   */
  public getTexts(): Text[] {
    return this.elements.filter(e => e instanceof Text) as Text[];
  }

  /**
   * Get a list of elements of type in the current Page instance. Pre-ordered.
   *
   * @param type Type of the Element we want to list
   * @param deepSearch Allows searching all elements of type even if are placed as content of other element type
   * @return the list of matching Elements
   */
  public getElementsOfType<T extends Element>(
    type: new (...args: any[]) => T,
    deepSearch: boolean = true,
  ): T[] {
    const result: T[] = new Array<T>();
    this.preOrderTraversal((element: Element) => {
      if (element instanceof type) {
        result.push(element);
      }
    }, deepSearch);
    return result;
  }

  /**
   * Get all the elements of this page
   */
  public getAllElements(): Element[] {
    const result: Element[] = new Array<Element>();
    this.preOrderTraversal((element: Element) => {
      result.push(element);
    });
    return result;
  }

  /**
   * Pre-order traversal, calling back when a node is traversed.
   *
   * @param preOrderCallback yield the Element.
   * @param deepSearch Allows searching all elements of type even if are placed in content of other element type
   */
  public preOrderTraversal(
    preOrderCallback: (element: Element) => void,
    deepSearch: boolean = true,
  ): void {
    let stack: Element[] = Array.from(this.elements);

    while (stack.length > 0) {
      const element = stack.shift();
      preOrderCallback(element);

      if (
        deepSearch &&
        element.content &&
        typeof element.content !== 'string' &&
        element.content.length !== 0
      ) {
        stack = stack.concat(element.content);
      }
    }
  }

  /**
   * Removes an element from the page
   * @param e The element which is to be removed
   */
  public removeElement(e: Element) {
    const index: number = this.elements.indexOf(e, 0);
    if (index > -1 || e !== undefined) {
      this.elements.splice(index, 1);
    } else {
      logger.debug(
        `--> Could not remove element id "${e.id}" in first level elements on page \
        ${this.pageNumber}; it might be located deeper`,
      );
    }
  }

  /**
   * Getter horizontalOccupancy
   * @return {boolean[]}
   */
  public get horizontalOccupancy(): boolean[] {
    return this._horizontalOccupancy;
  }

  /**
   * Setter horizontalOccupancy
   * @param {boolean[]} value
   */
  public set horizontalOccupancy(value: boolean[]) {
    this._horizontalOccupancy = value;
  }

  /**
   * Getter verticalOccupancy
   * @return {boolean[]}
   */
  public get verticalOccupancy(): boolean[] {
    return this._verticalOccupancy;
  }

  /**
   * Setter verticalOccupancy
   * @param {boolean[]} value
   */
  public set verticalOccupancy(value: boolean[]) {
    this._verticalOccupancy = value;
  }

  /**
   * Getter elements
   * @return {Element[]}
   */
  public get elements(): Element[] {
    return this._elements;
  }

  /**
   * Getter pageNumber
   * @return {number}
   */
  public get pageNumber(): number {
    return this._pageNumber;
  }

  /**
   * Getter box
   * @return {BoundingBox}
   */
  public get box(): BoundingBox {
    return this._box;
  }

  /**
   * Setter elements
   * @param {Element[]} value
   */
  public set elements(value: Element[]) {
    this._elements = value;
  }

  /**
   * Setter pageNumber
   * @param {number} value
   */
  public set pageNumber(value: number) {
    this._pageNumber = value;
  }

  /**
   * Setter box
   * @param {BoundingBox} value
   */
  public set box(value: BoundingBox) {
    this._box = value;
  }

  /**
   * Setter PageRotation
   * @param {RotationCorrection} value
   */
  public set pageRotation(value: RotationCorrection) {
    this._pageRotation = value;
  }

  /**
   * Getter PageRotation
   * @return {RotationCorrection}
   */
  public get pageRotation(): RotationCorrection {
    return this._pageRotation;
  }

  /**
   * Returns the main font of the page using the paragraphs' basket + voting
   * mechanism. The most used font will be returned as a valid Font object.
   */
  public getMainFont(): Font | undefined {
    const result: Font = findMostCommonFont(
      this.getElementsOfType<Paragraph>(Paragraph, false)
        .map(p => p.getMainFont())
        .filter(f => f !== undefined),
    );
    if (result !== undefined) {
      return result;
    } else {
      logger.debug(`no font found for page ${this.pageNumber}`);
      return undefined;
    }
  }

  /**
   * Returns an array of type [[start:number, end:number]], representing blocks of occupied space along a
   * particular direction of the page.
   * @param direction Direction along which (horizontal or vertical) the barriers should be returned
   */
  private getBarriers(direction: directionType): number[][] {
    let barriers: number[][] = [];
    if (direction === 'horizontal') {
      barriers = this.elements
        .map((elem: Element) => elem.box)
        .map((b: BoundingBox) => {
          const start: number = b.top;
          const end: number = b.top + b.height;
          return [start, end];
        });
    } else {
      barriers = this.elements
        .map((elem: Element) => elem.box)
        .map((b: BoundingBox) => {
          const start: number = b.left;
          const end: number = b.left + b.width;
          return [start, end];
        });
    }
    return barriers;
  }
}
