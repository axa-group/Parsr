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

import { parseString } from 'xml2js';
import { ListDetectionModule } from '../../processing/ListDetectionModule/ListDetectionModule';
import { Config } from '../../types/Config';
import {
  Barcode,
  BoundingBox,
  Character,
  Drawing,
  Element,
  Font,
  Image,
  Line,
  List,
  Page,
  Paragraph,
  Table,
  TableCell,
  TableRow,
  Word,
} from '../../types/DocumentRepresentation';
import { Document } from '../../types/DocumentRepresentation/Document';
import { SvgLine } from '../../types/DocumentRepresentation/SvgLine';
import { SvgShape } from '../../types/DocumentRepresentation/SvgShape';
import * as utils from '../../utils';
import logger from '../../utils/Logger';
import { OcrExtractorFactory } from '../OcrExtractor';
import { AbbyyClient } from './AbbyyClient';
import * as credentials from './credentials.json';

// type CellPosition = {
//   x: number;
//   y: number;
// };

export class AbbyyTools extends OcrExtractorFactory {
  /**
   * Getter fonts
   * @return {Font[] }
   */
  public get fonts(): Font[] {
    return this._fonts;
  }

  /**
   * Setter fonts
   * @param {Font[] } value
   */
  public set fonts(value: Font[]) {
    this._fonts = value;
  }
  private _fonts: Font[] = [];

  constructor(config: Config) {
    super(config, credentials);
    this.checkCredentials(['ABBYY_SERVER_URL', 'ABBYY_SERVER_VER', 'ABBYY_WORKFLOW']);

    this.checkCredentialAsURL('ABBYY_SERVER_URL');
  }

  public abbyyXMLToObject(xml: string): Promise<object> {
    const promise = new Promise<object>((resolve, reject) => {
      parseString(xml, (err, dataObject) => {
        if (err) {
          reject(err);
        }
        resolve(dataObject);
      });
    });
    return promise;
  }

  public scanFile(inputFile: string): Promise<Document> {
    const host: string = this.config.extractor.credentials.ABBYY_SERVER_URL;
    const serverVersion: string = this.config.extractor.credentials.ABBYY_SERVER_VER;
    const workflowName: string = this.config.extractor.credentials.ABBYY_WORKFLOW;
    const serverTimeout: number = 50000;
    const jobPollingInterval: number = 1000;

    const client: AbbyyClient = new AbbyyClient(host, serverVersion, serverTimeout);
    const promise: Promise<Document> = client
      .run(workflowName, inputFile, jobPollingInterval)
      .then(xml => this.abbyyXMLToObject(xml))
      .then((obj: any) => {
        const doc = obj.document.page;
        const promises: Array<Promise<Page>> = [];

        for (const pageNumber in doc) {
          const pageObj = doc[pageNumber];
          // the last argument signifies that blade lines
          // are calculated automatically for each page
          promises.push(this.parseAbbyyPage(pageObj, parseInt(pageNumber, 10)));
        }

        return Promise.all(promises);
      })
      .then((pages: Page[]) => new Document(pages))
      .catch(err => {
        throw new Error(
          `There was an error while interfacing with the ABBYY Finereader server: ${err}`,
        );
      });

    return promise;
  }

  protected parseAbbyyPage(pageObject: any, pageNumber: number): Promise<Page> {
    const promise = new Promise<Page>(async (resolve, reject) => {
      let elements: Element[] = [];
      try {
        for (const blockKey in pageObject.block) {
          const block = pageObject.block[blockKey];
          elements = elements.concat(this.parseBlock(block));
        }
      } catch (err) {
        reject(err);
      }
      const pageWidth = parseInt(pageObject.$.width, 10);
      const pageHeight = parseInt(pageObject.$.height, 10);
      const page = new Page(pageNumber + 1, elements, new BoundingBox(0, 0, pageWidth, pageHeight));
      resolve(page);
    });
    return promise;
  }

  private computeBoundingBox(abbyyBoxAttribs: any): BoundingBox {
    const left = parseInt(abbyyBoxAttribs.l, 10);
    const right = parseInt(abbyyBoxAttribs.r, 10);
    const top = parseInt(abbyyBoxAttribs.t, 10);
    const bottom = parseInt(abbyyBoxAttribs.b, 10);

    return new BoundingBox(left, top, right - left, bottom - top);
  }

