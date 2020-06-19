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
  <tr>
    <th rowspan="2">Input format</th>
    <th colspan="8">Input modules</th>
  </tr>
  <tr>
    <td style="text-align:center; font-weight: bold">Pdfminer</td>
    <td style="text-align:center; font-weight: bold">pdf.js</td>
    <td style="text-align:center; font-weight: bold">ABBYY</td>
    <td style="text-align:center; font-weight: bold">Tesseract</td>
    <td style="text-align:center; font-weight: bold">JSON Extractor</td>
    <td style="text-align:center; font-weight: bold">Google Vision</td>
    <td style="text-align:center; font-weight: bold">Amazon Textract</td>
    <td style="text-align:center; font-weight: bold">MS Cognitive Services</td>
  </tr>
  <tr>
    <td style="text-align:center; font-weight: bold">.pdf</td>
    <td style="background: lightgreen" />
    <td style="background: lightgreen" />
    <td style="background: lightgreen" />
    <td style="background: lightgreen" />
    <td style="background: #FF4040" />
    <td style="background: #FF4040" />
    <td style="background: #FF4040" />
    <td style="background: #FF4040" />
  </tr>
  <tr>
    <td style="text-align:center; font-weight: bold">.docx</td>
    <td style="background: lightgreen" />
    <td style="background: lightgreen" />
    <td style="background: lightgreen" />
    <td style="background: lightgreen" />
    <td style="background: #FF4040" />
    <td style="background: #FF4040" />
    <td style="background: #FF4040" />
    <td style="background: #FF4040" />
  </tr>
  <tr>
    <td style="text-align:center; font-weight: bold">.eml</td>
    <td style="background: lightgreen" />
    <td style="background: lightgreen" />
    <td style="background: lightgreen" />
    <td style="background: lightgreen" />
    <td style="background: #FF4040" />
    <td style="background: #FF4040" />
    <td style="background: #FF4040" />
    <td style="background: #FF4040" />
  </tr>
  <tr>
    <td style="text-align:center; font-weight: bold">.tiff</td>
    <td style="background: #FF4040" />
    <td style="background: #FF4040" />
    <td style="background: lightgreen" />
    <td style="background: lightgreen" />
    <td style="background: #FF4040" />
    <td style="background: lightgreen" />
    <td style="background: lightgreen" />
    <td style="background: lightgreen" />
  </tr>
  <tr>
    <td style="text-align:center; font-weight: bold">.png</td>
    <td style="background: #FF4040" />
    <td style="background: #FF4040" />
    <td style="background: lightgreen" />
    <td style="background: lightgreen" />
    <td style="background: #FF4040" />
    <td style="background: lightgreen" />
    <td style="background: lightgreen" />
    <td style="background: lightgreen" />
  </tr>
  <tr>
    <td style="text-align:center; font-weight: bold">.jpeg</td>
    <td style="background: #FF4040" />
    <td style="background: #FF4040" />
    <td style="background: lightgreen" />
    <td style="background: lightgreen" />
    <td style="background: #FF4040" />
    <td style="background: lightgreen" />
    <td style="background: lightgreen" />
    <td style="background: lightgreen" />
  </tr>
  <tr>
    <td style="text-align:center; font-weight: bold">.json</td>
    <td style="background: #FF4040" />
    <td style="background: #FF4040" />
    <td style="background: #FF4040" />
    <td style="background: #FF4040" />
    <td style="background: lightgreen" />
    <td style="background: #FF4040" />
    <td style="background: #FF4040" />
    <td style="background: #FF4040" />
  </tr>
  <tr>
    <td style="text-align:center; font-weight: bold">.xml</td>
    <td style="background: #FF4040" />
    <td style="background: #FF4040" />
    <td style="background: lightgreen" />
    <td style="background: #FF4040" />
    <td style="background: #FF4040" />
    <td style="background: #FF4040" />
    <td style="background: #FF4040" />
    <td style="background: #FF4040" />
  </tr>
</table>

This means that for processing a pdf file, 4 extractors can be chosen: pdfminer, pdf.js, ABBYY or Tesseract.

**Note:** *not all extractors share the same functionality or return the same information, so one should check for the best extractor given the use case.*  

**Note:** *when using a json or xml file as input, extractor configuration will be ignored as there is currently only one extractor for each of this formats.*
