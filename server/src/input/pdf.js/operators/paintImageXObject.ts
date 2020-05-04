
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
import { convertImgDataToPng } from './helper';

/**
 * info to return image data
 */
export default {
  key: 'paintImageXObject',
  value: (objectId: string) => {
    logger.debug(`==> paintImageXObject(${objectId})`);
    const { extractImages, loadedAssets: { images } } = OperationState.state;

    const imgData = images[objectId];
    if (!extractImages) {
      return null;
    }
    if (!imgData) {
      logger.warn(`Image ${objectId} was not previously loaded`);
      return null;
    }

    const { height, width } = imgData;
    const imageData = convertImgDataToPng(imgData, false);

    return {
      type: 'image',
      data: {
        imageData,
        objectId,
        height,
        width,
        transform: OperationState.state.transformMatrix,
      },
    };
  },
};