  // tslint:disable: no-bitwise
  private abbyyColorToRgbHex(bgr: number): string {
    const r: number = (bgr >> 16) & 255;
    const g: number = (bgr >> 8) & 255;
    const b: number = bgr & 255;
    const rgb: number = (b << 16) | (g << 8) | r;
    return rgb.toString(16).toUpperCase();
  }

  private newFontProcess(newFont: Font): Font {
    const existingFonts: Font[] = this.fonts.filter(font => font.isEqual(newFont));
    if (existingFonts.length !== 0) {
      return existingFonts[0];
    } else {
      this.fonts.push(newFont);
      return newFont;
    }
  }

  private fontFromFormatting(formattingObj: any): Font {
    let ff: string = '';
    let fs: number = 0;

    const fontOptions: any = {};
    if ('bold' in formattingObj) {
      if (formattingObj.bold === '1') {
        fontOptions.weight = 'bold';
      }
    }
    if ('italic' in formattingObj) {
      fontOptions.italic = formattingObj.italic === '1';
    }
    if ('underline' in formattingObj) {
      fontOptions.underline = formattingObj.underline === '1';
    }
    if ('color' in formattingObj) {
      fontOptions.color = this.abbyyColorToRgbHex(parseInt(formattingObj.color, 10));
    }
    if ('scaling' in formattingObj) {
      fontOptions.scaling = parseInt(formattingObj.scaling, 10);
    } else {
      // default scaling to use
      fontOptions.scaling = 1000;
    }

    fontOptions.sizeUnit = 'em';

    if ('ff' in formattingObj) {
      ff = formattingObj.ff;
    }
    if ('fs' in formattingObj) {
      fs = parseInt(formattingObj.fs, 10);
    }

    const font: Font = new Font(ff, fs, fontOptions);
    return this.newFontProcess(font);
  }

  private parseAbbyyParagraph(para: any): Paragraph {
    const linesDS: Line[] = [];
    for (const lineNum in para.line) {
      const line = para.line[lineNum];
      let wordsConcat: string = ''; // DS for words if no letter level details
      const wordsDS: Word[] = [];
      for (const thisLineKey in line.formatting) {
        const lineContent = line.formatting[thisLineKey];
        const font = this.fontFromFormatting(lineContent.$);
        if ('charParams' in lineContent) {
          // means that char level data was generated
          let charsDS: Character[] = [];
          const characterObjects = lineContent.charParams;
          let isInDictionary: boolean = false;
          for (const thisCharKey in characterObjects) {
            const thisChar = characterObjects[thisCharKey];
            const charBBox: BoundingBox = this.computeBoundingBox(thisChar.$);
            if (charBBox.areaIsEmpty()) {
              // if it has some content, it should be dealt with
              continue;
            }
            if (typeof thisChar._ === 'undefined') {
              // if ('isTab' in thisChar['$']) {  // TODO: use this tab/space information somehow
              //     charVal = "\t"
              // }
              // else {
              //     charVal = " "
              // }
              if (charsDS.length !== 0) {
                wordsDS.push(this.wordFromCharacters(charsDS, isInDictionary, font));
                charsDS = [];
                isInDictionary = false;
              }
            } else {
              const c = new Character(charBBox, thisChar._);
              let confidence: number = 1;
              if ('charConfidence' in thisChar.$) {
                confidence = utils.round(parseInt(thisChar.$.charConfidence, 10) * 0.01);
              }
              if ('wordFromDictionary' in thisChar.$) {
                isInDictionary = thisChar.$.wordFromDictionary === '1';
              }
              c.confidence = confidence;
              charsDS.push(c);
            }
          }
          if (charsDS.length !== 0) {
            wordsDS.push(this.wordFromCharacters(charsDS, isInDictionary, font));
          }
        }
        if ('_' in lineContent) {
          // means that char level data was not generated
          const textContent: string = lineContent._;
          wordsConcat += textContent;
        }
        if (wordsConcat !== '') {
          wordsConcat.split(/\s+/).forEach(wordAsString => {
            if (wordAsString !== '') {
              const w: Word = this.wordFromCharacters(wordAsString, false, font);
              wordsDS.push(w);
            }
          });
        }
      }
      if (wordsDS.length !== 0) {
        const l: Line = this.lineFromWords(wordsDS, this.computeBoundingBox(line.$));
        linesDS.push(l);
      }
    }
    return new Paragraph(BoundingBox.merge(linesDS.map(line => line.box)), linesDS);
  }

