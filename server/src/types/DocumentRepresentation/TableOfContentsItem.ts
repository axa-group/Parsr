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

import { Element } from './Element';

export class TableOfContentsItem extends Element {

  public description: string = '';
  public pageNumber: string = '';
  public level: number = 0;

  constructor(description, pageNumber, level = 0) {
    super();
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
    return '\t'.repeat(this.level).concat(this.description, ' - page ', this.pageNumber);
  }
  public toMarkdown() {
    return this.toHTML();
  }

  public toString() {
    return this.toHTML();
  }
}
