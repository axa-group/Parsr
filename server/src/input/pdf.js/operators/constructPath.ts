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
 * this operator contains data to draw shapes into the page
 */
export default {
  key: 'constructPath',
  value: (ops: number[], args: any[]) => {
    logger.debug(`==> constructPath(${JSON.stringify(ops)}, ${JSON.stringify(args)})`);
    let { x, y, path } = OperationState.state.current;
    const { transformMatrix } = OperationState.state;

    const d = [];
    for (let i = 0, j = 0, ii = ops.length; i < ii; i++) {
      switch (ops[i] || 0) {
        case 13: // moveTo
          x = args[j++];
          y = args[j++];
          d.push('M', pf(x), pf(y));
          break;

        case 14: // lineTo
          x = args[j++];
          y = args[j++];
          d.push('L', pf(x), pf(y));
          break;

        case 15: // curveTo
          x = args[j + 4];
          y = args[j + 5];
          d.push('C', pf(args[j]), pf(args[j + 1]), pf(args[j + 2]), pf(args[j + 3]), pf(x), pf(y));
          j += 6;
          break;

        case 16: // curveTo2
          x = args[j + 2];
          y = args[j + 3];
          d.push('C', pf(x), pf(y), pf(args[j]), pf(args[j + 1]), pf(args[j + 2]), pf(args[j + 3]));

          j += 4;
          break;

        case 17: // curveTo3
          x = args[j + 2];
          y = args[j + 3];
          d.push('C', pf(args[j]), pf(args[j + 1]), pf(x), pf(y), pf(x), pf(y));

          j += 4;
          break;

        case 18: // closePath:
          d.push('Z');
          break;

        case 19: // rectangle
          x = args[j++];
          y = args[j++];
          d.push(
            'M',
            pf(x),
            pf(y),
            'L',
            pf(x + args[j++]),
            pf(y),
            'L',
            pf(x + args[j++]),
            pf(y + args[j++]),
            'L',
            pf(x),
            pf(y + args[j++]),
            'Z',
          );
          break;
      }
    }

    let dStr = d.join(' ');
    if (path && ops.length > 0 && ops[0] !== 13 && ops[0] !== 19) {
      dStr = path.d + d;
    } else {
      path = {
        transform: transformMatrix,
      };
    }

    path.d = dStr;
    path.fill = 'none';

    OperationState.state.current.path = path;
    OperationState.state.current.x = x;
    OperationState.state.current.y = y;
  },
};
