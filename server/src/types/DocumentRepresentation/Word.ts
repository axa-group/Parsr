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
import { Character } from './Character';
import { Font } from './Font';
import { Text } from './Text';

export class Word extends Text {
  private _content: Character[] | string;
  private _language: string;
  private _isInDictionary: boolean;
  private _font: Font;

  constructor(
    boundingBox: BoundingBox,
    content: Character[] | string = [],
    font: Font,
    language: string = '',
  ) {
    super(boundingBox);
    this.content = content;
    this.font = font;
    this.language = language;
  }

  public toMarkDown(): string {
    let mdString: string;

    if (this.properties.targetURL) {
      mdString = `[${this.toString()}](${this.properties.targetURL})`;
    } else {
      mdString = this.toString();
      // mdString = this.toString().replace(/([\d]+)([\.\)])/g, '$1\\$2');
    }

    return mdString;
  }

  public toString(): string {
    if (typeof this.content === 'string') {
      return this.content.trim();
    } else {
      return this.content.map(c => c.toString()).reduce((c1, c2) => c1 + c2, '');
    }
  }

  /**
   * Getter content
   * @return {Character[] | string}
   */
  public get content(): Character[] | string {
    return this._content;
  }

  /**
   * Getter language
   * @return {string}
   */
  public get language(): string {
    return this._language;
  }

  /**
   * Getter isInDictionary
   * @return {boolean}
   */
  public get isInDictionary(): boolean {
    return this._isInDictionary;
  }

  /**
   * Setter content
   * @param {Character[] | string} value
   */
  public set content(value: Character[] | string) {
    this._content = value;
  }

  /**
   * Setter language
   * @param {string} value
   */
  public set language(value: string) {
    this._language = value;
  }

  /**
   * Setter isInDictionary
   * @param {boolean} value
   */
  public set isInDictionary(value: boolean) {
    this._isInDictionary = value;
  }

  /**
   * Getter font
   * @return {Font}
   */
  public get font(): Font {
    return this._font;
  }

  /**
   * Setter font
   * @param {Font} value
   */
  public set font(value: Font) {
    this._font = value;
  }
}
