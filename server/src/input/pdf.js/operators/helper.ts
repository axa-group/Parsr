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
    matrix: "matrix("
      .concat(pf(m[0]), " ")
      .concat(pf(m[1]), " ")
      .concat(pf(m[2]), " ")
      .concat(pf(m[3]), " ")
      .concat(pf(m[4]), " ")
      .concat(pf(m[5]), ")"),
    matrixArray: m,
  };
};

export {
  pf,
  matrixToCoords,
  IDENTITY_MATRIX,
  FONT_IDENTITY_MATRIX,
};
