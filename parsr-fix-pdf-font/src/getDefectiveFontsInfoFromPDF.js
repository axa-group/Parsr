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
// Go accros a pre parse PDF and find the font with no TOUnicode (likely buggy)
async function getDefectiveFontsInfoFromPDF(pdf) {
  //console.log(pdf);
  let fontList = [];
  let parentList = {};

  for (let key in pdf.blocksMap) {
    let data = pdf.blocksMap[key];
  
    if (data.keyMap.Type == 'Font') {
  
      if (data.keyMap.DescendantFonts) {
        let descendantID = parseInt(data.keyMap.DescendantFonts[0]);
        parentList[descendantID] = data;
      }
  
      if (!data.keyMap.ToUnicode && data.keyMap.FontDescriptor && data.keyMap.FontDescriptor != "Encoding") {
      
        let fd = pdf.blocksMap[parseInt(data.keyMap.FontDescriptor) + '-' + parseInt(data.keyMap.FontDescriptor.replace(parseInt(data.keyMap.FontDescriptor), ''))];
        
        if (fd.keyMap.FontFile2 || fd.keyMap.FontFile3) {
          let fontFile = fd.keyMap.FontFile2 || fd.keyMap.FontFile3;
          let ff = pdf.blocksMap[parseInt(fontFile) + '-' + parseInt(fontFile.replace(parseInt(fontFile), ''))];
         
          // todo : Extract Fonts!


          fontList.push({
            info: fd,
            fontInfo : data,
            fontName : `font-${parseInt(fontFile)}.ttf`
          })
        }
      }
    }
  }

  for (let font of fontList) {
    if (parentList[font.fontInfo.blockId]) {
      font.parent = parentList[font.fontInfo.blockId];
    }
  }


  return fontList;
}


module.exports = getDefectiveFontsInfoFromPDF;