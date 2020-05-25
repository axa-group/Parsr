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

import logger from '../../../utils/Logger';
import { OperationState } from '../OperationState';
import { pf } from './helper';

/**
 * sets the current textMatrix and restarts pointer and texts
 */
export default {
  key: 'setTextMatrix',
  value: (a: number, b: number, c: number, d: number, e: number, f: number) => {
    logger.debug(`==> setTextMatrix([${a},${b},${c},${d},${e},${f}])`);
    const { current } = OperationState.state;

    OperationState.state.current.textMatrix = [a, b, c, d, e, f];
    OperationState.state.current.textMatrixScale = Math.sqrt(a * a + b * b);
    OperationState.state.current.x = 0;
    OperationState.state.current.lineX = 0;
    OperationState.state.current.y = 0;
    OperationState.state.current.lineY = 0;
    OperationState.state.current.xcoords = [];

    OperationState.state.current.tspan = {
      textContent: '',
      fontFamily: current.fontFamily,
      fontSize: ''.concat(pf(current.fontSize), 'px'),
      y: pf(-current.y),
    };
  },
};
