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

import * as pdfjsLib from 'pdfjs-dist';
import { Element } from "../../types/DocumentRepresentation";
import logger from "../../utils/Logger";
import { getOperator as fn, isAvailable } from './operators/index';

type OpList = {
  fnArray: number[];
  argsArray: any[];
};

export class OperatorsManager {
  private opList: OpList;

  // receives an OpList given by pdfjs-dist "page.getOperatorList()"
  constructor(operatorList: OpList) {
    this.opList = operatorList;
  }

  public processOperators(): Element[] {
    this.opList.fnArray.forEach((opNumber, i) => {
      const operatorName = Object.keys((pdfjsLib as any).OPS)[opNumber - 1];
      if (isAvailable(operatorName)) {
        const args = this.opList.argsArray[i];
        logger.debug(`${operatorName}(${args.join(', ')})`);
        fn(operatorName)(args);
      } else {
        logger.debug(`operator ${operatorName} is not available. Skipping...`);
      }
    });
    return [];
  }
}
