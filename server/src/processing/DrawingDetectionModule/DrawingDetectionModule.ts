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

import { BoundingBox, Document, Drawing } from '../../types/DocumentRepresentation';
import { SvgLine } from '../../types/DocumentRepresentation/SvgLine';
import logger from '../../utils/Logger';
import { Module } from '../Module';

/**
 * groups together SvgLines that are visually connected
 */
export class DrawingDetectionModule extends Module {
  public static moduleName = 'drawing-detection';

  public main(doc: Document): Promise<Document> {
    if (doc.getElementsOfType<Drawing>(Drawing).length > 0) {
      logger.warn('Document already has Drawings. Skipping...');
      return Promise.resolve(doc);
    }

    doc.pages.forEach(page => {
      const lines = page.getElementsOfType<SvgLine>(SvgLine, true);
      const drawings: Drawing[] = [];
      this.groupShapesIntoDrawings(lines, page.box, drawings);

      // filter all SvgLine type elements and push Drawings containing those Lines
      const lineIds = lines.map(l => l.id);
      page.elements = page.elements.filter(e => !lineIds.includes(e.id));
      page.elements.push(...drawings);
    });
    logger.info(`${doc.getElementsOfType<Drawing>(Drawing).length} drawings found on document.`);
    return Promise.resolve(doc);
  }

  private groupShapesIntoDrawings(svgLines: SvgLine[], box: BoundingBox, foundDrawings: Drawing[]) {
    const { columns, rows } = this.groupLines(svgLines, box);

    if (columns.length > 1) {
      // divide the box into columns.length cols and recall function for each one
      columns.forEach(svgColumn => {
        this.groupShapesIntoDrawings(svgColumn, box, foundDrawings);
      });
    } else if (rows.length > 1) {
      // divide the box into rows.length rows and recall function for each one
      rows.forEach(svgRow => {
        this.groupShapesIntoDrawings(svgRow, box, foundDrawings);
      });
    } else {
      const lines = columns[0];
      if (lines) {
        // a Drawing was found, the content in columns and rows is the same
        const drawing = new Drawing(null, lines);
        drawing.updateBoundingBox();
        foundDrawings.push(drawing);
      }
    }
  }

  private groupLines(
    svgLines: SvgLine[],
    box: BoundingBox,
  ): { columns: SvgLine[][]; rows: SvgLine[][] } {
    // vertical line
    const vControlLine = new SvgLine(null, 1, box.left, box.top, box.left, box.bottom);
    const groupedColumns = this.processGroup(svgLines, box, vControlLine);

    // horizontal line
    const hControlLine = new SvgLine(null, 1, box.left, box.top, box.width, box.top);
    const groupedRows = this.processGroup(svgLines, box, hControlLine);

    return {
      columns: groupedColumns,
      rows: groupedRows,
    };
  }

  /**
   * does a vertical/horizontal sweep of the page SvgLines (similar to page margins calculation)
   * and detects separation gaps between those lines.
   *
   * @param lines lines to process into groups
   * @param box boundingBox of the current page area to sweep
   * @param controlLine 'sweeper' line can be horizontal or vertical. longitude is set based on the current line group
   * @returns SvgLine[][],
   * where each element of the array are SvgLines that are vertically/horizontally grouped
   */
  private processGroup(lines: SvgLine[], box: BoundingBox, controlLine: SvgLine): SvgLine[][] {
    const groups: SvgLine[][] = [];
    const processedLineIds: number[] = [];
    let currentLineGroup: SvgLine[] = [];

    // until controlLine reaches the v/h end of the page
    // if controlLine is vertical, the sweep is done from left to right
    // if controlLine is horizontal, the sweep is done from top to bottom
    const type = controlLine.isVertical() ? 'h' : 'v';
    while (
      (type === 'v' ? controlLine.toY : controlLine.toX) < (type === 'v' ? box.height : box.width)
    ) {
      const intersectingLines = lines.filter(
        l => controlLine.intersects(l) || this.controlLineIsOver(l, controlLine),
      );
      if (intersectingLines.length > 0) {
        const unusedLines = intersectingLines.filter(l => !processedLineIds.includes(l.id));
        if (unusedLines.length > 0) {
          currentLineGroup.push(...unusedLines);
          processedLineIds.push(...unusedLines.map(l => l.id));
        }
      } else {
        // if no intersectingLines were found,
        // it means the controlLine is on a "gap between drawings" so a group has been found
        if (currentLineGroup.length > 0) {
          groups.push(currentLineGroup);
          currentLineGroup = [];
        }
      }

      // at the end of each iteration, move the control line
      controlLine.move(type === 'v' ? 0 : 1, type === 'v' ? 1 : 0);
    }

    if (currentLineGroup.length > 0) {
      groups.push(currentLineGroup);
    }

    return groups;
  }

  /**
   * As lines position are floating poing values,
   * this avoids controlLine to jump over the line without detecting it
   */
  private controlLineIsOver(line: SvgLine, controlLine: SvgLine): boolean {
    const is1pxAroundLineX =
      controlLine.fromX + 0.5 >= line.fromX && controlLine.fromX - 0.5 <= line.fromX;
    const is1pxAroundLineY =
      controlLine.fromY + 0.5 >= line.fromY && controlLine.fromY - 0.5 <= line.fromY;
    return (
      (controlLine.isVertical() && is1pxAroundLineX) ||
      (controlLine.isHorizontal() && is1pxAroundLineY)
    );
  }
}
