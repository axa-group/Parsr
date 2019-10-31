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

import { BoundingBox, Document, Page, Text, Word } from '../../types/DocumentRepresentation';
import logger from '../../utils/Logger';
import { Module } from '../Module';
import * as defaultConfig from './defaultConfig.json';

interface Options {
  minOverlap?: number;
}

const defaultOptions = (defaultConfig as any) as Options;

/**
 * Blocks that have the same bounding boxes on a lot of pages
 * With a very similar content
 * With the same font
 * TODO Idea split large document every 100 pages or so.
 * Stability: Unstable
 * Detect items that are redundant on a certain amount of pages (i.e. 20% of every pages has the same element).
 * Also remove duplicated elements.
 */

export class RedundancyDetectionModule extends Module<Options> {
  public static moduleName = 'redundancy-detection';

  constructor(options?: Options) {
    super(options, defaultOptions);
  }

  public main(doc: Document): Document {
    doc.pages.forEach(page => {
      const groups: Text[][] = this.regroupTextsByLocation(page.getElementsOfType(Word));
      this.removeDuplicateElements(page, groups.filter(g => g.length !== 1));
    });

    return doc;
  }

  /**
   * Returns groups of texts which are the same and have a sufficient overlap to be
   * potential duplicates
   * @param texts a group of texts
   */
  private regroupTextsByLocation(texts: Text[]): Text[][] {
    const resultGroups: Text[][] = [];

    texts.forEach(element => {
      for (const group of resultGroups) {
        if (this.checkGroupOverlapWithNewElement(group, element)) {
          group.push(element);
          group.sort((a, b) => b.content.length - a.content.length);
          return;
        }
      }
      resultGroups.push([element]);
    });
    return resultGroups;
  }

  /**
   * Decides if a new element can be added to a group depending on weather if it has sufficient overlap,
   * and if it has the same text
   * @param group group of texts to be compared against
   * @param newElement the new element to be compared with the group
   */
  private checkGroupOverlapWithNewElement(group: Text[], newElement: Text): boolean {
    let decision: boolean = true;
    if (group.length === 0) {
      decision = false;
    } else {
      const refString: string =
        group[0].toString().length >= newElement.toString().length
          ? group[0].toString()
          : newElement.toString();
      const newString: string =
        group[0].toString().length < newElement.toString().length
          ? group[0].toString()
          : newElement.toString();
      if (!refString.includes(newString)) {
        decision = false;
      } else {
        for (const e of group) {
          const overlap: number = BoundingBox.getOverlap(e.box, newElement.box);
          if (!(overlap >= this.options.minOverlap)) {
            decision = false;
            break;
          }
        }
      }
    }
    return decision;
  }

  /**
   * Keeps one from a group of texts, removes the others.
   * TODO: promote candidates which will favor a better wordsToLine performance later on
   * @param page the page in question
   * @param groups groups of text from which only one is to be kept
   */
  private removeDuplicateElements(page: Page, groups: Text[][]) {
    groups.forEach(group => {
      logger.debug(
        `--> ${group.length} duplicate words with text ${group[0].toString()} found on page ${
          page.pageNumber
        }`,
      );
      group.slice(1, group.length).forEach(e => page.removeElement(e));
    });
  }
}
