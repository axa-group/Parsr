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

export class TableOfContentsItem extends Element {

  public description: string = '';
  public pageNumber: string = '';
  public level: number = 0;

  constructor(box: BoundingBox, description: string, pageNumber: string, level = 0) {
    super(box);
    this.description = description;
    this.pageNumber = pageNumber;
    this.level = level;
  }

  public get content(): string {
    return this.description;
  }

  public set content(value: string) {
    this.description = value;
  }

  public toHTML() {
    return '&nbsp;&nbsp;'.repeat(this.level).concat(this.description, ' - ', this.pageNumber);
  }
  public toMarkdown() {
    return '  '.repeat(this.level).concat(`[${this.description}](#${this.toLinkableStr(this.description)})`);
  }
  public toString() {
    return '  '.repeat(this.level).concat(this.description, ' - ', this.pageNumber);
  }
  private toLinkableStr(str: string): string {
    return str
      .replace(/[^a-zA-Z\d]+/g, ' ')
      .split(' ')
      .join('-')
      .toLowerCase();
  }
}
