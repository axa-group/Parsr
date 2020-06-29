# Table of Contents Detection Module

## Purpose

Detects and extracts tables of content from the PDF file.

## What it does

Given a pdf it generates a `TableOfContent` element containing an array of `TableOfContentItem`'s with info for each item.

## How it works

Searches for keywords and specific paragraph formats and then extracts the info from each detected paragraph with Regular Expressions

## Parameters

Following is an example of the configuration of the table-of-contents-detection module:

```json
[
  "table-of-contents-detection",
  {
    "pageKeywords": [
      "pag",
      "pagina",
      "page,
    ]
  }
]
```

- pageKeywords: Optional. Array of "page" string to prepend and search for TOC items with format "page X - Section A". 
  Defaults to "pag".

## Accuracy

The accuracy is high on one-column documents.