  private wordFromCharacters(
    chars: Character[] | string,
    isInDictionary: boolean,
    font: Font,
  ): Word {
    let wordDS: Word;
    if (typeof chars !== 'string') {
      wordDS = new Word(BoundingBox.merge(chars.map(char => char.box)), chars, font);
      if (typeof chars[0].confidence !== 'undefined') {
        const confidences: number[] = chars.map(char => char.confidence);
        wordDS.confidence = utils.round(
          confidences.reduce((a, b) => a + b, 0) / confidences.length,
          2,
        );
      }
    } else {
      wordDS = new Word(undefined, chars, font);
    }
    wordDS.isInDictionary = isInDictionary;
    wordDS.font = font;
    return wordDS;
  }

  private lineFromWords(words: Word[], lineBBox: BoundingBox): Line {
    const lineDS: Line = new Line(lineBBox, words);
    if (typeof words[0].confidence !== 'undefined') {
      const confidences: number[] = words.map(word => word.confidence);
      lineDS.confidence = utils.round(
        confidences.reduce((a, b) => a + b, 0) / confidences.length,
        2,
      );
    }
    return lineDS;
  }

  private createNewList(paragraph: Paragraph): List {
    return new List(paragraph.box, [paragraph], this.treatListItem(paragraph));
  }

  private treatListItem(paragraph: Paragraph): boolean {
    let isOrderedList: boolean = false;
    if (paragraph.content.length !== 0) {
      if (ListDetectionModule.isBullet(paragraph.content[0].content[0])) {
        isOrderedList = false;
        paragraph.content[0].content.shift();
      } else if (ListDetectionModule.isNumbering(paragraph.content[0].content[0])) {
        isOrderedList = true;
      }
    }
    return isOrderedList;
  }

  private parseAbbyyTable(tableObject: any, cleanTable: boolean = false): Element[] {
    const rowsDS: TableRow[] = [];
    const tableBBox: BoundingBox = this.computeBoundingBox(tableObject.$);
    let cellX = tableBBox.left;
    let cellY = tableBBox.top;
    const rowSpanOffsets = [];

    for (const rowNum in tableObject.row) {
      cellX = tableBBox.left;
      const row = tableObject.row[rowNum];
      const cellsDS: TableCell[] = [];
      let colSpanOffsets = 0;
      for (const colNum in row.cell) {
        const cell = row.cell[colNum];
        const cellWidth = parseInt(cell.$.width, 10);
        const cellHeight = parseInt(cell.$.height, 10);
        let colSpan: number = 1;
        if ('colSpan' in cell.$) {
          colSpan = parseInt(cell.$.colSpan, 10);
          colSpanOffsets += colSpan - 1;
        }
        let rowSpan: number = 1;
        if ('rowSpan' in cell.$) {
          rowSpan = parseInt(cell.$.rowSpan, 10);
          this.trackRowSpan(rowSpanOffsets, rowNum, colNum, cell, colSpanOffsets);
        }
        const elementsDS: Element[] = [];
        for (const textNum in cell.text) {
          // TODO: assumes that the cell content is text. should include all kinds of elements
          const text = cell.text[textNum];
          for (const paraNum in text.par) {
            const para = text.par[paraNum];
            const paraContent: Paragraph = this.parseAbbyyParagraph(para);
            if (paraContent.content.length !== 0 && paraContent.toString() !== '') {
              elementsDS.push(paraContent);
            }
          }
        }
        const cellXOffset = rowSpanOffsets.filter(
          span => span.row === parseInt(rowNum, 10) && span.col === parseInt(colNum, 10),
        );
        if (cellXOffset.length > 0) {
          cellX += cellXOffset.pop().width;
        }
        const cellBBox: BoundingBox = new BoundingBox(cellX, cellY, cellWidth, cellHeight);
        const tableCellDS: TableCell = new TableCell(cellBBox, elementsDS, rowSpan, colSpan);
        cellsDS.push(tableCellDS);
        cellX += cellWidth;
      }
      rowsDS.push(new TableRow(cellsDS, BoundingBox.merge(cellsDS.map(cell => cell.box))));
      cellY += Math.min(...cellsDS.map(cell => cell.box.height));
      this.mergeConsecutiveRowSpanOffsets(rowSpanOffsets, rowNum);
    }
    const tableDS = new Table(rowsDS, tableBBox);
    let elements: Element[] = [];

    if (cleanTable) {
      elements = tableDS.cleanTable();
    } else {
      elements.push(tableDS);
    }
    return elements;
  }

