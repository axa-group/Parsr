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

const fs = require('fs/promises');
const Tesseract = require('tesseract.js');


const {execSync} = require('child_process');
const { existsSync } = require('fs');

const opentype = require('opentype.js');
const getFontDataFromPDF = require('./getFontDataFromPDF.js');
const getDefectiveFontsInfoFromPDF = require('./getDefectiveFontsInfoFromPDF.js')
const pdf2svg = require('./pdf2svg.js');

let TMP = 0;
let TesseractWorker = null;

async function extractAndCorrectFontsFromPDF(target, outputFile, lang, TMP_DIR=`${__dirname}/tmp`) {
  // should use path
  let tmp_name = TMP++ + '_' + target.split('/').pop();


  function noLog(m) { return}
  TesseractWorker = await Tesseract.createWorker();
  await TesseractWorker.loadLanguage(lang);
  await TesseractWorker.initialize(lang);
  await TesseractWorker.setParameters({
    tessedit_pageseg_mode: Tesseract.PSM.SINGLE_CHAR,
  });
  // remove PDF passowrd
  // gs -q -dNOPAUSE -dBATCH -sDEVICE=pdfwrite -sOutputFile=unencrypted.pdf -c .setpdfwrite -f encrypted.pdf

  // clean pdf - mutool clean will deserialize the stream, making it parsable
  // ! execSync(`mutool clean -d ${target} ${TMP_DIR}/${tmp_name}`)

  execSync(`cp  ${target} ${TMP_DIR}/${tmp_name}`)
  let pdf = await getFontDataFromPDF( await fs.readFile(`${TMP_DIR}/${tmp_name}`, 'binary'));
 
  // extract Font
  let fonts = await getDefectiveFontsInfoFromPDF(pdf);

  let svgData = await pdf2svg(`${TMP_DIR}/${tmp_name}`);

  let fontMap = svgData.fontMap;
  let invertedFontMap = svgData.invertedFontMap;

  let i = 1;
  for (let svg of svgData.svg_pages) {
    // new Uint8Array(await fs.readFile(pdfPath))
    const fontRegex = /font-face { font-family: &quot;([\s\S]*?)&quot;; src: url\(data:font\/opentype;base64,([\s\S]*?)\)/gm;
          
    let match;
    const matches = [];
    while ((match = fontRegex.exec(svg)) !== null) {
      let fontName = match[1].trim();
      let fontData = match[2].trim();
      let buff = new Buffer(fontData, 'base64');

      // TODO : Remove it after use
      await fs.writeFile(`${TMP_DIR}/${tmp_name}_font_${invertedFontMap[fontName]}.ttf`, buff);
    }
    ++i;
  }
  
 

  
  for (let font of fonts) {
    await fixAFont(font, fontMap, TMP_DIR, pdf, tmp_name);
  }


  await fs.writeFile(outputFile, pdf.blocks.join('\n'), 'binary');


 // ! execSync(`mutool clean -d ${target}-readeable.pdf ${target}-readeable.pdf`);
   execSync(`rm -fr ${TMP_DIR}/${tmp_name}*`);

  TesseractWorker.terminate();

  return `${TMP_DIR}/pdf-fixedFont.pdf`;

}

function toFourCharHex(num) {
  let hex = num.toString(16).toUpperCase(); // Convert to hexadecimal and make it uppercase
  while (hex.length < 4) {
      hex = '0' + hex; // Pad with leading zeros
  }
  return hex;
}

function toTwoCharHex(num) {
  let hex = num.toString(16).toUpperCase(); // Convert to hexadecimal and make it uppercase
  while (hex.length < 2) {
      hex = '0' + hex; // Pad with leading zeros
  }
  return hex;
}



async function getGlyphIndex(fontName, character) {
  let font = await opentype.load(fontName)
  const glyph = font.charToGlyph(character);
  return glyph.index;
}

async function getGlyphPoints(fontName) {
  let font = await opentype.load(fontName)


  let points = [];
  for (let glyphCode in font.glyphs.glyphs) {
    let glyph = font.glyphs.glyphs[glyphCode];
    if (glyph.unicode) {
      points.push(glyph.unicode);
    }
  }

  return points;
}


async function fixAFont(font, fontMap, TMP_DIR, pdf, tmp_name) {

  let fontFile = `${TMP_DIR}/${tmp_name}_font_${fontMap[font.info.keyMap.FontName]}.ttf`;

  let pointList = await getGlyphPoints(fontFile); 
 
  // TODO : Renmove after use
  if (!existsSync(`${fontFile}_images`)) {
    await fs.mkdir(`${fontFile}_images`)
  }


  let CMAP = [];
  let str = "";
  let rst = "";

  for (let item of pointList) {
    if (!item || item < 32) {
      continue;
    }
    if (item == 34) {
      str += '\\' + String.fromCodePoint(item);
      
    }
    else {
      str += String.fromCodePoint(item);
      
    }
  }



  let itemId = 0;
  for (let item of pointList) {
    if (!item || item <= 32) {
      continue;
    }
    let theSTR = "";
    if (item == 34) {
      theSTR += '\\' + String.fromCodePoint(item);
      
    }
    else {
      theSTR += String.fromCodePoint(item);
    }
    //theSTR += str;
    
    let cmd = `convert -background white -fill black -bordercolor white -border 10x10 -font ${fontFile} -kerning 92 -pointsize 32 label:"${theSTR}" ${fontFile}_image.png`;
    execSync(cmd);
  
        
    const { data: { text } } = await TesseractWorker.recognize( `${fontFile}_image.png`);
    let ocrResult = text.trim();
  



    
    let char = ocrResult;
    if (char !== undefined) {
      let c = await getGlyphIndex(fontFile, String.fromCodePoint(item));
      CMAP.push([c, char, item]);
    }
    //console.log(c,char )
  }

  if (!CMAP.length) {
    return;
  }


let CMAP_TEMPLATE = 
`/CIDInit /ProcSet findresource begin
12 dict begin
begincmap
/CIDSystemInfo
<< /Registry (Adobe)
  /Ordering (UCS)
  /Supplement 0
>> def
/CMapName /Adobe-Identity-UCS def
/CMapType 2 def
1 begincodespacerange
<${toFourCharHex(CMAP[0][0])}><${toFourCharHex(CMAP[CMAP.length -1][0])}>
endcodespacerange
${CMAP.length} beginbfchar
${await CMAP.map( (item, index) => {
    return `<${toFourCharHex(item[0])}><${item[1].split('').map(
        (a) => toFourCharHex( a.charCodeAt(0) || 0 )
      ).join('') || '0000'
    }>`}).join('\n')
}
endbfchar
endcmap
CMapName currentdict /CMap defineresource pop
end
end`;


  let objId = ++pdf.maxID;


  // replace buggy font unicode map
  if (font.parent && font.parent.keyMap.ToUnicode) {
    objId = parseInt(font.parent.keyMap.ToUnicode)
  } else if (font.info.keyMap.ToUnicode) {
    objId = parseInt(font.info.keyMap.ToUnicode)
  } 
  let obj = 
`
${objId} 0 obj
<<
/Length ${CMAP_TEMPLATE.length}
>>
stream
${CMAP_TEMPLATE}

endstream
endobj
`;

  if (font.parent && font.parent.keyMap.ToUnicode) {
    pdf.blocks.splice(pdf.blocksMap[objId + '-0'].blockIndex, 1, obj);
  } else if (font.info.keyMap.ToUnicode) {
    pdf.blocks.splice(pdf.blocksMap[objId + '-0'].blockIndex, 1, obj);
  } else {
    pdf.blocks.splice(pdf.blocks.length - 1, 0, obj);
  }
}
module.exports = extractAndCorrectFontsFromPDF;