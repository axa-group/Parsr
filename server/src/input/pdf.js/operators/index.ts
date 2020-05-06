
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

import beginText from './beginText';
import clip from './clip';
import constructPath from './constructPath';
import dependency from './dependency';
import endPath from './endPath';
import eoFill from './eoFill';
import fill from './fill';
import moveText from './moveText';
import nextLine from './nextLine';
import paintImageXObject from './paintImageXObject';
import restore from './restore';
import save from './save';
import setCharSpacing from './setCharSpacing';
import setDash from './setDash';
import setFillAlpha from './setFillAlpha';
import setFillRGBColor from './setFillRGBColor';
import setFont from './setFont';
import setGState from './setGState';
import setHScale from './setHScale';
import setLeading from './setLeading';
import setLeadingMoveText from './setLeadingMoveText';
import setLineCap from './setLineCap';
import setLineJoin from './setLineJoin';
import setLineWidth from './setLineWidth';
import setMiterLimit from './setMiterLimit';
import setStrokeAlpha from "./setStrokeAlpha";
import setStrokeRGBColor from "./setStrokeRGBColor";
import setTextMatrix from './setTextMatrix';
import setTextRise from './setTextRise';
import setWordSpacing from './setWordSpacing';
import showText from './showText';
import stroke from './stroke';
import transform from './transform';

const availableOperators = [
  beginText,
  clip,
  constructPath,
  dependency,
  endPath,
  eoFill,
  fill,
  moveText,
  nextLine,
  paintImageXObject,
  restore,
  save,
  setCharSpacing,
  setDash,
  setFillAlpha,
  setFillRGBColor,
  setFont,
  setGState,
  setHScale,
  setLeading,
  setLeadingMoveText,
  setLineCap,
  setLineJoin,
  setLineWidth,
  setMiterLimit,
  setStrokeAlpha,
  setStrokeRGBColor,
  setTextMatrix,
  setTextRise,
  setWordSpacing,
  showText,
  stroke,
  transform,
];

export function isAvailable(operatorName: string): boolean {
  return availableOperators.map(op => op.key).includes(operatorName);
}

export function getOperator(operatorName: string): (...args) => any {
  return availableOperators.find(op => op.key === operatorName).value;
}
