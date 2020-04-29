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

import { Document, Drawing, Element, Page } from '../../types/DocumentRepresentation';
import * as utils from '../../utils';
import { HeaderFooterDetectionModule } from '../HeaderFooterDetectionModule/HeaderFooterDetectionModule';
import { Module } from '../Module';
import * as defaultConfig from './defaultConfig.json';

// TODO Handle rtl (right-to-left) languages
/**
 * Stability: Stable
 * Detect the reading order of the document.
 * Add a property order tag to every text block: `{ 'order': number }`
 */

interface Options {
  minColumnWidthInPagePercent?: number;
  minVerticalGapWidth?: number;
}

const defaultOptions = (defaultConfig as any) as Options;

export class ReadingOrderDetectionModule extends Module<Options> {
  public static moduleName = 'reading-order-detection';

  public static dependencies = [HeaderFooterDetectionModule];
  private order: number = 0;
  private currentPageMinColumnWidth: number = 5;

  constructor(options?: Options) {
    super(options, defaultOptions);
  }

  public main(doc: Document): Document {
    doc.pages = doc.pages.map((page: Page) => {
      // FIXME Hotfix because this algorithm bugs with floating point number
      const elements: Element[] = page.elements.filter(e => Element.hasBoundingBox(e) && !(e instanceof Drawing));
      const drawings: Element[] = page.elements.filter(e => Element.hasBoundingBox(e) && e instanceof Drawing);
      this.order = 0;
      // The min width is actually as a % of page width
      this.currentPageMinColumnWidth = Math.trunc(
        (this.options.minColumnWidthInPagePercent / 100) * page.width,
      );

      this.process(elements);

      elements.sort(utils.sortElementsByOrder);
      page.elements = [...elements, ...drawings];

      return page;
    });

    return doc;
  }

  private process(elements: Element[]): void {
    const verticalGroups = this.findVerticalGroups(elements);
    this.processVerticalGroups(verticalGroups, 0, 0);
  }

  private processVerticalGroups(
    groups: Element[][],
    columnLeftParent: number,
    columnRightParent: number,
  ): void {
    groups.forEach(group => {
      const horizontalGroups = this.findHorizontalGroups(group);
      const superHorizontalGroups = this.findHorizontalSuperGroups(horizontalGroups);

      let columnRight = this.calculateColumnRight(horizontalGroups);
      let columnLeft = this.calculateColumnLeft(horizontalGroups);
      if (horizontalGroups.length === 1 && columnRightParent) {
        columnRight = columnRightParent;
        columnLeft = columnLeftParent;
      }

      this.processHorizontalGroups(superHorizontalGroups, columnLeft, columnRight);
    });
  }

  // A "super group" is a set of horizontal groups with possible common vertical cuts
  private findHorizontalSuperGroups(groups: Element[][]): Element[][] {
    const superGroups: Element[][] = [];

    groups.forEach(group => {
      if (superGroups.length === 0) {
        superGroups.push(group);
      } else {
        const curSuperGroup: Element[] = superGroups[superGroups.length - 1];
        const commonVerticalGroups = this.findVerticalGroups([...curSuperGroup, ...group]);
        if (commonVerticalGroups.length > 1) {
          superGroups[superGroups.length - 1] = [...curSuperGroup, ...group];
        } else {
          superGroups.push(group);
        }
      }
    });

    return superGroups;
  }

  private processHorizontalGroups(
    groups: Element[][],
    columnLeft: number,
    columnRight: number,
  ): void {
    if (groups.length > 1) {
      groups.forEach(group => {
        const verticalGroups = this.findVerticalGroups(group);
        this.processVerticalGroups(verticalGroups, columnLeft, columnRight);
      });
    } else if (groups.length === 1) {
      this.processBlock(groups[0], columnLeft, columnRight);
    }
  }

  private processBlock(group: Element[], columnLeft: number, columnRight: number): void {
    group.sort((a, b) => {
      // Some line are not really flat. This fixes the uncertainty.
      if (Math.abs(a.top - b.top) > Math.min(a.height, b.height) / 2) {
        return a.top - b.top;
      } else {
        return a.left - b.left;
      }
    });

    group.forEach(element => {
      element.properties.order = this.order++;
      element.properties.cr = Math.trunc(columnRight * 100) / 100;
      element.properties.cl = Math.trunc(columnLeft * 100) / 100;
    });
  }

