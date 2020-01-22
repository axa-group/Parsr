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
import { TableOfContentsItem } from './TableOfContentsItem';

export class TableOfContents extends Element {

  private _items: TableOfContentsItem[] = [];
  private _content: Element[] = [];

  public get content(): Element[] {
    return this._content;
  }
  public set content(value: Element[]) {
    this._content = value;
  }

  public get items(): TableOfContentsItem[] {
    return this._items;
  }

  public set items(items: TableOfContentsItem[]) {
    this._items = items;
  }

  public toHTML() {
    return this.content.map(c => c.toHTML()).join('<br>');
  }
  public toMarkdown() {
    return this.content.map(c => c.toMarkdown()).join('\n');
  }
  public toString() {
    return this.content.map(c => c.toString()).join('\n');
  }
}
