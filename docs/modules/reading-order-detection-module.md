# Reading Order Module

## Purpose

Detect the reading order of the document.

## What it does

It adds the `order` property on every element of the page. Elements can then be sorted according to this property.

## Dependencies

None

## How it works

It's based on a XY-cut approach with some optimization.

First, the algorithm will try to find possible vertical cuts in the page between elements. Then, it will perform cuts and try to find possible horizontal cuts in the left part, then the right part. For horizontal cuts, the algorithm will re-assemble blocks if there's some common vertical cuts. This improvement has been made to avoid splitting two columns of text of every line, by choo.

## Accuracy

Good

## Options

minColumnWidthInPagePercent : The minimal column width in % of the page width
minVerticalGapWidth : The minimal gap width in points

## Limitations

- It sometimes fails if bounding boxes are too far from each others.
- It doesnt' work for right to left languages, but can be readapted easily in the code by inverting some functions and sorts.
- It doesn't work when there's a column are in an L shape.
