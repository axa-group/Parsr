
//
// Node tool to dump SVG output into a file.
//

const fs = require("fs");
const util = require("util");
const path = require("path");
const stream = require("stream");



// HACK few hacks to let PDF.js be loaded not as a module in global space.
require("./domstubs.js").setStubs(global);

// Run `gulp dist-install` to generate 'pdfjs-dist' npm package files.
const pdfjsLib = require("./pdfjsPatched/pdf.js");

// Some PDFs need external cmaps.
const CMAP_URL = "./pdfjsPatched/cmaps/";
const CMAP_PACKED = true;
const outputDirectory = "";


async function pdf2svg(pdfPath) {

  // Loading file from file system into typed array
  const data = new Uint8Array(fs.readFileSync(pdfPath));


  let SVG_PAGES = [];

  // Dumps svg outputs to a folder called svgdump
  function getFilePathForPage(pageNum) {
    const name = path.basename(pdfPath, path.extname(pdfPath));
    return pdfPath + `-${pageNum}.svg`;
  }

  /**
   * A readable stream which offers a stream representing the serialization of a
   * given DOM element (as defined by domstubs.js).
   *
   * @param {object} options
   * @param {DOMElement} options.svgElement The element to serialize
   */
  function ReadableSVGStream(options) {
    if (!(this instanceof ReadableSVGStream)) {
      return new ReadableSVGStream(options);
    }
    stream.Readable.call(this, options);
    this.serializer = options.svgElement.getSerializer();
  }

  util.inherits(ReadableSVGStream, stream.Readable);
  // Implements https://nodejs.org/api/stream.html#stream_readable_read_size_1
  ReadableSVGStream.prototype._read = function () {
    let chunk;
    while ((chunk = this.serializer.getNext()) !== null) {
      if (!this.push(chunk)) {
        return;
      }
    }
    this.push(null);
  };

  // Streams the SVG element to the given file path.


  function svgToString(svgElement) {
    let readableSvgStream = new ReadableSVGStream({
      svgElement,
    });

    return new Promise(function (resolve, reject) {
        const chunks = [];
        readableSvgStream.on('data', (chunk) => chunks.push(chunk));
        readableSvgStream.on('end', () => resolve(Buffer.concat(chunks).toString('utf8')));
        readableSvgStream.on('error', reject);
    }).catch(function (err) {
        readableSvgStream = null; // Explicitly null because of v8 bug 6512.
        throw err;
    });
}


  let mapFont = {};
  let imapFont = {};
  // Will be using async/await to load document, pages and misc data.
  const loadingTask = pdfjsLib.getDocument({
    data,
    cMapUrl: CMAP_URL,
    cMapPacked: CMAP_PACKED,
    fontExtraProperties: true,
  });

  const doc = await loadingTask.promise;
  const numPages = doc.numPages;


  for (let pageNum = 1; pageNum <= numPages; pageNum++) {
    try {
      const page = await doc.getPage(pageNum);
      const viewport = page.getViewport({ scale: 1.0 });

      const opList = await page.getOperatorList();
      const svgGfx = new pdfjsLib.SVGGraphics(
        page.commonObjs,
        page.objs,
        /* forceDataSchema = */ true
      );
      svgGfx.embedFonts = true;
      const svg = await svgGfx.getSVG(opList, viewport);
      SVG_PAGES.push(await svgToString(svg));
      // Release page resources.
      let objs=  page.commonObjs.objs
      for (let key in objs) {
        if (key.indexOf("_path") == -1) {
          let fobj = objs[key];
          if (fobj.data && fobj.data.name) {
            mapFont[fobj.data.name] = key;
            imapFont[key]=   mapFont[fobj.data.name] ;
          }
        }
      }
     
      page.cleanup();
    } catch (err) {
      console.log(`Error: ${err}`);
    }
  }


  return {
    fontMap : mapFont,
    invertedFontMap : imapFont,
    svg_pages : SVG_PAGES
  }
}

module.exports =pdf2svg