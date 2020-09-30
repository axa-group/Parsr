# Image Detection Module

## Purpose

The Image detection module detect images in a PDF document.

## What it does

It matches every image detected by the extractor to the correct image file and appends image URI to all image elements in the document.

## Dependencies

MuPDF: `mutool extract` is used to extract all image files from a PDF *when pdfminer is selected as pdf extractor*.

## Parameters

`ocrImages`: Allows to extract data from detected images using selected OCR. When `true`, all detected images will be replaced with data extracted by OCR.
`wordsImagesSource`: When `true`, all word extracted by OCR will have their propertie filled by the source of the original image.

## How it works

### with pdfminer:

1. It uses the name of every image (figure name) detected by PdfMiner and tries to match with a single image identifier extracted by 'dumppdf'.

```
//'Image17' will be used to match image XObject using dumppdf
<figure name="Image17" bbox="72.000,244.190,373.280,506.640">
<image width="301" height="262" />
</figure>
```

2. `dumppdf` dumps the internal contents of a PDF file in pseudo-XML format, using this data the module tries to match each figure name with an image file name.

```
<key>XObject</key>
<value><dict size="1">
<key>Image17</key>
<value><ref id="17" /></value> // '17' will be used to match a image file named 'img-0017' extracted by MuPDF
</dict></value>
```

### with pdfjs:

For the case of pdfjs extractor, the library used to extract texts from the document can also natively extract every image. So a re-execution of pdfjs extractor is done, but asking only for image data.

## Accuracy

Almost **perfect**.

## Limitations

- Images will not be reconstructed if an image detected by extractor (pdfMiner) is not extracted by Muttol extract command then
- Some PDF can use more than one image file (one alpha image with one background image) to generate one visual image in PDF, in that case the module will detect both images.
- The module depends on the selected pdf extractor to have any way of extracting images from the document.
- For now, only 'pdfminer' and 'pdfjs' can extract images information. So if you use another pdf extractor, the module will skip its execution and return an unmodified document.
