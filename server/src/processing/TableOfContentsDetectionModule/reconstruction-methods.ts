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

import { BoundingBox, TableOfContentsItem } from './../../types/DocumentRepresentation';

export function reconstructTOCItem(text: string, bbox: BoundingBox, pageKeywords: string[]): TableOfContentsItem {
  return Object.values(reconstructionMethods)
    .map(method => method(text, bbox, pageKeywords))
    .filter(r => !!r)[0];
}

const reconstructionMethods = {
  // Page <page number> <description>
  method_1: (text: string, bbox: BoundingBox, pageKeywords: string[]): TableOfContentsItem => {
    const regexp = `^(?:${pageKeywords.join('|')}) (\\d+) (.+)`;
    const matches = new RegExp(regexp, 'gi').exec(text);
    if (matches) {
      const [, pageNum, description] = matches;
      return new TableOfContentsItem(
        bbox,
        description ? description.trim() : '',
        pageNum,
      );
    }
    return null;
  },
  // <section?> <description> <page as roman numbers?>
  method_2: (text: string, bbox: BoundingBox): TableOfContentsItem => {
    const matches = new RegExp(/^([\d\.]*)(.*) ([ivxlcdm]*)$/i).exec(text);
    if (matches) {
      const [, section, description, pageNum] = matches;
      return new TableOfContentsItem(
        bbox,
        [section, description].filter(c => !!c).map(c => c.trim()).join(' '),
        pageNum,
        // TOC item level is based on the amount of dots in the section number
        section ? (section.match(/\./g) || []).length : 0,
      );
    }
    return null;
  },
  // <section?> <description> <page number?>
  method_3: (text: string, bbox: BoundingBox): TableOfContentsItem => {
    const matches = new RegExp(/^([\d\.]*)(.*) ([\d\-]*)$/).exec(text);
    if (matches) {
      const [, section, description, pageNum] = matches;
      return new TableOfContentsItem(
        bbox,
        [section, description].filter(c => !!c).map(c => c.trim()).join(' '),
        pageNum,
        // TOC item level is based on the amount of dots in the section number
        section ? (section.match(/\./g) || []).length : 0,
      );
    }
    return null;
  },

  // if every other method fails, return a tocItem with full text as description
  default_method: (text: string, bbox: BoundingBox): TableOfContentsItem => {
    return new TableOfContentsItem(bbox, text);
  },
};
