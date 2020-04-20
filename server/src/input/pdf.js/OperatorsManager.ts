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
import { BoundingBox, Element, Font, Word } from "../../types/DocumentRepresentation";
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

/**
 * responsible for processing all page operators
 * and parsing them into an array of Elements for the document
 */
export class OperatorsManager {
  private opList: Promise<OpList>;
  private viewport;
  private commonPageObjects;
  private notImplementedFunctions: string[] = [];

  // receives the page representation of pdfjs-dist
  constructor(page: any) {
    this.opList = page.getOperatorList();
    this.viewport = page.getViewport({ scale: 1 });
    this.commonPageObjects = page.commonObjs;
  }

  public async processOperators(): Promise<Element[]> {
    const elements: Element[] = [];
    const opList = await this.opList;
    opList.fnArray.forEach((opNumber, i) => {
      const operatorName = Object.keys((pdfjsLib as any).OPS)[opNumber - 1];
      if (isAvailable(operatorName)) {
        const args = opList.argsArray[i];
        let fnReturn: TextElement; // for now, the only possible return is a TextElement type
        if (args) {
          fnReturn = fn(operatorName)(...args, this.commonPageObjects);
        } else {
          fnReturn = fn(operatorName)(this.commonPageObjects);
        }
        if (fnReturn) {
          this.parseTextElement(fnReturn, elements);
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

  private parseTextElement(textElem: TextElement, parsedElements: Element[]) {
    const pageTransform = Util.transform(this.viewport.transform, OperationState.state.transformMatrix);
    const transform = matrixToCoords(Util.transform(pageTransform, textElem.transform.matrixArray));
    const scaleX = transform.scale.x;
    const scaleY = transform.scale.y;
    const posX = transform.position.x;
    const posY = transform.position.y;

    const { tspan } = textElem;
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

          const previousElement =
            parsedElements.length > 0 &&
            parsedElements[parsedElements.length - 1] &&
            parsedElements.pop();

          const prevRight = previousElement && parseFloat(previousElement.right.toFixed(3));
          const currLeft = parseFloat(currentWord.left.toFixed(3));

          if (
            previousElement &&
            previousElement instanceof Word &&
            Math.abs(prevRight - currLeft) * 10 <= previousElement.font.size &&
            Math.round(currentWord.top) === Math.round(previousElement.top)
          ) {
            parsedElements.push(previousElement.join(currentWord));
          } else if (parsedElements) {
            parsedElements.push(previousElement, currentWord);
          } else {
            parsedElements.push(currentWord);
          }
        }
      });
    }
  }
}
