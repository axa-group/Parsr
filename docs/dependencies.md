# Parsr Dependencies

This page lists all of the dependencies of Parsr and what they are used for.

- [Parsr Dependencies](#parsr-dependencies)
  - [1. Base Dependencies](#1-base-dependencies)
  - [2. Extraction Dependencies](#2-extraction-dependencies)
  - [3. Optional Dependencies](#3-optional-dependencies)
  
## 1. Base Dependencies

The following _required_ dependencies need to be installed for Parsr to work properly:

1. `node.js` : The underlying framework upon which the platform is built.
2. `qpdf` : For reading password-protected PDFs.
3. `imagemagick` : For converting between file formats.

## 2. Extraction Dependencies

Depending upon the type of documents to be treated by the platform, one or multiple of the following dependencies should be installed.

If simple PDFs containing digital (or _selectable_) textual elements are to be fed into the system, the **`pdfminer`** library needs to be installed.

If images (`jpg`, `png`, `tiff`, etc.) are to be used with the tool, then the tool also supports the use of the following two OCR based solutions as an underlying extraction module:

1. **`tesseract`** : Open source, support for over ~100 languages, Google's Tesseract is a free, on premise OCR solution. However, text formatting, or tabular data is not detected.
2. **`ABBYY FineReader Server`** : Proprietary OCR solution with extremely high recognition accuracy, formatting recognition and tabular data extraction. It is an optional dependency.

## 3. Optional Dependencies

The following _optional_ dependencies may to be installed:

1. `mupdf-tools`: For error-correcting corrupt PDFs at input.
2. `pandoc`: Generate PDF files from an intermediate Markdown output after the cleaning operation in the pipeline.
