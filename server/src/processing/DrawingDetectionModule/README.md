# Drawing Detection Module

## Purpose

Groups SvgShapes into Drawings

## What it does

Converts all SvgShapes given by the extractor to a group of Drawings. Each Drawing is a set of Shapes that are visually together.

## Parameters

`mergeCloseLines`: When grouping lines into Drawings, this parameter tells the module to merge the vertical and horizontal lines that are visually close, with a tolerance defined in the next parameter.

`tolerance`: In pixels, the max separation value between 2 lines (in every direction) for them to be considered as one line when detecting/merging close lines. Only takes effect when mergeCloseLines is set to true.

## Dependencies

None

## How it works

It sweeps each document page with a vertical and a horizontal control line, finding separations between groups. 

## Accuracy

Very high.
The boundaries of each page and element however, need to be correctly specified by the extractor.

## Limitations

None