  private mergeConsecutiveRowSpanOffsets(
    rowSpanOffsets: any,
    rowNum: string,
    colNum: string = '0',
  ) {
    const row = parseInt(rowNum, 10) + 1;
    const col = parseInt(colNum, 10);
    const newRowSpans = rowSpanOffsets.filter(span => span.row === row && span.width !== 0);
    for (let i = col; i < newRowSpans.length; i++) {
      if (i + 1 < newRowSpans.length && newRowSpans[i].col === newRowSpans[i + 1].col - 1) {
        this.mergeConsecutiveRowSpanOffsets(rowSpanOffsets, rowNum, (i + 1).toString());
      } else if (col - 1 >= 0 && newRowSpans[col].col - 1 === newRowSpans[col - 1].col) {
        newRowSpans[col - 1].width += newRowSpans[col].width;
        newRowSpans[col].width = 0;
      }
    }
  }
  private trackRowSpan(
    rowSpanOffsets: any,
    rowNum: string,
    colNum: string,
    cell: any,
    colSpanOffsets: number,
  ) {
    let cont = 0;
    const rowSpan = parseInt(cell.$.rowSpan, 10);
    const row = parseInt(rowNum, 10);
    const col = parseInt(colNum, 10);

    while (rowSpan - 1 - cont > 0) {
      rowSpanOffsets.push({
        row: row + 1 + cont,
        col: col + colSpanOffsets,
        width: parseInt(cell.$.width, 10),
      });

      cont++;
    }
  }

  private parseAbbyyImage(imageObject: any): Image {
    return new Image(this.computeBoundingBox(imageObject.$));
  }

  private parseAbbyyDrawing(drawingObject: any): Drawing {
    const shapes: SvgShape[] = [];
    const separator: any = drawingObject.separator[0];
    const shapeType: string = separator.$.type.trim().toLowerCase();
    const bBox: BoundingBox = this.computeBoundingBox(drawingObject.$);
    if (shapeType === 'black' || shapeType === 'dotted') {
      const line: SvgLine = new SvgLine(
        bBox,
        parseFloat(separator.$.thickness),
        parseFloat(separator.start['0'].$.x),
        parseFloat(separator.start['0'].$.y),
        parseFloat(separator.end['0'].$.x),
        parseFloat(separator.end['0'].$.y),
      );
      shapes.push(line);
    }
    const d: Drawing = new Drawing(bBox, shapes);
    return d;
  }

  private parseAbbyyBarcode(barcodeObject: any): Barcode {
    const content = barcodeObject.text['0'].par['0'].line['0'].formatting['0']._;
    const barcode: Barcode = new Barcode(
      this.computeBoundingBox(barcodeObject.$),
      barcodeObject.barcodeInfo['0'].$.type,
      content,
    );
    return barcode;
  }

  private parseBlock(block: any, blockType?: string): Element[] {
    let elements: Element[] = [];
    if (typeof blockType === 'undefined') {
      blockType = block.$.blockType.trim().toLowerCase();
    }
    if (blockType === 'text') {
      let currentList: List = null;
      block.text.forEach(t => {
        t.par.forEach(p => {
          const paragraph: Paragraph = this.parseAbbyyParagraph(p);
          const isList: boolean = 'isListItem' in p.$;

          if (isList) {
            const listNum: number = parseFloat(p.$.lstNum);

            if (!currentList || listNum === 1) {
              currentList = this.createNewList(paragraph);
              elements.push(currentList);
            } else {
              this.treatListItem(paragraph);
              currentList.addListItem(paragraph);
            }
          } else {
            if (paragraph.content.length !== 0 && paragraph.toString() !== '') {
              elements.push(paragraph);
            }

            currentList = null;
          }
        });
      });
    } else if (blockType === 'table') {
      // the last argument signifies that blade lines
      // are calculated automatically for each page
      const t: Element[] = this.parseAbbyyTable(block, true);
      elements = [...elements, ...t];
    } else if (blockType === 'picture') {
      elements.push(this.parseAbbyyImage(block));
    } else if (blockType === 'drawing' || blockType === 'separator') {
      const d: Drawing = this.parseAbbyyDrawing(block);
      if (typeof d !== 'undefined') {
        elements.push(this.parseAbbyyDrawing(block));
      }
    } else if (blockType === 'barcode') {
      elements.push(this.parseAbbyyBarcode(block));
    } else {
      logger.warn('unknown block type:', blockType);
    }
    return elements;
  }
}
