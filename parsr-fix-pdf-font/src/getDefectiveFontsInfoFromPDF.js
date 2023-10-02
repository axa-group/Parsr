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