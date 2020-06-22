# Page Number Detection Module

## Purpose

Detects the page number for each page in a document.

## What it does

Searches for "number" paragraphs outside the page margins, and sets the 'isPageNumber' property to each matched paragraph in the document.

## Dependencies

- [Header Footer Detection](../HeaderFooterDetectionModule/README.md)

## Limitations

This module relies on *accurate page margins* set by the Header Footer Detection Module.