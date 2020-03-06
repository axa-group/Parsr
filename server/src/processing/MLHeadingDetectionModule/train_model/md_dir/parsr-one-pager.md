# Parsr: Turn your documents into data!

Parsr allows a data scientist, an analyst, a developer, or an enthusiast to automatically obtain structured data from a compiled PDF or an image or scanned document. It is a minimal-footprint document cleaning, parsing and extraction toolchain which generates readily available, organized and usable data for data scientists and developers.

Currently, Parsr has (but is not limited to) the following features:

1. Text Order Detection
2. Page Number Detection
3. Header-Footer Detection
4. Table Detection and Reconstruction
5. Named Entity Recognition (Dates, Percentages, etc)
6. Key-Value Pair Detection (for the extraction of specific form-based entries)
7. Link Detection
8. Heading Detection
9. Document Hierarchy Regeneration (Words, Lines and Paragraphs)
10. Whitespace Removal, etc

Furthermore, the pipeline is extensible and one’s own module can be easily introduced. Parsr’s pipeline’s backbone is based on Typescript, but it can easily be extended using modules plugging into tools built from flavors like Python or Haskell.

Parsr supports a choice among multiple extraction engines for each type of input. Parsr extracts textual data from PDF files using pdftojson and from images using OCR adapters such as tesseract. The user even has the choice to use the proprietary ABBYY FineReader solution for using a professional grade OCR as the backend for enhanced text recognition precision.

Parsr provides users with clean, structured and label-enriched information set. The output (formatted as a friendly, documented JSON file) can possibly contain data with fine granularity (bounding boxes for each letter of each word), to relatively low frequency details like the sizes and margins of each page.  
The user can also generate outputs in the formats of Markdown, Raw Text, PDF, CSV (for tabular data), and others. New output formats can also be easily generated using an extensible output module system for easy extensibility.

The Parsr toolchain’s open-source dependency set is minimal: node.js, qpdf, mupdf-tools, imagemagick, tesseract, pdf2json, pandoc and camelot. An optional proprietary dependency ABBYY FineReader is equally supported.

The ready-to-use applications range from data entry and document analysis automation, archival, and many others.  
Furthermore, it is free and open source!  
*Parsr was built by the community using community-made tools for the community itself. Delve right in; check it out and help improve this version 0\.1 making Parsr the standard for data extraction from documents!*

Internal
