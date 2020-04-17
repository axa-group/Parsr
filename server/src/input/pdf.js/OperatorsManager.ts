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

import * as pdfjsLib from 'pdfjs-dist';
import { BoundingBox, Font, Word } from "../../types/DocumentRepresentation";
import logger from "../../utils/Logger";
import { OperationState } from './OperationState';
import { matrixToCoords } from './operators/helper';
import { getOperator as fn, isAvailable } from './operators/index';

const Util = (pdfjsLib as any).Util;

type OpList = {
  fnArray: number[];
  argsArray: any[];
};

type TextSpan = {
  textContent: string;
  fontFamily: string;
  fontName: string;
  fontSize: string;
  fontStyle: string;
  fontWeight: string;
  fill: string;
  x: string;
  y: string;
};
type TextElement = {
  tspan: TextSpan,
  transform: {
    position: {
      x: number;
      y: number;
    },
    scale: {
      x: number;
      y: number;
    },
    matrix: string;
    matrixArray: number[];
  },
};

export class OperatorsManager {
  private opList: OpList;
  private viewport;
  private commonPageObjects;
  private notImplementedFunctions: string[] = [];

  // receives an OpList given by pdfjs-dist "page.getOperatorList()"
  constructor(operatorList: OpList, page: any) {
    this.opList = operatorList;
    this.viewport = page.getViewport({ scale: 1 });
    this.commonPageObjects = page.commonObjs;
  }

  public processOperators(): Word[] {
    const elements: Word[] = [];
    this.opList.fnArray.forEach((opNumber, i) => {
      const operatorName = Object.keys((pdfjsLib as any).OPS)[opNumber - 1];
      if (isAvailable(operatorName)) {
        const args = this.opList.argsArray[i];
        let textElement: TextElement;
        if (args) {
          textElement = fn(operatorName)(...args, this.commonPageObjects);
        } else {
          textElement = fn(operatorName)(this.commonPageObjects);
        }
        if (textElement) {
          this.parseTextElement(textElement, elements);
        }
      } else {
        if (!this.notImplementedFunctions.includes(operatorName)) {
          this.notImplementedFunctions.push(operatorName);
          logger.debug(`==> WARN: ${operatorName} operator is not implemented`);
        }
      }
    });
    return elements.filter(e => e.box && e.box.width > 0);
  }

  private parseTextElement(element: TextElement, parsedWords: Word[]) {
    const pageTransform = Util.transform(this.viewport.transform, OperationState.state.transformMatrix);
    const transform = matrixToCoords(Util.transform(pageTransform, element.transform.matrixArray));
    const scaleX = transform.scale.x;
    const scaleY = transform.scale.y;
    const posX = transform.position.x;
    const posY = transform.position.y;

    const { tspan } = element;
    if (tspan.x) {
      const xChars = tspan.x.split(' ').map(n => parseFloat(n));
      tspan.textContent.split('').forEach((char, currentX) => {
        if (char.trim() !== '') {
          const left = posX + xChars[currentX] * scaleX;
          const width = Math.abs((xChars[currentX + 1] - xChars[currentX]) * scaleX);
          const height = Math.abs(parseFloat(tspan.fontSize.replace('px', '')) * scaleY);
          const top = posY + parseFloat(tspan.y) * Math.abs(scaleY);

          const currentWord = new Word(
            new BoundingBox(left, top - height, width, height),
            char,
            new Font(tspan.fontName, height, {
              color: tspan.fill,
              isItalic: tspan.fontStyle === 'italic',
              weight: tspan.fontWeight,
              sizeUnit: 'px',
            }),
          );

          const previousWord = parsedWords.length > 0 && parsedWords.pop();
          const prevRight = previousWord && parseFloat(previousWord.right.toFixed(3));
          const currLeft = parseFloat(currentWord.left.toFixed(3));

          if (
            previousWord &&
            Math.abs(prevRight - currLeft) * 10 <= previousWord.font.size &&
            Math.round(currentWord.top) === Math.round(previousWord.top)
          ) {
            parsedWords.push(previousWord.join(currentWord));
          } else if (previousWord) {
            parsedWords.push(previousWord, currentWord);
          } else {
            parsedWords.push(currentWord);
          }
        }
      });
    }
  }
}
