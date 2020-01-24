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

import { RotationCorrection } from '../../input/OcrExtractor';
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
  JsonBox,
  JsonElement,
  JsonExport,
  JsonFont,
  JsonMetadata,
  JsonPage,
  JsonPageRotation,
  List,
  Page,
  Table,
  TableCell,
  TableRow,
  Text,
  Word,
} from '../../types/DocumentRepresentation';
import { SvgLine } from '../../types/DocumentRepresentation/SvgLine';
import { SvgShape } from '../../types/DocumentRepresentation/SvgShape';
import { ComplexMetadata, Metadata, NumberMetadata } from '../../types/Metadata';
import * as utils from '../../utils';
import logger from '../../utils/Logger';
import { Exporter } from '../Exporter';

export class JsonExporter extends Exporter {
  private granularity: string;
  private currentMetadataId: number = 1;
  private currentFontId: number = 0;
  private json: JsonExport = {} as JsonExport;
  private fontCatalog: Map<Font, number> = new Map<Font, number>();
  private metadataCatalog: Map<Metadata, number> = new Map<Metadata, number>();

  constructor(doc: Document, granularity: string) {
    super(doc);
    this.granularity = granularity;
  }

  public export(outputPath: string): Promise<void> {
    logger.info('Exporting json...');
    return this.writeFile(outputPath, JSON.stringify(this.getJson()));
  }

  public getJson(): JsonExport {
    this.json.metadata = [];

    this.buildMetadataCatalog();
    this.metadataToJson();

    this.json.pages = this.doc.pages.map((page: Page) => {
      const jsonPage: JsonPage = {
        margins: this.doc.margins,
        box: this.boxToJsonBox(page.box),
        rotation: this.rotationToJsonRotation(page.pageRotation),
        pageNumber: page.pageNumber,
        elements: page.elements
          .sort(utils.sortElementsByOrder)
          .map((element: Element) => this.elementToJsonElement(element)),
      };

      return jsonPage;
    });

    this.json.fonts = [];
    this.fontCatalog.forEach((fontId, font) => {
      const name = font.name;
      const size = font.size;
      const url = font.url;
      const scaling = font.scaling;
      let weight = font.weight;
      let isItalic = font.isItalic;
      let isUnderline = font.isUnderline;
      let sizeUnit = 'px';
      let color = font.color;

      if (font.color !== 'black' && font.color !== '#000000' && font.color !== '000000') {
        color = font.color;
      }

      if (font.weight !== 'medium') {
        weight = font.weight;
      }

      if (font.isItalic) {
        isItalic = font.isItalic;
      }

      if (font.isUnderline) {
        isUnderline = font.isUnderline;
      }

      if (font.sizeUnit) {
        sizeUnit = font.sizeUnit;
      }

      const jsonFont: JsonFont = {
        id: fontId,
        name,
        size,
        weight,
        isItalic,
        isUnderline,
        color,
        url,
        scaling,
        sizeUnit,
      };

      this.json.fonts.push(jsonFont);
    });

    return this.json;
  }

  private buildMetadataCatalog() {
    // Build the catalog, avoiding duplicates thanks to the Map
    this.doc.pages.forEach(page => {
      page.elements.forEach(elem => {
        this.findMetadata(elem);
      });
    });
  }

  private findMetadata(element: Element) {
    element.metadata.forEach(m => {
      if (!this.metadataCatalog.has(m)) {
        this.metadataCatalog.set(m, this.currentMetadataId++);
      }
    });

    if (element.content instanceof Array) {
      element.content.forEach(elem => this.findMetadata(elem));
    }
  }

  private metadataToJson() {
    this.metadataCatalog.forEach((id: number, metadata: Metadata) => {
      const jsonMetadata: JsonMetadata = {
        id,
        elements: metadata.elements.map(e => e.id).sort((a, b) => a - b),
        type: utils.toKebabCase(metadata.constructor.name).replace(/-metadata$/, ''),
      };

      if (metadata instanceof NumberMetadata) {
        jsonMetadata.value = metadata.value;
      }

      if (metadata instanceof ComplexMetadata) {
        Object.keys(metadata.data).forEach(k => {
          metadata.data[k] = this.convertElementValue(metadata.data[k]);
        });

        jsonMetadata.data = metadata.data;
      }

      this.json.metadata.push(jsonMetadata);
    });
  }

