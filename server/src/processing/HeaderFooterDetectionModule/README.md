# Header Footer Detection Module

## Purpose

Detect the header and footer areas in a document, and set the appropriate properties of all the elements contained within those areas.

## What it does

Sets the `isHeader` or `isFooter` property flags for each one of the elements detected as headers or footers respectively in the detected areas.

## Dependencies

[Lines To Paragraph Module](../LinesToParagraphModule/README.md)

## How it works

- It detects empty (or white) horizontal bands across the entire document (all pages), which do not contain an element.
- For the footer, the highest of these such bands, not exceeding the value L from the bottom is retained as the footer dividing line.
- For the header, the lowest of these bands is retained using the same algorithm, except that the distance is calculated form the top of the pages.
- The algorithm also detects page number mentions using regexp based matching inside the elements classified as headers or footers.

## Parameters

The following two parameters are available:

1. `maxMarginPercentage`: The percentage of the page up to which (both from the top and the bottom) the algorithm will search for header or footer classification.
2. `ignorePages`: The list of pages to be ignored in the header/footer search.
   This typically includes book titles, table of contents, preface, and other pages which do not typically have the same header/footer layout as the rest of the document.
3. `similaritySizePercentage`: The percentage represent the difference of size between pages. This allow to apply the maxMarginPercentage option within groups of pages of similar size. 

## Accuracy

Given a good `maxMarginPercentage`, very good.
The accuracy is directly proportional to the number of pages (samples) available to the algorithm.

## Limitations

- An omittance of non-useful pages (like the title page) in the `ignoredPages` list can produce a false negative.
