
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
import { OperationState } from './../OperationState';
import { pf } from './helper';

export default {
  key: 'moveText',
  value: (x: number, y: number) => {
    logger.debug(`==> moveText(${x},${y})`);
    const { current } = OperationState.state;
    OperationState.state.current.x = OperationState.state.current.lineX += x;
    OperationState.state.current.y = OperationState.state.current.lineY += y;
    OperationState.state.current.xcoords = [];
    OperationState.state.current.tspan = {
      textContent: '',
      fontFamily: current.fontFamily,
      fontSize: current.fontSize,
      y: pf(-current.y),
    };
  },
};
