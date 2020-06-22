# Drawing Detection Module

## Purpose

Groups SvgShapes into Drawings

## What it does

Converts all SvgShapes given by the extractor to a group of Drawings. Each Drawing is a set of Shapes that are visually together.

The module only modifies the document defined in the `drawingsFile` property, and **not the original document**. This is because of a decision we took to move Drawings information away from the input document, as it can heavily increase the file size.

## Parameters

None

## Dependencies

The module will look for a json file in the `drawingsFile` property of the document, containing the required information to build the Drawings. This file must be created in the extraction step of the process. If this file is not found or contains an invalid JSON format, the module execution will finish and the drawings document will not be modified.

## How it works

It sweeps each document page with a vertical and a horizontal control line, finding separations between groups. 

## Accuracy

Very high.
The boundaries of each page and element however, need to be correctly specified by the extractor.

## Limitations

None
