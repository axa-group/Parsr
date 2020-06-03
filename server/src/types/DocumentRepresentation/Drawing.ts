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
import { Element } from './Element';
import { SvgLine } from './SvgLine';
import { SvgShape } from './SvgShape';
import { maxValue, minValue } from './../../utils';
/**
 * The Drawing element for the Document Representation structure, which contains an SVG shape,
 * along with its bounding box.
 */
export class Drawing extends Element {
  private _content: SvgShape[];

  constructor(boundingBox: BoundingBox, content?: SvgShape[]) {
    super(boundingBox);
    this.content = content;
  }

  /**
   * Getter content
   * @return {SvgShape[]}
   */
  public get content(): SvgShape[] {
    return this._content;
  }

  /**
   * Setter content
   * @param {SvgShape[]} value
   */
  public set content(value: SvgShape[]) {
    this._content = value;
  }

  public updateBoundingBox() {
    const lines: SvgLine[] = (this.content.filter(c => c instanceof SvgLine) as SvgLine[]);

    const yValues = lines.map(l => l.fromY).concat(lines.map(l => l.toY));
    const xValues = lines.map(l => l.fromX).concat(lines.map(l => l.toX));

    // array of values could be very big, so I need to avoid calling Math.max and Math.min
    // https://stackoverflow.com/questions/42623071/maximum-call-stack-size-exceeded-with-math-min-and-math-max
    const minY = minValue(yValues);
    const maxY = maxValue(yValues);
    const minX = minValue(xValues);
    const maxX = maxValue(xValues);

    this.box = new BoundingBox(minX, minY, maxX - minX, maxY - minY);
  }

  public toString(): string {
    return this.content.map(c => c.toString()).join('');
  }
}
