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
import { matrixToCoords, pf } from './helper';

/**
 * this operator has info to create a TextElement type (defined in OperatorsManager)
 * and returns it to be parsed into doc Elements
 */
export default {
  key: 'showText',
  value: (glyphs: any[]) => {
    logger.debug(`==> showText(${glyphs.map(g => g.unicode).join('')})`);
    const { current, extractText } = OperationState.state;
    const { font, fontSize, charSpacing, wordSpacing, fontDirection, fontMatrix } = current;

    OperationState.state.current.tspan = {
      textContent: '',
    };

    OperationState.state.current.xcoords = [];

    if (!extractText) {
      return null;
    }

    if (fontSize === 0) {
      return null;
    }

    const textHScale = OperationState.state.current.textHScale * fontDirection;
    const widthAdvanceScale = fontSize * fontMatrix[0];

    let x = 0;
    for (const glyph of glyphs) {
      if (glyph === null) {
        x += fontDirection * wordSpacing;
        continue;
      } else if (typeof glyph === 'number') {
        x += -glyph * fontSize * 0.001;
        continue;
      }

      const width = glyph.width;
      const character = glyph.unicode;
      const spacing = (glyph.isSpace ? wordSpacing : 0) + charSpacing;
      const charWidth = width * widthAdvanceScale + spacing * fontDirection;

      // there are some cases where the glyph is a mix of more than 1 character
      const chars = character.split('');
      chars.forEach(char => {
        current.xcoords.push(current.x + x * textHScale);
        current.tspan.textContent += char;
        x += charWidth / chars.length;
      });
    }

    current.xcoords.push(current.x + x * textHScale);
    if (font.vertical) {
      current.y -= x * textHScale;
    } else {
      current.x += x * textHScale;
    }

    current.tspan.x = current.xcoords.map(pf).join(' ');
    current.tspan.y = pf(-current.y);
    current.tspan.fontFamily = current.fontFamily;
    current.tspan.fontName = (current.font && current.font.name) || current.fontFamily;
    current.tspan.fontSize = ''.concat(pf(current.fontSize), 'px');
    current.tspan.fontStyle = current.fontStyle;
    current.tspan.fontWeight = current.fontWeight;
    current.tspan.fill = current.fillColor;

    if (current.textRise !== 0) {
      current.textMatrix = current.textMatrix.slice();
      current.textMatrix[5] += current.textRise;
    }

    return {
      type: 'text',
      data: {
        transform: matrixToCoords(current.textMatrix),
        tspan: current.tspan,
      },
    };
  },
};
