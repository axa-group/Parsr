# Table Detection Module

## Purpose

Table extraction from the PDF file.

## What it does

Given a pdf it generates for each table detected a `table` element containing an array of `tableRows`.

## Dependencies

- Third-party python library [Camelot](https://camelot-py.readthedocs.io/en/master/index.html)

## How it works

Given a table detected by Camelot this module fills `table` contents using and array of `tableRows` that are filled using an array of `tableCells` where each `tableCell` is filled by searching words in the document that are contained in cell bounds.

## Parameters

Following is an example of the configuration of the table-detection module:

```json
[
  "table-detection",
  {
        "checkDrawings": true,
        "runConfig": [
          {
            "pages": [1, 2, 3], // or [] for all pages
            "flavor": "lattice",
            "table_areas": []
          }
        ]
  }
]
```
- checkDrawings: Boolean value to specify if the module should look for table candidates using the previously detected Drawings. Default: true,
- runConfig: Array of different configurations for the doc
  - pages: List of numbers representing pages.
  - flavor: The parsing method to use ('lattice' or 'stream'). Lattice is used by default. For more information on each parsing method, [check this information](https://camelot-py.readthedocs.io/en/master/user/how-it-works.html).
  - table_areas: Array of coordinates forming a box to indicate the position of a table with no outlines or visible borders.
  Each table_area is a string of the form "x1,y1,x2,y2" where (x1, y1) -> top-left and (x2, y2) -> bottom-right in PDF coordinate space. In PDF coordinate space, the bottom-left corner of the page is the origin, with coordinates (0, 0).
  **This parameter is optional and only used with 'stream' flavor.**
  For more information on table_areas param, feel free to check [the camelot documentation](https://camelot-py.readthedocs.io/en/master/user/advanced.html#specify-table-areas).

## Accuracy

The accuracy is high.

## Limitations

- Only works with text-based PDFs and not scanned documents.
