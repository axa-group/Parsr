# Link Detection Module

## Purpose

The Link detection module detects URLs, GoTo and mailto links inside PDF metadata and it's text contents.

## What it does

It adds the property `targetURL` to the matching Words.

## Dependencies

None.

## How it works

1. It uses pdfminer's `dumppdf` utility and `xml-stream` library to process document metadata as XML and find links with their bounding boxes and page number.
2. Also for each word on document it uses two RegExp to match URL's or emails as strings and also set their `targetURL`

## Accuracy

All correctly detected links from the extractor are well preserved, and the accuracy can thus be reported to be _pretty good_.

## Limitations

- Any 'Action' type link inside metadata is ignored for now. (Can't match their respective bounding boxes).
