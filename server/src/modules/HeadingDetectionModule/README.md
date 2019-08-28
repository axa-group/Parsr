# Heading Detection Module

## Purpose

Detects the headings in a document, given that it already contains Paragraphs, Lines and Words, along with formatting (font size, weight, etc) information.

## What it does

Creates new `heading` element types, representing a derivative of Paragraph types, which represent the title of the document, chapter or a (sub)section.

## Dependencies

[Lines To Paragraph Module](lines-to-paragraph-module.md)

## How it works

- Firstly, the algorithm computes the most used font, font size and font style among all the detected fonts of a document.
- Then, the algorithm allots a weighted score to all the paragraphs who do not exhibit the most used style.
- Finally, each higher of the candidates from the second step are promoted to headings, which are super-set element types over paragraphs.

## Accuracy

The overall accuracy is variable.

## Limitations

- If the fonts of a document are well detected and coherent with the ground truth, the quality of the heading detection will be high.
- Currently, only the size difference is used to threshold/detect the headings of a document.
- Certain detection extractors (like pdf2json) produce variable quality results for font detection.
