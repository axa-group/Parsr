
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
import setDash from './setDash';
import setFillAlpha from './setFillAlpha';
import setFont from './setFont';
import setLineCap from './setLineCap';
import setLineJoin from './setLineJoin';
import setLineWidth from './setLineWidth';
import setMiterLimit from './setMiterLimit';
import setStrokeAlpha from './setStrokeAlpha';

export default {
  key: 'setGState',
  value: (states: any[][]) => {
    states.forEach(state => {
      logger.debug(`==> setGState(${JSON.stringify(state)})`);
      const [key, value] = state;
      switch (key) {
        case 'LW':
          setLineWidth.value(value);
          break;

        case 'LC':
          setLineCap.value(value);
          break;

        case 'LJ':
          setLineJoin.value(value);
          break;

        case 'ML':
          setMiterLimit.value(value);
          break;

        case 'D':
          setDash.value(value[0], value[1]);
          break;

        case 'Font':
          setFont.value(value[0], value[1]);
          break;

        case 'CA':
          setStrokeAlpha.value(value);
          break;

        case 'ca':
          setFillAlpha.value(value);
          break;

        case 'RI':
        case 'BM':
        case 'FL':
          break;
        default:
          logger.debug("WARN ==> Unimplemented graphic state operator ".concat(key));
          break;
      }
    });
  },
};
