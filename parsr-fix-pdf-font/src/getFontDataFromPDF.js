/**
 * Copyright 2023 AXA Group Operations S.A.
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
// a rudimentary parser that try to extract font data from a PDF
async function getFontDataFromPDF(target) {

  let lines = target.split('\n');
  let blocks  = [];
  let blocksMap = {};
  let currentBLock = null;
  let maxID = 0;

  let lastObjId = 0;
  for (let line of lines) {
    // % denote a comemnt block
    let testObjStart = /^[0-9]+ [0-9]+ obj$/m
    if (testObjStart.test(line)) {
      currentBLock = [];

    }
    if (!currentBLock) {
      blocks.push(line);
      continue;
    }
    currentBLock.push(line);

    if (line == "endobj") {
      let cBlock = currentBLock.join('\n');
      blocks.push(cBlock);
      lastObjId = blocks.length - 1;
      currentBLock = null;
      // block header = 
      // let blockHeaderRegexp = /<<(?:\s*\/([a-zA-Z0-9+]+)\s+((?:[^\/<<>>]+|(?:<<[^<<>>]*>>))*))*\s*>>/m
      
      const regex = /\/([a-zA-Z0-9+_\-]+)\s+((?:[^\/<<>>]+|(?:<<[^<<>>]*>>))*)/g;
      let match;
      const resultMap = {};

      let prevKey = null;
      while ((match = regex.exec(cBlock)) !== null) {
        const key = match[1];
        let value = match[2].trim();
        if (value.startsWith('[') && value.endsWith(']')) {
          value = value.slice(1, -1).trim().split(/\s+/);
        }
//        resultMap[key] = value;
        
        if (!value && prevKey && !prevKey.value) {
          resultMap[prevKey] = key;
          prevKey = null;
        }
        else if (!value) {
          resultMap[key] = value;
          prevKey = key;
        }
        else {
          resultMap[key] = value;
          prevKey = null;
        }

        
      }
      if (parseInt(cBlock) > maxID) {
        maxID = parseInt(cBlock);
      }
      blocksMap[parseInt(cBlock) + '-' + parseInt(cBlock.replace(parseInt(cBlock), ''))] = {
        keyMap : resultMap,
      //  block : cBlock,
        blockIndex: lastObjId,
        blockId : parseInt(cBlock),
        blockVersion :  parseInt(cBlock.replace(parseInt(cBlock), ''))
      };
    }
  }

  return {
    blocks : blocks,
    blocksMap : blocksMap,
    maxID : maxID,
    lastObjId: lastObjId
  };
}


module.exports = getFontDataFromPDF;