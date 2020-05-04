
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

export default {
  key: 'endPath',
  value: () => {
    logger.debug(`==> endPath()`);
    const { current: { path }, pendingClip } = OperationState.state;

    // if (!pendingClip) {
    //   return null;
    // }

    if (!path) {
      OperationState.state.pendingClip = null;
      return null;
    }

    // const clipId = "clippath".concat(clipCount++);
    // const clipPath = this.svgFactory.createElement('svg:clipPath');
    // clipPath.setAttributeNS(null, 'id', clipId);
    // clipPath.setAttributeNS(null, 'transform', pm(this.transformMatrix));
    // const clipElement = current.element.cloneNode(true);

    if (pendingClip === 'evenodd') {
      path.clipRule = 'evenodd';
    } else {
      path.clipRule = 'nonzero';
    }

    OperationState.state.pendingClip = null;
    return {
      type: 'path',
      data: path,
    };
  },
};
