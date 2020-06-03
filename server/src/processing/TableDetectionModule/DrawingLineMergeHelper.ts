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

import { Drawing } from './../../types/DocumentRepresentation';
import { SvgLine } from '../../types/DocumentRepresentation/SvgLine';

const TOLERANCE = 4;

export default (d: Drawing): Drawing => {

  const hControlLine = new SvgLine(null, 1, d.left, d.top, d.right, d.top);
  const newHLines = groupAndMerge((d.content as SvgLine[]).filter(l => l.isHorizontal()), hControlLine, d.bottom);

  const vControlLine = new SvgLine(null, 1, d.left, d.top, d.left, d.bottom);
  const newVLines = groupAndMerge((d.content as SvgLine[]).filter(l => l.isVertical()), vControlLine, d.right);

  const otherLines = (d.content as SvgLine[]).filter(l => !l.isHorizontal() && !l.isVertical());
  d.content = [...newHLines, ...newVLines, ...otherLines];
  return d;
};

function groupAndMerge(lines: SvgLine[], controlLine: SvgLine, maxValue: number): SvgLine[] {
  const type = controlLine.isVertical() ? 'v' : 'h';

  const mergedLines = [];
  while ((type === 'h' ? controlLine.toY : controlLine.toX) <= maxValue) {
    const mergeLineGroup = lines.filter(controlLine.isOnTop, controlLine);
    let newLines = mergeLineGroup;
    let length;

    /* each iteration, the reduce function is applied to newLines array,
      resulting on a new array that could be reduced again. 
      This do-while reduces the array until it starts giving the same result,
      meaning all lines in the array are disconnected and cannot be merged.
     */
    do {
      length = newLines.length;
      newLines = newLines.reduce(mergeLines, []);
    } while (newLines.length < length);

    mergedLines.push(...newLines.filter(l => {
      return !mergedLines.map(l => l.id).includes(l.id) &&
        mergedLines.every(hLine => !linesAreConnected(hLine, l));
    }));

    controlLine.move(type === 'h' ? 0 : 1, type === 'h' ? 1 : 0);
  }

  return mergedLines;
}

function linesAreConnected(l1: SvgLine, l2: SvgLine): boolean {

  if (l1.isVertical() && l2.isVertical()) {
    const maxY = Math.max(l1.fromY, l1.toY, l2.fromY, l2.toY);
    const minY = Math.min(l1.fromY, l1.toY, l2.fromY, l2.toY);
    const maxX = Math.max(l1.fromX, l1.toX, l2.fromX, l2.toX);
    const minX = Math.min(l1.fromX, l1.toX, l2.fromX, l2.toX);
    const l1H = Math.abs(l1.fromY - l1.toY);
    const l2H = Math.abs(l2.fromY - l2.toY);
    return maxY - minY <= l1H + l2H + TOLERANCE &&
      maxX - minX <= TOLERANCE;
  } else if (l1.isHorizontal() && l2.isHorizontal()) {
    const maxY = Math.max(l1.fromY, l1.toY, l2.fromY, l2.toY);
    const minY = Math.min(l1.fromY, l1.toY, l2.fromY, l2.toY);
    const maxX = Math.max(l1.fromX, l1.toX, l2.fromX, l2.toX);
    const minX = Math.min(l1.fromX, l1.toX, l2.fromX, l2.toX);
    const l1W = Math.abs(l1.fromX - l1.toX);
    const l2W = Math.abs(l2.fromX - l2.toX);
    return maxX - minX <= l1W + l2W + TOLERANCE &&
      maxY - minY <= TOLERANCE;
  }

  return false;
}

/**
 * reduce function used to merge lines together.
 * @param disconnectedLines array of disconnected lines. return value of the reduce function.
 * @param line current line of the reduce function
 */
function mergeLines(disconnectedLines: SvgLine[], line: SvgLine, _, _originalArray: SvgLine[]): SvgLine[] {
  let foundMatch = false;
  const ret = disconnectedLines.map(dl => {
    if (line.isVertical() && linesAreConnected(line, dl)) {
      const minY = Math.min(line.fromY, line.toY, dl.fromY, dl.toY);
      const maxY = Math.max(line.fromY, line.toY, dl.fromY, dl.toY);
      foundMatch = true;
      dl.fromY = minY;
      dl.toY = maxY;
    } else if (line.isHorizontal() && linesAreConnected(line, dl)) {
      const minX = Math.min(line.fromX, line.toX, dl.fromX, dl.toX);
      const maxX = Math.max(line.fromX, line.toX, dl.fromX, dl.toX);
      foundMatch = true;
      dl.fromX = minX;
      dl.toX = maxX;

    }
    return dl;
  });

  if (!foundMatch) {
    ret.push(line);
  }

  return ret;
}