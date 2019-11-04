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
import { Element } from './Element';

/**
 * Image element represents an image in a document, with the src attribute representing the location of
 * the image.
 */
export class Image extends Element {
  /**
   * Getter src
   * @return {string}
   */
  public get src(): string {
    return this._src;
  }

  /**
   * Setter src
   * @param {string} value
   */
  public set src(value: string) {
    this._src = value;
  }

  public content: null = null;
  private _src: string;

  constructor(boundingBox: BoundingBox, src?: string) {
    super(boundingBox);
    this.src = src;
  }
}
