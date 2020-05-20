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

import { writeFileSync } from 'fs';
import { join } from 'path';
import * as pdfjsLib from 'pdfjs-dist';
import { BoundingBox, Element, Font, Image, Word } from '../../types/DocumentRepresentation';
import { SvgLine } from '../../types/DocumentRepresentation/SvgLine';
import { SvgShape } from '../../types/DocumentRepresentation/SvgShape';
import { isPerimeterLine } from '../../utils';
import logger from '../../utils/Logger';
import { OperationState } from './OperationState';
import { matrixToCoords } from './operators/helper';
import { getOperator as fn, isAvailable } from './operators/index';

const Util = (pdfjsLib as any).Util;

type OpList = {
  fnArray: number[];
  argsArray: any[];
};

type ManagerOptions = {
  extractImages?: boolean;
  extractText?: boolean;
  extractShapes?: boolean;
  assetsFolder?: string;
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
  tspan: TextSpan;
  transform: {
    position: {
      x: number;
      y: number;
    };
    scale: {
      x: number;
      y: number;
    };
    matrix: string;
    matrixArray: number[];
  };
};

type ImageElement = {
  imageData: Uint8Array;
  objectId: string;
  height: number;
  width: number;
  transform: number[];
};

type PathElement = {
  transform: number[];
  d: string;
  fill?: string;
  clipRule?: string;
  fillRule?: string;
  fillOpacity?: number;
  stroke?: string;
  strokeOpacity?: number;
  strokeMiterlimit?: string;
  strokeLinecap?: string;
  strokeLinejoin?: string;
  strokeWidth?: number;
  strokeDasharray?: string;
  strokeDashoffset?: string;
};

export type OperatorResponse = {
  type: 'text' | 'image' | 'path';
  data: any;
};

/**
 * responsible for processing all page operators
 * and parsing them into an array of Elements for the document
 */
export class OperatorsManager {
  private opList: Promise<OpList>;
  private viewport;
  private commonObjects;
  private pageObjects;
  private notImplementedFunctions: string[] = [];
  private assetsFolder: string;

  // receives the page representation of pdfjs-dist
  constructor(page: any, options?: ManagerOptions) {
    this.opList = page.getOperatorList();
    this.viewport = page.getViewport({ scale: 1 });
    this.commonObjects = page.commonObjs;
    this.pageObjects = page.objs;
    this.assetsFolder = options && options.assetsFolder;

    OperationState.state.extractImages = options && options.extractImages;
    OperationState.state.extractText =
      !options || !{}.hasOwnProperty.call(options, 'extractText') || options.extractText;
    OperationState.state.extractShapes =
      !options || !{}.hasOwnProperty.call(options, 'extractShapes') || options.extractShapes;
  }

  public async processOperators(pageNumber: number): Promise<Element[]> {
    const texts: Word[] = [];
    const images: Image[] = [];
    const shapes: SvgShape[] = [];

    const opList = await this.opList;
    opList.fnArray.forEach((opNumber, i) => {
      const operatorName = Object.keys((pdfjsLib as any).OPS)[opNumber - 1];
      if (isAvailable(operatorName)) {
        const args = opList.argsArray[i];
        let fnReturn: OperatorResponse;
        if (args) {
          fnReturn = fn(operatorName)(...args, {
            commonObjects: this.commonObjects,
            pageObjects: this.pageObjects,
          });
        } else {
          fnReturn = fn(operatorName)({
            commonObjects: this.commonObjects,
            pageObjects: this.pageObjects,
          });
        }
        if (fnReturn && fnReturn.type === 'text') {
          this.parseTextElement(fnReturn.data, texts);
        }
        if (this.assetsFolder && fnReturn && fnReturn.type === 'image') {
          this.parseImageElement(fnReturn.data, images, pageNumber);
        }
        if (fnReturn && fnReturn.type === 'path') {
          this.parsePathElement(fnReturn.data, shapes);
        }
      } else {
        if (!this.notImplementedFunctions.includes(operatorName)) {
          this.notImplementedFunctions.push(operatorName);
          logger.debug(`WARN ==> ${operatorName} operator is not implemented`);
        }
      }
    });
    return [...texts, ...images, ...shapes].filter(e => e.box && e.box.width > 0);
  }