  private findHorizontalGroups(elements: Element[]): Element[][] {
    const elementsGroups: Element[][] = [];
    let elementsRest: Element[] = elements;

    let bottommost: number = 0;
    let startGroup: number = 0;

    while (elementsRest.filter(e => e.top >= bottommost).length > 0) {
      elementsRest = elementsRest.filter(e => e.top >= bottommost);
      const elementsTopSides: number[] = elementsRest.map(e => e.top);

      elementsRest.sort((a, b) => a.top - b.top);
      const sortedTopElements: Element[] = elementsRest;

      startGroup = Math.min(...elementsTopSides.filter(top => top > bottommost));

      let group: Element[] = [sortedTopElements[0]];
      bottommost = sortedTopElements[0].bottom;
      let previousBottommost: number;

      // Eat every included elements before a blank
      do {
        previousBottommost = bottommost;

        elementsRest.forEach(e => {
          if (e.top <= bottommost && e.top >= startGroup && !group.includes(e)) {
            group.push(e);
          }
        });

        bottommost = Math.max(...group.map(e => e.bottom));
      } while (previousBottommost !== bottommost);

      elementsGroups.push(group);
      group = [];
    }

    return elementsGroups;
  }

  private findVerticalGroups(elements: Element[]): Element[][] {
    const elementsGroups: Element[][] = [];
    let elementsRest: Element[] = elements;

    let rightmost: number = 0;
    let startGroup: number = 0;

    while (elementsRest.filter(e => e.left > rightmost).length > 0) {
      elementsRest = elementsRest.filter(e => e.left > rightmost);
      const elementsLeftSides: number[] = elementsRest.map(e => e.left);

      elementsRest.sort((a, b) => a.left - b.left);
      const sortedLeftElements: Element[] = elementsRest;

      startGroup = Math.min(...elementsLeftSides.filter(left => left > rightmost));

      let group: Element[] = [sortedLeftElements[0]];
      rightmost = sortedLeftElements[0].right;
      let previousRightmost: number;

      // Eat every included elements before a blank
      do {
        previousRightmost = rightmost;

        elementsRest.forEach(e => {
          if (
            e.left <= rightmost + this.options.minVerticalGapWidth &&
            e.left >= startGroup &&
            !group.includes(e)
          ) {
            group.push(e);
          }
        });

        rightmost = Math.max(...group.map(e => e.right));
      } while (previousRightmost !== rightmost);

      elementsGroups.push(group);
      group = [];
    }

    // Merge to right to small column

    for (let i = 0; i < elementsGroups.length; ++i) {
      // calculate group width
      const columnWidth = this.calculateGroupWidth(elementsGroups[i]);
      if (columnWidth < this.currentPageMinColumnWidth) {
        if (i < elementsGroups.length - 1) {
          // default Right merge
          elementsGroups[i + 1] = [...elementsGroups[i], ...elementsGroups[i + 1]];
          elementsGroups.splice(i--, 1);
        } else if (i > 0) {
          // if no rightMerge possible try left merge
          elementsGroups[i - 1] = [...elementsGroups[i - 1], ...elementsGroups[i]];
          elementsGroups.splice(i--, 1);
        }
      }
    }

    return elementsGroups;
  }

  private calculateGroupWidth(elements: Element[]) {
    let minX = elements[0].left;
    let maxX = elements[0].left + elements[0].width;

    for (let i = 1; i < elements.length; ++i) {
      if (elements[i].left < minX) {
        minX = elements[i].left;
      }
      if (elements[i].left + elements[i].width > maxX) {
        maxX = elements[i].left + elements[i].width;
      }
    }
    return maxX - minX;
  }

  private calculateColumnRight(groups: Element[][]) {
    let maxX = 0;

    for (const theseElements of groups) {
      for (const thisElement of theseElements) {
        if (
          thisElement.properties.isFooter ||
          thisElement.properties.isHeader ||
          thisElement.properties.isPageNumber ||
          thisElement.properties.isRedundant
        ) {
          continue;
        }
        if (thisElement.left + thisElement.width > maxX) {
          maxX = thisElement.left + thisElement.width;
        }
      }
    }
    return maxX;
  }

  private calculateColumnLeft(groups: Element[][]) {
    let minX = 100000000;

    for (const theseElements of groups) {
      for (const thisElement of theseElements) {
        if (
          thisElement.properties.isFooter ||
          thisElement.properties.isHeader ||
          thisElement.properties.isPageNumber ||
          thisElement.properties.isRedundant
        ) {
          continue;
        }
        if (thisElement.left < minX) {
          minX = thisElement.left;
        }
      }
    }
    return minX;
  }
}
