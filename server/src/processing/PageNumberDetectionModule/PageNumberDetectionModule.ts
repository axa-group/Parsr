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

import {
  BoundingBox,
  Document,
  Element,
  Paragraph,
  Text,
} from '../../types/DocumentRepresentation';
import * as utils from '../../utils';
import logger from '../../utils/Logger';
import { Module } from '../Module';
import * as defaultConfig from './defaultConfig.json';

interface Options {
  ignorePages?: number[];
  maxMarginPercentage?: number;
}

const defaultOptions = (defaultConfig as any) as Options;

export class PageNumberDetectionModule extends Module<Options> {
  public static moduleName = 'page-number-detection';
  public static dependencies = [];

  constructor(options?: Options) {
    super(options, defaultOptions);
  }

  public main(doc: Document): Document {
    const alreadyExist: boolean =
      doc.pages
        .map(p => {
          return p.elements.filter(e => e.properties.isHeader || e.properties.isFooter).length;
        })
        .reduce((a, b) => a + b, 0) > 0;

    if (doc.pages.length === 1) {
      logger.warn(
        'Not computing marginals (headers and footers)' +
          'the document only has 1 page (not enough data).',
      );
      return doc;
    } else if (this.options.maxMarginPercentage === undefined) {
      logger.info(
        'Not computing marginals (headers and footers); maxMarginPercentage setting not found in the configuration.',
      );
      return doc;
    } else if (alreadyExist) {
      logger.warn(
        'Not computing marginals (headers and footers): header and footer data already exists.',
      );
      return doc;
    }
    logger.info(
      'Detecting marginals (headers and footers) with maxMarginPercentage:',
      this.options.maxMarginPercentage,
      '...',
    );

    let occupancyAcrossHeight: number[] = [];
    let occupancyAcrossWidth: number[] = [];

    function boolToInt(p) {
      if (p) {
        return 1;
      } else {
        return 0;
      }
    }

    doc.pages
      .filter(p => !this.options.ignorePages.includes(p))
      .forEach(page => {
        const h: number[] = page.horizontalOccupancy.map(boolToInt);
        occupancyAcrossHeight = utils.addVectors(occupancyAcrossHeight, h);
        const v: number[] = page.verticalOccupancy.map(boolToInt);
        occupancyAcrossWidth = utils.addVectors(occupancyAcrossWidth, v);
      });

    // UNCOMMENT THESE TO EXPORT OCCUPANCIES INTO EXTERNAL CSV FILES
    // writeFileSync("horizontal.csv", occupancyAcrossWidth.join(";"), {encoding: 'utf-8'})
    // writeFileSync("vertical.csv", occupancyAcrossHeight.join(";"), {encoding: 'utf-8'})

    const heightZeros: number[] = utils
      .findPositionsInArray(occupancyAcrossHeight, 0)
      .sort((a, b) => {
        return a - b;
      });
    const widthZeros: number[] = utils
      .findPositionsInArray(occupancyAcrossWidth, 0)
      .sort((a, b) => {
        return a - b;
      });

    const maxT: number = Math.floor(
      0 + (this.options.maxMarginPercentage * occupancyAcrossHeight.length) / 100,
    );
    doc.margins.top = heightZeros
      .filter(value => value < maxT)
      .sort((a, b) => {
        return b - a;
      })[0];
    const maxB: number = Math.floor(
      occupancyAcrossHeight.length -
        (this.options.maxMarginPercentage * occupancyAcrossHeight.length) / 100,
    );
    doc.margins.bottom = heightZeros
      .filter(value => value > maxB)
      .sort((a, b) => {
        return a - b;
      })[0];
    const maxL: number = Math.floor(
      0 + (this.options.maxMarginPercentage * occupancyAcrossWidth.length) / 100,
    );
    doc.margins.left = widthZeros
      .filter(value => value < maxL)
      .sort((a, b) => {
        return b - a;
      })[0];
    const maxR: number = Math.floor(
      occupancyAcrossWidth.length -
        (this.options.maxMarginPercentage * occupancyAcrossWidth.length) / 100,
    );
    doc.margins.right = widthZeros
      .filter(value => value > maxR)
      .sort((a, b) => {
        return a - b;
      })[0];

    logger.info(
      `Document margins for maxMarginPercentage ${this.options.maxMarginPercentage}: ` +
        `top: ${doc.margins.top}, bottom: ${doc.margins.bottom}, ` +
        `left: ${doc.margins.left}, right: ${doc.margins.right}`,
    );

    doc.pages.forEach(page => {
      const headerElements: Element[] = page.getElementsSubset(
        new BoundingBox(0, 0, page.width, doc.margins.top),
      );

      const footerElements: Element[] = page.getElementsSubset(
        new BoundingBox(0, doc.margins.bottom, page.width, page.height - doc.margins.bottom),
      );

      for (const element of footerElements) {
        element.properties.isFooter = true;
        if (element instanceof Paragraph && isPageNumber(element)) {
          element.properties.isPageNumber = true;
        }
      }

      for (const element of headerElements) {
        element.properties.isHeader = true;
        if (element instanceof Paragraph && isPageNumber(element)) {
          element.properties.isPageNumber = true;
        }
      }
    });
    logger.debug('Done with marginals detection.');
    return doc;

    /**
     * Checks if a text is a page number using a regexp matching.
     * @param text The text entity in question
     */
    function isPageNumber(text: Text): boolean {
      const match = text.toString().match(utils.getPageRegex());
      let pageNumber: string;
      if (!match) {
        return false;
      }

      for (let i = 1; i < match.length; i++) {
        if (match[i]) {
          pageNumber = match[i];
        }
      }

      return pageNumber && pageNumber !== '';
    }
  }
}
