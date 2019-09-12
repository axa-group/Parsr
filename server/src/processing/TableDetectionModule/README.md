# Table Detection Module

## Purpose

Table extraction from the PDF file.

## What it does

Given a pdf it generates for each table detected a `table` element containing an array of `tableRows`.

## Dependencies

- Third-party phyton library [Camelot](https://camelot-py.readthedocs.io/en/master/index.html)

## How it works

Given a table detected by Camelot this module fills `table` contents using and array of `tableRows` that are filled using an array of `tableCells` where each `tableCell` is filled by searching words in the document that are contained in cell bounds.

## Parameters

Following is an example of the configuration of the table-detection module:

```json
[
	"table-detection",
	{
		"pages": "all",
		"flavor": "lattice"
	}
]
```

- pages: Comma-separated page numbers. Example: '1,3,4' or '1,4-end' or 'all'. Default is '1'.
- flavor: The parsing method to use ('lattice' or 'stream'). Lattice is used by default.

## Accuracy

The accuracy is high.

## Limitations

- Only works with text-based PDFs and not scanned documents.
- Currently we can not configure this module to use a specific configuration for each page.
