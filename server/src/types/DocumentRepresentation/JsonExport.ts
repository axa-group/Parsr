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

import { Properties } from '../Metadata';
import { Color } from './Color';

export interface JsonExport {
  pages: JsonPage[];
  fonts: JsonFont[];
  metadata: JsonMetadata[];
}

export interface JsonPageRotationCoords {
  x: number;
  y: number;
}

export interface JsonPageRotation {
  degrees: number;
  origin: JsonPageRotationCoords;
  translation: JsonPageRotationCoords;
}

export interface JsonPage {
  box: JsonBox;
  rotation?: JsonPageRotation;
  pageNumber: number;
  elements: JsonElement[];
  margins: {
    top: number,
    left: number,
    bottom: number,
    right: number,
  };
}

export interface JsonBox {
  l: number;
  t: number;
  w: number;
  h: number;
}

export interface JsonElement {
  id: number;
  type: string; // TODO be more precise
  box?: JsonBox;
  content?: JsonElement[] | string;
  font?: number;
  fontSize?: number;
  src?: string;
  refId?: string;
  xObjId?: string;
  xObjExt?: string;
  codeType?: string;
  codeValue?: string;
  conf?: number;
  fromX?: number;
  fromY?: number;
  toX?: number;
  toY?: number;
  thickness?: number;
  color?: string;
  fillOpacity?: number;
  strokeOpacity?: number;
  rowspan?: number;
  colspan?: number;
  spanDirection?: string;
  isOrdered?: boolean;
  firstItemNumber?: number;
  properties?: JsonProperties;
  metadata?: number[];
  level?: number;
  description?: string;
  pageNumber?: string;
}

export type JsonProperties = Properties;

export interface JsonFont {
  id: number;
  name: string;
  size: number;
  weight: string;
  isItalic: boolean;
  isUnderline: boolean;
  sizeUnit: string;
  color: Color;
  url?: string;
  scaling?: number;
}

export interface JsonMetadata {
  id: number;
  elements: number[];
  type: string;
  value?: number;
  data?: any;
}
