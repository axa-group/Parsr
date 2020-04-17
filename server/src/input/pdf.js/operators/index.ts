
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
import constructPath from './constructPath';
import dependency from './dependency';
import endText from './endText';
import moveText from './moveText';
import nextLine from './nextLine';
import restore from './restore';
import save from './save';
import setCharSpacing from './setCharSpacing';
import setFillRGBColor from './setFillRGBColor';
import setFont from './setFont';
import setHScale from './setHScale';
import setLeading from './setLeading';
import setLeadingMoveText from './setLeadingMoveText';
import setTextMatrix from './setTextMatrix';
import setTextRise from './setTextRise';
import setWordSpacing from './setWordSpacing';
import showText from './showText';
import transform from './transform';

const availableOperators = [
  beginText,
  constructPath,
  dependency,
  endText,
  moveText,
  nextLine,
  restore,
  save,
  setCharSpacing,
  setFillRGBColor,
  setFont,
  setHScale,
  setLeading,
  setLeadingMoveText,
  setTextMatrix,
  setTextRise,
  setWordSpacing,
  showText,
  transform,
];

export function isAvailable(operatorName: string): boolean {
  return availableOperators.map(op => op.key).includes(operatorName);
}

export function getOperator(operatorName: string): (...args) => any {
  return availableOperators.find(op => op.key === operatorName).value;
}
