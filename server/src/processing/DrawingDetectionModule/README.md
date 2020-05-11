# Drawing Detection Module

## Purpose

Groups SvgShapes into Drawings

## What it does

Converts all SvgShapes given by the extractor to a group of Drawings. Each Drawing is a set of Shapes that are visually together.

## Dependencies

None

## How it works

It sweeps each document page with a vertical and a horizontal control line, finding separations between groups. 

## Accuracy

Very high.
The boundaries of each page and element however, need to be correctly specified by the extractor.

## Limitations

None
