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
import { Paragraph } from './Paragraph';

/**
 * The List element is a collection of paragraphs that represent a block of list items in a Document.
 * The boolean attribute isOrdered distinguishes an ordered from an unordered (bulleted) list.
 * The list's level in terms of text indentation can also be specified using the level class attribute.
 */
export class List extends Element {
  private _content: Paragraph[];
  private _isOrdered: boolean;
  private _level: number;
  private _firstItemNumber: number;

  constructor(
    boundingBox: BoundingBox,
    content?: Paragraph[],
    isOrdered?: boolean,
    firstItemNumber: number = 1,
  ) {
    super(boundingBox);
    this._content = content;
    this._isOrdered = isOrdered;
    this.firstItemNumber = firstItemNumber;
  }

  public addListItem(paragraph: Paragraph) {
    this.content.push(paragraph);
    this.box = BoundingBox.merge([this.box, paragraph.box]);
  }

  /**
   * Getter content
   * @return {Paragraph[]}
   */
  public get content(): Paragraph[] {
    return this._content;
  }

  /**
   * Getter isOrdered
   * @return {boolean}
   */
  public get isOrdered(): boolean {
    return this._isOrdered;
  }

  /**
   * Getter level
   * @return {number}
   */
  public get level(): number {
    return this._level;
  }

  /**
   * Setter content
   * @param {Paragraph[]} value
   */
  public set content(value: Paragraph[]) {
    this._content = value;
  }

  /**
   * Setter isOrdered
   * @param {boolean} value
   */
  public set isOrdered(value: boolean) {
    this._isOrdered = value;
  }

  /**
   * Setter level
   * @param {number} value
   */
  public set level(value: number) {
    this._level = value;
  }

  /**
   * Getter firstItemNumber
   * @return {number}
   */
  public get firstItemNumber(): number {
    return this._firstItemNumber;
  }

  /**
   * Setter firstItemNumber
   * @param {number} value
   */
  public set firstItemNumber(value: number) {
    this._firstItemNumber = value;
  }

  public toString(): string {
    return this.export('text');
  }

  public toMarkdown(): string {
    return this.export('md');
  }

  public toSimpleJSON(): any {
    return {
      type : 'list',
      content : this.export('simple'),
    };
  }

  private export(type: string): string {
    let output: string = '';
    this.content.forEach((para, index) => {
      let paraText: string = '';
      if (type === 'md') {
        paraText = para.toMarkdown();
      } else if (type === 'simple') {
        paraText = para.toSimpleJSON().content;
      } else {
        paraText = para.toString();
      }
      if (this.isOrdered) {
        output += (this.firstItemNumber + index).toString() + '. ';
      } else {
        output += '- ';
      }
      output += paraText + (index + 1 < this.content.length ? '\n' : '');
    });
    return output;
  }
}
