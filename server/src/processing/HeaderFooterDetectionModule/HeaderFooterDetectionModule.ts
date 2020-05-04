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

import { BoundingBox, Document, Element } from '../../types/DocumentRepresentation';
import * as utils from '../../utils';
import logger from '../../utils/Logger';
import { Module } from '../Module';
import * as defaultConfig from './defaultConfig.json';

/**
 * Stability: Experimental
 * Characterize marginals (header and footer) in a document. The word marginals comes
 * from https://english.stackexchange.com/a/25105
 */
interface Options {
  ignorePages?: number[];
  maxMarginPercentage?: number;
}

const defaultOptions = (defaultConfig as any) as Options;

export class HeaderFooterDetectionModule extends Module<Options> {
  public static moduleName = 'header-footer-detection';
  public static dependencies = [];

  constructor(options?: Options) {
    super(options, defaultOptions);
  }

  public main(doc: Document): Document {
    return doc;
  }
}
