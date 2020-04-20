
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

/**
 * this operator contains data to draw shapes into the page
 * for now we don't render those shapes but we need to keep track of the (x,y) state coordinates
 */
export default {
  key: 'constructPath',
  value: (ops: number[], args: any[]) => {
    logger.debug(`==> constructPath(${ops}, ${args})`);
    let x = OperationState.state.current.x;
    let y = OperationState.state.current.y;

    for (let i = 0, j = 0, ii = ops.length; i < ii; i++) {
      switch (ops[i] || 0) {
        case 19: // rectangle
          x = args[j++];
          y = args[j++];
          break;

        case 13: // moveTo
          x = args[j++];
          y = args[j++];
          break;

        case 14: // lineTo
          x = args[j++];
          y = args[j++];
          break;

        case 15: // curveTo
          x = args[j + 4];
          y = args[j + 5];
          j += 6;
          break;

        case 16: // curveTo2
          x = args[j + 2];
          y = args[j + 3];
          j += 4;
          break;

        case 17: // curveTo3
          x = args[j + 2];
          y = args[j + 3];
          j += 4;
          break;
      }
    }

    OperationState.state.current.x = x;
    OperationState.state.current.y = y;
  },
};