  private parseTextElement(textElem: TextElement, parsedElements: Word[]) {
    const pageTransform = Util.transform(
      this.viewport.transform,
      OperationState.state.transformMatrix,
    );
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

          const previousElement = parsedElements.pop();
          const prevRight = previousElement && parseFloat(previousElement.right.toFixed(3));
          const currLeft = parseFloat(currentWord.left.toFixed(3));

          if (
            previousElement &&
            Math.abs(prevRight - currLeft) * 10 <= previousElement.font.size &&
            Math.round(currentWord.top) === Math.round(previousElement.top)
          ) {
            parsedElements.push(previousElement.join(currentWord));
          } else if (previousElement !== undefined) {
            parsedElements.push(previousElement, currentWord);
          } else {
            parsedElements.push(currentWord);
          }
        }
      });
    }
  }

  private parseImageElement(imgElem: ImageElement, parsedElements: Image[], pageNumber: number) {
    const transform = matrixToCoords(Util.transform(this.viewport.transform, imgElem.transform));
    const { x, y } = transform.position;
    const { x: width, y: height } = transform.scale;

    const imageCount = parsedElements.filter(e => e instanceof Image).length.toString();
    const xObjId = pageNumber
      .toString()
      .concat('_', imageCount)
      .padStart(4, '0');
    const xObjExt = 'png';

    const imagePath = join(this.assetsFolder, `img-${xObjId}.${xObjExt}`);
    writeFileSync(imagePath, imgElem.imageData, 'binary');

    const image = new Image(
      new BoundingBox(x, y - Math.abs(height), Math.abs(width), Math.abs(height)),
      imagePath,
    );
    image.xObjId = xObjId;
    image.xObjExt = xObjExt;
    image.enabled = true;
    parsedElements.push(image);
  }

  private parsePathElement(pathElem: PathElement, parsedElements: SvgShape[]) {
    const transform = matrixToCoords(Util.transform(this.viewport.transform, pathElem.transform));
    const { x: scaleX, y: scaleY } = transform.scale;
    const { x: posX, y: posY } = transform.position;

    const color = pathElem.stroke || '#000000';
    const pathInstructions = pathElem.d.split(' ');
    let fromX = 0;
    let fromY = 0;
    let toX = 0;
    let toY = 0;
    const lines: SvgLine[] = [];
    const box = new BoundingBox(1, 1, 1, 1);

    let pathFirstX = posX + parseFloat(pathInstructions[1]) * scaleX;
    let pathFirstY = posY + parseFloat(pathInstructions[2]) * scaleY;

    for (let i = 0; i < pathInstructions.length; ) {
      const cmd = pathInstructions[i++];
      switch (cmd) {
        case 'M':
          fromX = posX + parseFloat(pathInstructions[i++]) * scaleX;
          fromY = posY + parseFloat(pathInstructions[i++]) * scaleY;
          break;
        case 'L':
          toX = posX + parseFloat(pathInstructions[i++]) * scaleX;
          toY = posY + parseFloat(pathInstructions[i++]) * scaleY;
          lines.push(new SvgLine(box, 1, fromX, fromY, toX, toY, color));
          fromX = toX;
          fromY = toY;
          break;
        case 'C':
          i += 4;
          toX = posX + parseFloat(pathInstructions[i++]) * scaleX;
          toY = posY + parseFloat(pathInstructions[i++]) * scaleY;
          lines.push(new SvgLine(box, 1, fromX, fromY, toX, toY, color));
          fromX = toX;
          fromY = toY;
          break;
        case 'Z':
          lines.push(new SvgLine(box, 1, fromX, fromY, pathFirstX, pathFirstY, color));
          fromX = pathFirstX;
          fromY = pathFirstY;
          if (pathInstructions[i + 2]) {
            pathFirstX = posX + parseFloat(pathInstructions[i + 1]) * scaleX;
            pathFirstY = posY + parseFloat(pathInstructions[i + 2]) * scaleY;
          }
          break;
        default:
          break;
      }
      if (lines.length > 0) {
        lines.forEach(line => {
          line.fillOpacity = {}.hasOwnProperty.call(pathElem, 'fillOpacity')
            ? pathElem.fillOpacity
            : 1;
          line.strokeOpacity = {}.hasOwnProperty.call(pathElem, 'strokeOpacity')
            ? pathElem.strokeOpacity
            : 1;
          line.thickness = {}.hasOwnProperty.call(pathElem, 'strokeWidth')
            ? pathElem.strokeWidth
            : 1;
        });
      }
    }

    // filter lines that follow the perimeter of the page
    const pageBox = new BoundingBox(0, 0, this.viewport.width, this.viewport.height);
    parsedElements.push(...lines.filter(l => !isPerimeterLine(l, pageBox)));
  }
}
