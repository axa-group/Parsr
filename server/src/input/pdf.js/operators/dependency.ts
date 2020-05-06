
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
 * this operator loads the document's assets like fonts and images
 */
export default {
  key: 'dependency',
  value: (depId: string, { commonObjects, pageObjects }) => {
    logger.debug(`==> dependency(${depId})`);
    const { extractImages } = OperationState.state;
    // g_* assets are font references
    if (depId.startsWith('g_') && commonObjects.has(depId)) {
      OperationState.state.loadedAssets.fonts[depId] = commonObjects.get(depId);
    }

    if (extractImages && depId.startsWith('img_') && pageObjects.has(depId)) {
      OperationState.state.loadedAssets.images[depId] = pageObjects.get(depId);
    }
  },
};