  private elementToJsonElement(element: Element) {
    const id: number = element.id;
    const type: string = utils.toKebabCase(element.constructor.name);

    const jsonElement: JsonElement = {
      id,
      type,
    };

    if (element.properties) {
      jsonElement.properties = element.properties;
    }

    jsonElement.metadata = element.metadata.map(metadata => this.metadataCatalog.get(metadata));

    if (Element.hasBoundingBox(element)) {
      jsonElement.box = this.boxToJsonBox(element.box);
    }

    if (element instanceof Text) {
      jsonElement.conf = element.confidence;

      if (typeof element.content === 'string') {
        jsonElement.content = element.content;
      } else if (
        this.granularity === 'word' &&
        element.content instanceof Array &&
        element.content.length > 0 &&
        element.content[0] instanceof Character
      ) {
        jsonElement.content = element.toString();
      } else {
        jsonElement.content = element.content
          .sort(utils.sortElementsByOrder)
          .map(elem => this.elementToJsonElement(elem));
      }

      if (element instanceof Word) {
        if (typeof element.font !== 'undefined') {
          const allFonts = Array.from(this.fontCatalog.keys());
          const wordFont = allFonts.filter(font => font.isEqual(element.font));
          if (wordFont.length === 0) {
            this.currentFontId++;
            this.fontCatalog.set(element.font, this.currentFontId);
            jsonElement.font = this.currentFontId;
          } else {
            jsonElement.font = this.fontCatalog.get(wordFont[0]);
          }
        }
      } else if (element instanceof Heading) {
        jsonElement.level = element.level;
      }
    } else if (element instanceof List) {
      jsonElement.isOrdered = element.isOrdered;
      jsonElement.firstItemNumber = element.firstItemNumber;
      jsonElement.content = element.content.map(elem => this.elementToJsonElement(elem));
    } else if (element instanceof Table) {
      jsonElement.content = element.content.map(elem => this.elementToJsonElement(elem));
    } else if (element instanceof TableRow) {
      jsonElement.content = element.content.map(elem => this.elementToJsonElement(elem));
    } else if (element instanceof TableCell) {
      jsonElement.rowspan = element.rowspan;
      jsonElement.colspan = element.colspan;
      jsonElement.content = element.content.map(elem => this.elementToJsonElement(elem));
    } else if (element instanceof SvgShape) {
      if (element instanceof SvgLine) {
        jsonElement.fromX = element.fromX;
        jsonElement.fromY = element.fromY;
        jsonElement.toX = element.toX;
        jsonElement.toY = element.toY;
        jsonElement.thickness = element.thickness;
      }
    } else if (element instanceof Drawing) {
      jsonElement.content = element.content.map(elem => this.elementToJsonElement(elem));
    } else if (element instanceof Barcode) {
      jsonElement.codeType = element.type;
      jsonElement.codeValue = element.content;
    } else if (element instanceof Image) {
      if (!element.enabled) {
        // If image detection module is not executed in pipe all images have enabled = false
        return null;
      }
      jsonElement.src = element.src; // TODO replace this with a location based on an API access point
      jsonElement.refId = element.refId;
      jsonElement.xObjId = element.xObjId;
      jsonElement.xObjExt = element.xObjExt;
    }

    return jsonElement;
  }

  private boxToJsonBox(box: BoundingBox): JsonBox {
    const jsonBox: JsonBox = {
      l: utils.round(box.left),
      t: utils.round(box.top),
      w: utils.round(box.width),
      h: utils.round(box.height),
    };

    return jsonBox;
  }

  private rotationToJsonRotation(rotation: RotationCorrection): JsonPageRotation {
    if (rotation != null) {
      const jsonRotation: JsonPageRotation = {
        degrees: rotation.degrees,
        origin: rotation.origin,
        translation: rotation.translation,
      };
      return jsonRotation;
    }
    const noRotation: JsonPageRotation = {
      degrees: 0,
      origin: { x: 0, y: 0 },
      translation: { x: 0, y: 0 },
    };
    return noRotation;
  }

  private convertElementValue(value: any): any {
    if (value instanceof Element) {
      return value.id;
    } else if (value instanceof Array) {
      return value.map(v => this.convertElementValue(v));
    } else {
      return value;
    }
  }
}
