# Parsr - Fix PDF Font

**Parsr-fix-pdf-font** is a utility designed specifically to remedy broken unicode maps for PDF fonts. Issues with broken unicode maps can arise due to various reasons, including incomplete or corrupt font embedding, or issues during the PDF creation process. Such problems can render text in a PDF file unreadable or undecipherable.

This tool leverages Tesseract.js, an optical character recognition engine, to recognize the broken glyphs present in the PDF. Once these glyphs are identified, **Parsr-fix-pdf-font** rebuilds the unicode map, ensuring that the PDF becomes readable and retains its original design and layout.

## Features

- OCR Powered Correction: Uses Tesseract.js to perform Optical Character Recognition on the broken glyphs, ensuring accurate text representation.

- Rebuilding Unicode Maps: After identifying the incorrect mappings, the tool regenerates the correct unicode map, preserving the original design of the PDF.

- Easy-to-Use Command Line Interface: Simplified command line usage for quick fixes.

## Requirements

nodejs >18

ImageMagick Convert


## Usage
Use the command line interface to run the Parsr tool:

```sh
cd parsr-fix-pdf-font
node parsr-fix-pdf-font.js --input ./test/testPage.pdf --output pdf.pdf --lang eng
```

Parameters:

- --input <path-to-pdf>: Specifies the path to the source PDF file that needs to be fixed.
- --ouput <path-to-out-pdf>: Designates the path where the fixed PDF will be saved. If the specified file already exists, it will be overwritten.
- --lang eng: Sets the language for the OCR process. By default, it's set to English (eng). Tesseract supports multiple languages, so ensure you choose the appropriate one for your document.
 
## Troubleshooting
If you encounter any issues:

Inspect PDF: Ensure that the PDF isn't password protected or encrypted. If it is, decrypt it before running the tool.

Language Mismatch: If the OCR isn't accurate, ensure you've chosen the correct language setting for the document.

## Limits

Tesseract OCR is not really good on single Glyph, but at least the text is readable / understandable for an LLM.

We do not reconstruct the XREF table yet. Using a tool like ```mutools clean ``` will allow you to fix them if needed.

## Contribution
Parsr is an open-source tool. Contributions in the form of bug reports, feature requests, or code are always welcome. Check our GitHub repository for more details.

