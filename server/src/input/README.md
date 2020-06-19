# Input Modules

The Input modules in Parsr perform the initial role of importing the raw data from the input files.
Each module performs on a particular type of input files, and generate different results.
Each module may or may not contain a set of configurable parameters, which (along with the usage documentation) can be consulted in the per-module documentation pages below.
Each module returns a valid `Document` object with an array of `Words` for each parsed `Page`.

## The Modules

1. [Pdfminer](pdfminer/README.md)
2. [PDF.js](pdf.js/README.md)
3. [Tesseract](tesseract/README.md)
4. [Google Vision](google-vision/README.md)
5. [Amazon Textract](amazon-textract/README.md)
6. [MS Cognitive Services](ms-cognitive-services/README.md)
7. [ABBYY](abbyy/README.md)
8. [JSON](json/README.md)
9. [MS Word](doc/README.md)
10. [Email](email/README.md)

## Supported input formats

Currently, the following file formats are available for Parsr:

<table>
  <style>
    td, th {
      text-align: center;
      font-weight: bold;
    }
    .yes {background: lightgreen; }
    .no { background: #FF4040; }
  </style>
  <tr>
    <th rowspan="2">Input format</th>
    <th colspan="8">Input modules</th>
  </tr>
  <tr>
    <td>Pdfminer</td>
    <td>pdf.js</td>
    <td>ABBYY</td>
    <td>Tesseract</td>
    <td>JSON Extractor</td>
    <td>Google Vision</td>
    <td>Amazon Textract</td>
    <td>MS Cognitive Services</td>
  </tr>
  <tr>
    <td>.pdf</td>
    <td class="yes" />
    <td class="yes" />
    <td class="yes" />
    <td class="yes" />
    <td class="no" />
    <td class="no" />
    <td class="no" />
    <td class="no" />
  </tr>
  <tr>
    <td>.docx</td>
    <td class="yes" />
    <td class="yes" />
    <td class="yes" />
    <td class="yes" />
    <td class="no" />
    <td class="no" />
    <td class="no" />
    <td class="no" />
  </tr>
  <tr>
    <td>.eml</td>
    <td class="yes" />
    <td class="yes" />
    <td class="yes" />
    <td class="yes" />
    <td class="no" />
    <td class="no" />
    <td class="no" />
    <td class="no" />
  </tr>
  <tr>
    <td>.tiff</td>
    <td class="no" />
    <td class="no" />
    <td class="yes" />
    <td class="yes" />
    <td class="no" />
    <td class="yes" />
    <td class="yes" />
    <td class="yes" />
  </tr>
  <tr>
    <td>.png</td>
    <td class="no" />
    <td class="no" />
    <td class="yes" />
    <td class="yes" />
    <td class="no" />
    <td class="yes" />
    <td class="yes" />
    <td class="yes" />
  </tr>
  <tr>
    <td>.jpeg</td>
    <td class="no" />
    <td class="no" />
    <td class="yes" />
    <td class="yes" />
    <td class="no" />
    <td class="yes" />
    <td class="yes" />
    <td class="yes" />
  </tr>
  <tr>
    <td>.json</td>
    <td class="no" />
    <td class="no" />
    <td class="no" />
    <td class="no" />
    <td class="yes" />
    <td class="no" />
    <td class="no" />
    <td class="no" />
  </tr>
  <tr>
    <td>.xml</td>
    <td class="no" />
    <td class="no" />
    <td class="yes" />
    <td class="no" />
    <td class="no" />
    <td class="no" />
    <td class="no" />
    <td class="no" />
  </tr>
</table>

This means that for processing a pdf file, 4 extractors can be chosen: pdfminer, pdf.js, ABBYY or Tesseract.

**Note:** *not all extractors share the same functionality or return the same information, so one should check for the best extractor given the use case.*  

**Note:** *when using a json or xml file as input, extractor configuration will be ignored as there is currently only one extractor for each of this formats.*
