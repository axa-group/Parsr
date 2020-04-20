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
import { FONT_IDENTITY_MATRIX, pf } from './helper';

/**
 * sets state's font object (raw font representation) and its properties like weight and size
 */
export default {
  key: 'setFont',
  value: (fontRefName: string, size: number) => {
    logger.debug(`==> setFont(${fontRefName}, ${size})`);
    const { current } = OperationState.state;

    const fontObj = OperationState.state.loadedFonts[fontRefName];
    if (fontObj) {
      OperationState.state.current.font = fontObj;
      OperationState.state.current.fontMatrix = fontObj.fontMatrix ? fontObj.fontMatrix : FONT_IDENTITY_MATRIX;

      if (size < 0) {
        size = -size;
        current.fontDirection = -1;
      } else {
        current.fontDirection = 1;
      }
      const bold =
        fontObj.bold ?
          'bold' :
          ['bold', 'demi']
            .some(key => fontObj.name.toLowerCase().includes(key)) ?
            'bold' :
            'normal';
      const italic = fontObj.italic ? 'italic' : fontObj.name.toLowerCase().includes('italic') ? 'italic' : 'normal';

      OperationState.state.current.fontSize = size;
      OperationState.state.current.fontFamily = fontObj.loadedName;
      OperationState.state.current.fontWeight = bold;
      OperationState.state.current.fontStyle = italic;
      OperationState.state.current.tspan = {
        textContent: '',
        y: pf(-current.y),
      };
      OperationState.state.current.xcoords = [];
    } else {
      logger.debug(`WARN => Font ${fontRefName} was not previously loaded. Skipping...`);
    }
  },
};
