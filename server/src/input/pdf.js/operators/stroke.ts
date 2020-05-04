
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
import endPath from './endPath';
import { pf } from './helper';

export default {
  key: 'stroke',
  value: () => {
    logger.debug(`==> stroke()`);
    const {
      path,
      strokeColor,
      strokeAlpha,
      miterLimit,
      lineCap,
      lineJoin,
      dashArray,
      lineWidth,
      dashPhase,
    } = OperationState.state.current;

    if (path) {
      path.stroke = strokeColor;
      path.strokeOpacity = strokeAlpha;
      path.strokeMiterlimit = pf(miterLimit);
      path.strokeLinecap = lineCap;
      path.strokeLinejoin = lineJoin;
      path.strokeWidth = pf(lineWidth) + 'px';
      path.strokeDasharray = dashArray.map(pf).join(' ');
      path.strokeDashoffset = pf(dashPhase) + 'px';
      return endPath.value();
    }
    return null;

  },
};
