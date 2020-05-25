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
import { TableCell } from './TableCell';

export class SpannedTableCell extends TableCell {
  /**
   * span direction is in which direction to go,
   * starting from the position of this cell, to find the TableCell that spans into this one.
   */
  private _spanDirection: string = '';
  constructor(boundingBox: BoundingBox, direction: string) {
    super(boundingBox);
    this._spanDirection = direction;
    this.content = [];
  }

  public get spanDirection(): string {
    return this._spanDirection;
  }

  public toMarkdown(): string {
    switch (this._spanDirection) {
      case 'left': return '<';
      case 'right': return '>';
      case 'top': return '^';
      default: return '';
    }
  }

  public toString(): string {
    return '';
  }
}
