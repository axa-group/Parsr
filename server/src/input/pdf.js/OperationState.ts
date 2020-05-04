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

import { FONT_IDENTITY_MATRIX, IDENTITY_MATRIX } from './operators/helper';

export class OperationState {
  public static state = {
    current: {
      // font data
      font: null,
      fontFamily: undefined,
      fontWeight: 'normal',
      fontStyle: 'normal',
      fontSize: 0,
      fontDirection: 1,
      fillColor: '#000000',
      fontMatrix: FONT_IDENTITY_MATRIX,

      // pointer data
      x: 0,
      y: 0,
      lineX: 0,
      lineY: 0,

      // text reconstruction data
      xcoords: [],
      charSpacing: 0,
      wordSpacing: 0,
      textMatrix: IDENTITY_MATRIX,
      textMatrixScale: 1,
      textHScale: 1,
      textRise: 0,
      leading: 0,
      tspan: null,

      // Graphic state data (SVG rendering)
      lineWidth: 1,
      lineCap: '',
      lineJoin: '',
      miterLimit: 0,
      dashArray: [],
      dashPhase: 0,
      strokeAlpha: 1,
      fillAlpha: 1,
      strokeColor: '#000000',
      path: null,
    },

    // cache of fonts and images loaded with "dependency" operator
    loadedAssets: {
      fonts: {},
      images: {},
    },
    fontMatrix: FONT_IDENTITY_MATRIX,
    transformMatrix: IDENTITY_MATRIX,
    transformStack: [],
    extraStack: [],

    extractImages: false,
    extractText: true,
    extractShapes: true,
    pendingClip: null,
  };

  public static newState() {
    this.state.current.textMatrix = IDENTITY_MATRIX;
    this.state.current.textMatrixScale = 1;
    this.state.current.fontMatrix = FONT_IDENTITY_MATRIX;
    this.state.current.leading = 0;
    this.state.current.x = 0;
    this.state.current.y = 0;
    this.state.current.charSpacing = 0;
    this.state.current.wordSpacing = 0;
    this.state.current.textHScale = 1;
    this.state.current.textRise = 0;
    this.state.current.fillColor = '#000000';
    this.state.current.lineWidth = 1;
    this.state.current.lineCap = '';
    this.state.current.lineJoin = '';
    this.state.current.miterLimit = 0;
    this.state.current.dashArray = [];
    this.state.current.dashPhase = 0;
    this.state.current.strokeAlpha = 1;
    this.state.current.fillAlpha = 1;
    this.state.current.strokeColor = '#000000';
    this.state.current.path = null;
  }
}
