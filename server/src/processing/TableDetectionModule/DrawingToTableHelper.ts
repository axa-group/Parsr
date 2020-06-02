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

import { Drawing, BoundingBox } from './../../types/DocumentRepresentation';
import { JsonTable, JsonTableCell } from './TableDetectionModule';
import { SvgLine } from '../../types/DocumentRepresentation/SvgLine';

// when calculating rows, the minimum separation between lines for them to be considered as a row/col
const MIN_ROW_HEIGHT = 8;
const MIN_COL_WIDTH = 10;

export default (drawing: Drawing, pageHeight: number): JsonTable => {
  const cols = getColsData(drawing);
  const rows = getRowsData(drawing, pageHeight);

  const height = getTableHeight(rows);
  const width = getTableWidth(cols);

  return {
    location: {
      x: cols[0][0],
      y: rows[0][0],
    },
    size: {
      height,
      width,
    },
    cols,
    rows,
    cells: getTableCells(drawing, cols, rows, pageHeight),
  };
};

function getTableHeight(rows: number[][]): number {
  return getCellHeight(rows, 0, rows.length);
}

function getTableWidth(cols: number[][]): number {
  return getCellWidth(cols, 0, cols.length);
}

function getColsData(d: Drawing): number[][] {
  const vBoxLines = d.box.toSvgLines().filter(l => l instanceof SvgLine && l.isVertical());
  const xPositions = d.content
  .concat(vBoxLines)
    .filter(c => c instanceof SvgLine && c.isVertical())
    .map((l: SvgLine) => l.fromX)
    .sort((a, b) => a - b)
    .reduce(byMinimum(MIN_COL_WIDTH), []);

  const cols = [];
  for (let i = 0; i < xPositions.length - 1; i++) {
    cols.push([xPositions[i], xPositions[i + 1]]);
  }

  return cols;
}

function getRowsData(d: Drawing, pageHeight: number): number[][] {
  const yPositions = d.content
    .filter(c => c instanceof SvgLine && c.isHorizontal())
    .map((l: SvgLine) => pageHeight - l.fromY)
    .sort((a, b) => b - a)
    .reduce(byMinimum(MIN_ROW_HEIGHT), []);

  const rows = [];
  for (let i = 0; i < yPositions.length - 1; i++) {
    rows.push([yPositions[i], yPositions[i + 1]]);
  }

  return rows;
}

// reduce function used to detect when 2 lines are too close to be considered a row/column
function byMinimum(min: number) {
  return (accumulator, value, index, array) => {
    const nextValue = array[index + 1];
    if (!nextValue || (nextValue && Math.abs(value - nextValue) > min)) {
      return accumulator.concat(value);
    }
    return accumulator;
  };
}

function getTableCells(d: Drawing, cols: number[][], rows: number[][], pageHeight: number): JsonTableCell[][] {
  const tableCells = [];
  rows.forEach((row, rowIndex) => {
    const tableRow: JsonTableCell[] = [];
    cols.forEach((col, colIndex) => {
      const box = getCellBox(row, col);
      const colSpan = getCellColspan(cols, colIndex, box.height, pageHeight - box.bottom, d);
      const rowSpan = getCellRowspan(rows, rowIndex, box.left, box.width, pageHeight, d);
      const width = getCellWidth(cols, colIndex, colSpan);
      const height = getCellHeight(rows, rowIndex, rowSpan);
      tableRow.push({
        colSpan,
        rowSpan,
        location: {
          x: box.left,
          y: box.bottom,
        },
        size: {
          height,
          width,
        },
      });
    });
    tableCells.push(tableRow);
  });

  return tableCells;
}

function getCellBox(row: number[], col: number[]): BoundingBox {
  const [minX, maxX] = col;
  const [maxY, minY] = row;
  return new BoundingBox(minX, minY, maxX - minX, maxY - minY);
}

function getCellColspan(cols: number[][], colIndex: number, rowHeight: number, rowTop: number, drawing: Drawing): number {
  // only check span if the current cell is not in the last column
  if (cols[colIndex + 1]) {
    const xPosition = cols[colIndex][1];
    // a helper horizontal line of width 2 centered in [xPosition, rowTop + rowHeight / 2]
    const intersectionLine = new SvgLine(null, 1, xPosition - 1, rowTop + rowHeight / 2, xPosition + 1, rowTop + rowHeight / 2);
    const hvLines: SvgLine[] = (drawing.content as SvgLine[]).filter(c => c.isHorizontal() || c.isVertical());
    // if there no visible intersection, the current cell is spanning to the right.
    // Accumulate and recall function for the cell in next column.

    const lineIntersectsDrawing = hvLines.some(l => l.intersects(intersectionLine));
    if (!lineIntersectsDrawing) {
      return 1 + getCellColspan(cols, colIndex + 1, rowHeight, rowTop, drawing);
    }
  }
  return 1;
}

function getCellRowspan(rows: number[][], rowIndex: number, colLeft: number, colWidth: number, pageHeight: number, drawing: Drawing): number {
  if (rows[rowIndex + 1]) {
    const yPosition = pageHeight - rows[rowIndex][1];
    const intersectionLine = new SvgLine(null, 1, colLeft + colWidth / 2, yPosition - 1, colLeft + colWidth / 2, yPosition + 1);
    const hvLines: SvgLine[] = (drawing.content as SvgLine[]).filter(c => c.isHorizontal() || c.isVertical());
    if (!hvLines.some(l => l.intersects(intersectionLine))) {
      return 1 + getCellRowspan(rows, rowIndex + 1, colLeft, colWidth, pageHeight, drawing);
    }
  }
  return 1;
}

function getCellWidth(cols: number[][], colIndex: number, colSpan: number) {
  const lastColX = cols[colIndex + colSpan - 1][1];
  const firstColX = cols[colIndex][0];
  return lastColX - firstColX;
}

function getCellHeight(rows: number[][], rowIndex: number, rowSpan: number) {
  const lastRowY = rows[rowIndex + rowSpan - 1][1];
  const firstRowY = rows[rowIndex][0];
  return firstRowY - lastRowY;
}