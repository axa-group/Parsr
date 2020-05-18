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

const IDENTITY_MATRIX = [1, 0, 0, 1, 0, 0];
const FONT_IDENTITY_MATRIX = [0.001, 0, 0, 0.001, 0, 0];
const LINE_CAP_STYLES = ['butt', 'round', 'square'];
const LINE_JOIN_STYLES = ['miter', 'round', 'bevel'];

// this is a slightly different parseFloat algo
const pf = value => {
  if (Number.isInteger(value)) {
    return value.toString();
  }

  const s = value.toFixed(10);
  let i = s.length - 1;

  if (s[i] !== '0') {
    return s;
  }

  do {
    i--;
  } while (s[i] === '0');

  return s.substring(0, s[i] === '.' ? i : i + 1);
};

const matrixToCoords = m => {
  return {
    position: {
      x: parseFloat(pf(m[4])),
      y: parseFloat(pf(m[5])),
    },
    scale: {
      x: parseFloat(pf(m[0])) || 1,
      y: parseFloat(pf(m[3])) || 1,
    },
    matrix: 'matrix('
      .concat(pf(m[0]), ' ')
      .concat(pf(m[1]), ' ')
      .concat(pf(m[2]), ' ')
      .concat(pf(m[3]), ' ')
      .concat(pf(m[4]), ' ')
      .concat(pf(m[5]), ')'),
    matrixArray: m,
  };
};

// tslint:disable
const convertImgDataToPng = (imgData, isMask) => {
  const PNG_HEADER = new Uint8Array([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]);
  const CHUNK_WRAPPER_SIZE = 12;
  const crcTable = new Int32Array(256);

  const ImageKind = {
    GRAYSCALE_1BPP: 1,
    RGB_24BPP: 2,
    RGBA_32BPP: 3,
  };

  for (let i = 0; i < 256; i++) {
    let c = i;

    for (let h = 0; h < 8; h++) {
      if (c & 1) {
        c = 0xedb88320 ^ ((c >> 1) & 0x7fffffff);
      } else {
        c = (c >> 1) & 0x7fffffff;
      }
    }

    crcTable[i] = c;
  }

  function crc32(data, start, end) {
    let crc = -1;

    for (let _i = start; _i < end; _i++) {
      const a = (crc ^ data[_i]) & 0xff;
      const b = crcTable[a];
      crc = (crc >>> 8) ^ b;
    }

    return crc ^ -1;
  }

  function writePngChunk(type, body, data, offset) {
    let p = offset;
    const len = body.length;
    data[p] = (len >> 24) & 0xff;
    data[p + 1] = (len >> 16) & 0xff;
    data[p + 2] = (len >> 8) & 0xff;
    data[p + 3] = len & 0xff;
    p += 4;
    data[p] = type.charCodeAt(0) & 0xff;
    data[p + 1] = type.charCodeAt(1) & 0xff;
    data[p + 2] = type.charCodeAt(2) & 0xff;
    data[p + 3] = type.charCodeAt(3) & 0xff;
    p += 4;
    data.set(body, p);
    p += body.length;
    const crc = crc32(data, offset + 4, p);
    data[p] = (crc >> 24) & 0xff;
    data[p + 1] = (crc >> 16) & 0xff;
    data[p + 2] = (crc >> 8) & 0xff;
    data[p + 3] = crc & 0xff;
  }

  function deflateSync(literals) {
    let input;

    if (parseInt(process.versions.node, 10) >= 8) {
      input = literals;
    } else {
      input = new Buffer(literals);
    }

    const output = require('zlib').deflateSync(input, {
      level: 9,
    });

    return output instanceof Uint8Array ? output : new Uint8Array(output);
  }

  function encode(imgData, kind, isMask) {
    const { width, height, data: bytes } = imgData;
    let bitDepth;
    let colorType;
    let lineSize;

    switch (kind) {
      case ImageKind.GRAYSCALE_1BPP:
        colorType = 0;
        bitDepth = 1;
        lineSize = (width + 7) >> 3;
        break;

      case ImageKind.RGB_24BPP:
        colorType = 2;
        bitDepth = 8;
        lineSize = width * 3;
        break;

      case ImageKind.RGBA_32BPP:
        colorType = 6;
        bitDepth = 8;
        lineSize = width * 4;
        break;

      default:
        throw new Error('invalid format');
    }

    const literals = new Uint8Array((1 + lineSize) * height);
    let offsetLiterals = 0;
    let offsetBytes = 0;

    for (let y = 0; y < height; ++y) {
      literals[offsetLiterals++] = 0;
      literals.set(bytes.subarray(offsetBytes, offsetBytes + lineSize), offsetLiterals);
      offsetBytes += lineSize;
      offsetLiterals += lineSize;
    }

    if (kind === ImageKind.GRAYSCALE_1BPP && isMask) {
      offsetLiterals = 0;

      for (let _y = 0; _y < height; _y++) {
        offsetLiterals++;

        for (let _i3 = 0; _i3 < lineSize; _i3++) {
          literals[offsetLiterals++] ^= 0xff;
        }
      }
    }

    const ihdr = new Uint8Array([
      (width >> 24) & 0xff,
      (width >> 16) & 0xff,
      (width >> 8) & 0xff,
      width & 0xff,
      (height >> 24) & 0xff,
      (height >> 16) & 0xff,
      (height >> 8) & 0xff,
      height & 0xff,
      bitDepth,
      colorType,
      0x00,
      0x00,
      0x00,
    ]);
    const idat = deflateSync(literals);
    const pngLength = PNG_HEADER.length + CHUNK_WRAPPER_SIZE * 3 + ihdr.length + idat.length;
    const data = new Uint8Array(pngLength);
    let offset = 0;
    data.set(PNG_HEADER, offset);
    offset += PNG_HEADER.length;
    writePngChunk('IHDR', ihdr, data, offset);
    offset += CHUNK_WRAPPER_SIZE + ihdr.length;
    writePngChunk('IDATA', idat, data, offset);
    offset += CHUNK_WRAPPER_SIZE + idat.length;
    writePngChunk('IEND', new Uint8Array(0), data, offset);
    return data;
  }

  const kind = imgData.kind === undefined ? ImageKind.GRAYSCALE_1BPP : imgData.kind;
  return encode(imgData, kind, isMask);
};

export {
  pf,
  matrixToCoords,
  convertImgDataToPng,
  IDENTITY_MATRIX,
  FONT_IDENTITY_MATRIX,
  LINE_CAP_STYLES,
  LINE_JOIN_STYLES,
};
