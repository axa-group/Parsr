/**
 * Copyright 2019 AXA Group Operations S.A.
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

import {
  Barcode,
  BoundingBox,
  Character,
  Document,
  Drawing,
  Element,
  Font,
  Heading,
  Image,
  JsonElement,
  JsonExport,
  JsonFont,
  JsonMetadata,
  JsonPage,
  JsonProperties,
  Line,
  List,
  Page,
  Paragraph,
  Table,
  TableCell,
  TableRow,
  Text,
  Word,
} from '../types/DocumentRepresentation';
import { FontOptions } from '../types/DocumentRepresentation/Font';
import { SvgLine } from '../types/DocumentRepresentation/SvgLine';
import { SvgShape } from '../types/DocumentRepresentation/SvgShape';
import { KeyValueMetadata, Properties, RegexMetadata } from '../types/Metadata';
import { prettifyObject } from '../utils';
import logger from './Logger';

export function json2document(inputJson: JsonExport): Document {
  const fonts: Font[] = [];

  const doc: Document = new Document([]);
  constructFonts(inputJson.fonts, fonts);
  constructPagesObj(inputJson.pages, doc.pages, fonts);
  constructMetadataObj(inputJson.metadata, doc);

  return doc;
}

function constructPagesObj(jsonPages: JsonPage[], outputPagesContainer: Page[], fonts: Font[]) {
  jsonPages.forEach(page => {
    const elementsDS: Element[] = [];
    page.elements.forEach(e => {
      const eDS = elementsFromJson(e, fonts);
      if (typeof eDS !== 'undefined') {
        elementsDS.push(eDS);
      }
    });
    if (elementsDS.length !== 0) {
      outputPagesContainer.push(
        new Page(
          page.pageNumber,
          elementsDS,
          new BoundingBox(page.box.l, page.box.t, page.box.w, page.box.h),
        ),
      );
    } else {
      logger.info('[JsonExtractor] didnt construct any elements', prettifyObject(elementsDS));
    }
  });
}

function elementsFromJson(elementJson: JsonElement, fonts: Font[]): Element | void {
  if (elementJson.type === 'table') {
    return tableFromJson(elementJson, fonts);
  } else if (elementJson.type === 'image') {
    return imageFromJson(elementJson);
  } else if (elementJson.type === 'list') {
    return listFromJson(elementJson, fonts);
  } else if (elementJson.type === 'drawing') {
    return drawingFromJson(elementJson);
  } else if (elementJson.type === 'barcode') {
    return barcodeFromJson(elementJson);
  } else if (
    elementJson.type === 'paragraph' ||
    elementJson.type === 'heading' ||
    elementJson.type === 'line' ||
    elementJson.type === 'word' ||
    elementJson.type === 'character'
  ) {
    return textFromJson(elementJson, fonts);
  } else {
    logger.warn(
      '[JsonExtractor] Unknown element type in the JSON file: ',
      elementJson,
      '. Ignoring...',
    );
  }
}

function constructFonts(inputFonts: JsonFont[], fonts: Font[]) {
  inputFonts.forEach(font => {
    const options: FontOptions = {};

    if (font.weight) {
      options.weight = font.weight;
    }
    if (font.isItalic) {
      options.isItalic = font.isItalic;
    }
    if (font.isUnderline) {
      options.isUnderline = font.isUnderline;
    }
    if (font.color) {
      options.color = font.color;
    }
    if (font.url) {
      options.url = font.url;
    }
    if (font.scaling) {
      options.scaling = font.scaling;
    }

    const fontDS: Font = new Font(font.name, font.size, options);
    fonts[font.id] = fontDS;
  });
}

function constructMetadataObj(inputMetadata: JsonMetadata[], d: Document) {
  inputMetadata.forEach(m => {
    switch (m.type) {
      case 'key-value':
        const allElements1: Element[] = m.elements.map(e => d.getElementById(e));
        const md1: KeyValueMetadata = new KeyValueMetadata(allElements1, {
          keyName: m.data.keyName,
          keyElements: m.data.keyElements.map(e => d.getElementById(e)),
          valueElements: m.data.valueElements.map(e => d.getElementById(e)),
        });
        allElements1.forEach(e => e.metadata.push(md1));
        break;
      case 'regex':
        const allElements2: Element[] = m.elements.map(e => d.getElementById(e));
        const md2: RegexMetadata = new RegexMetadata(allElements2, {
          regex: m.data.regkeyElemex,
          fullMatch: m.data.fullMatch,
          groups: m.data.groups,
          name: m.data.name,
        });
        allElements2.forEach(e => e.metadata.push(md2));
        break;
    }
  });
}

function propertiesFromJson(propertiesObj: JsonProperties): Properties {
  const prop: Properties = {};
  if (propertiesObj.hasOwnProperty('titleScores')) {
    prop.titleScores = {
      wordHeight: propertiesObj.titleScores.wordHeight,
      size: propertiesObj.titleScores.size,
      weight: propertiesObj.titleScores.weight,
      color: propertiesObj.titleScores.color,
      name: propertiesObj.titleScores.name,
      italic: propertiesObj.titleScores.italic,
      underline: propertiesObj.titleScores.underline,
      capitalCase: propertiesObj.titleScores.capitalCase,
      titleCase: propertiesObj.titleScores.titleCase,
    };
  }
  if (propertiesObj.hasOwnProperty('order')) {
    prop.order = propertiesObj.order;
  } else {
    logger.info(
      `the properties obj inputted does not have the order key: ${prettifyObject(propertiesObj)}`,
    );
  }
  if (propertiesObj.hasOwnProperty('isHeader')) {
    prop.isHeader = propertiesObj.isHeader;
  }
  if (propertiesObj.hasOwnProperty('isFooter')) {
    prop.isFooter = propertiesObj.isFooter;
  }
  if (propertiesObj.hasOwnProperty('isPageNumber')) {
    prop.isPageNumber = propertiesObj.isPageNumber;
  }
  if (propertiesObj.hasOwnProperty('bulletList')) {
    prop.bulletList = propertiesObj.bulletList;
  }
  return prop;
}

function tableFromJson(tableObj: JsonElement, fonts: Font[]): Table {
  const rowsDS: TableRow[] = [];

  if (Array.isArray(tableObj.content)) {
    tableObj.content.forEach(rowObj => {
      const cellsDS: TableCell[] = [];

      if (Array.isArray(rowObj.content)) {
        rowObj.content.forEach(cellObj => {
          if (Array.isArray(cellObj.content)) {
            const content: Element[] = cellObj.content
              .map(e => elementsFromJson(e, fonts))
              .filter(e => e instanceof Element) as Element[];
            const newCell: TableCell = new TableCell(
              new BoundingBox(cellObj.box.l, cellObj.box.t, cellObj.box.w, cellObj.box.h),
              content,
              cellObj.rowspan,
              cellObj.colspan,
            );

            newCell.id = cellObj.id;
            newCell.properties = propertiesFromJson(cellObj.properties);
            cellsDS.push(newCell);
          }
        });
      }

      const newRow: TableRow = new TableRow(
        cellsDS,
        new BoundingBox(rowObj.box.l, rowObj.box.t, rowObj.box.w, rowObj.box.h),
      );

      newRow.id = rowObj.id;
      newRow.properties = propertiesFromJson(rowObj.properties);
      rowsDS.push(newRow);
    });
  }

  const newTable: Table = new Table(
    rowsDS,
    new BoundingBox(tableObj.box.l, tableObj.box.t, tableObj.box.w, tableObj.box.h),
  );
  newTable.id = tableObj.id;
  newTable.properties = propertiesFromJson(tableObj.properties);
  return newTable;
}

function imageFromJson(imageObj: JsonElement): Image {
  const newImg: Image = new Image(
    new BoundingBox(imageObj.box.l, imageObj.box.t, imageObj.box.w, imageObj.box.h),
    imageObj.url,
  );
  newImg.id = imageObj.id;
  newImg.properties = propertiesFromJson(imageObj.properties);
  return newImg;
}

function listFromJson(listObj: JsonElement, fonts: Font[]): List {
  let content: Paragraph[] = [];

  if (Array.isArray(listObj.content)) {
    content = listObj.content
      .map(e => textFromJson(e, fonts))
      .filter(e => e instanceof Paragraph) as Paragraph[];
  }

  const newList: List = new List(
    new BoundingBox(listObj.box.l, listObj.box.t, listObj.box.w, listObj.box.h),
    content,
    listObj.isOrdered,
  );
  newList.id = listObj.id;
  newList.properties = propertiesFromJson(listObj.properties);
  return newList;
}

function drawingFromJson(drawingObj: JsonElement): Drawing | void {
  let svgShapeDS = [];

  if (Array.isArray(drawingObj.content)) {
    svgShapeDS = drawingObj.content.map(shape => svgShapeFromJson(shape));
  }
  if (typeof svgShapeDS !== 'undefined') {
    const newDrawing: Drawing = new Drawing(
      new BoundingBox(drawingObj.box.l, drawingObj.box.t, drawingObj.box.w, drawingObj.box.h),
    );
    newDrawing.id = drawingObj.id;
    newDrawing.properties = propertiesFromJson(drawingObj.properties);
    return newDrawing;
  }
}

function svgShapeFromJson(shapeObj: JsonElement): SvgShape {
  const newLine: SvgLine = new SvgLine(
    new BoundingBox(shapeObj.box.l, shapeObj.box.l, shapeObj.box.l, shapeObj.box.l),
    shapeObj.thickness,
    shapeObj.fromX,
    shapeObj.fromY,
    shapeObj.toX,
    shapeObj.toY,
  );
  newLine.id = shapeObj.id;
  newLine.properties = propertiesFromJson(shapeObj.properties);
  return newLine;
}

function barcodeFromJson(barcodeObj: JsonElement): Barcode {
  const newBarcode = new Barcode(
    new BoundingBox(barcodeObj.box.l, barcodeObj.box.t, barcodeObj.box.w, barcodeObj.box.h),
    barcodeObj.codeType,
    barcodeObj.codeValue,
  );
  newBarcode.id = barcodeObj.id;
  newBarcode.properties = propertiesFromJson(barcodeObj.properties);
  return newBarcode;
}

function textFromJson(textObj: JsonElement, fonts: Font[]): Text {
  let linesDS: Line[] = [];

  if (textObj.type === 'paragraph' || textObj.type === 'heading') {
    if (Array.isArray(textObj.content)) {
      linesDS = textObj.content.map(contentObj => {
        const obj: Text = textFromJson(contentObj, fonts);
        if (obj instanceof Line) {
          return obj;
        } else {
          throw new Error('Illegal Json: paragraphs should only contain lines.');
        }
      });
    }
  }

  if (textObj.type === 'paragraph') {
    const newParagraph = new Paragraph(
      new BoundingBox(textObj.box.l, textObj.box.t, textObj.box.w, textObj.box.h),
      linesDS,
    );

    newParagraph.id = textObj.id;
    newParagraph.properties = propertiesFromJson(textObj.properties);
    return newParagraph;
  } else if (textObj.type === 'heading') {
    const newHeading: Heading = new Heading(
      new BoundingBox(textObj.box.l, textObj.box.t, textObj.box.w, textObj.box.h),
      linesDS,
      textObj.level,
    );
    newHeading.id = textObj.id;
    newHeading.properties = propertiesFromJson(textObj.properties);
    return newHeading;
  } else if (textObj.type === 'line') {
    let wordsDS: Word[] = [];
    if (Array.isArray(textObj.content)) {
      wordsDS = textObj.content.map(contentObj => {
        const obj: Text = textFromJson(contentObj, fonts);
        if (obj instanceof Word) {
          return obj;
        } else {
          throw new Error('Illegal Json: lines should only contain words.');
        }
      });
    }
    const newLine: Line = new Line(
      new BoundingBox(textObj.box.l, textObj.box.t, textObj.box.w, textObj.box.h),
      wordsDS,
    );
    newLine.id = textObj.id;
    newLine.properties = propertiesFromJson(textObj.properties);
    return newLine;
  } else if (textObj.type === 'word') {
    if (typeof textObj.content === 'object') {
      const charsDS: Character[] = textObj.content.map(contentObj => {
        const obj: Text = textFromJson(contentObj, fonts);
        if (obj instanceof Character) {
          return obj;
        } else {
          throw new Error('Illegal Json: words should only contain characters.');
        }
      });
      const newWord: Word = new Word(
        new BoundingBox(textObj.box.l, textObj.box.t, textObj.box.w, textObj.box.h),
        charsDS,
        fonts[textObj.font],
      );
      newWord.id = textObj.id;
      newWord.properties = propertiesFromJson(textObj.properties);
      return newWord;
    } else {
      const newWord: Word = new Word(
        new BoundingBox(textObj.box.l, textObj.box.t, textObj.box.w, textObj.box.h),
        textObj.content,
        fonts[textObj.font],
      );
      newWord.id = textObj.id;
      newWord.properties = propertiesFromJson(textObj.properties);
      return newWord;
    }
  } else {
    logger.error('[JsonExtractor] Cannot extract from object of type', textObj.type);
    throw new Error(`Illegal Json: Unknown text block ${textObj.type}`);
  }
}
