# Out of Page Removal Module

## Purpose

Removes all the elements of the page whose bounding boxes are not physically inside the page.

## What it does

It filters out only the elements which are inside the bounding boxes described in the page's `box` property.

## Dependencies

None

## How it works

It is a simple filter that checks if all the contents of `page.elements` for each page are inside the limits of the page described by `page.box`.

## Accuracy

Very high.
The boundaries of each page and element however, need to be correctly specified by the extractor.

## Limitations

None
