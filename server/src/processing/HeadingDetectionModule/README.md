# Lines to Paragraph Module

## Purpose

Create headings from a collection of paragraphs.

## What it does

It creates new heading elements by detecting headings lines from all lines contained in paragraphs.

## Dependencies

- [Lines to paragraph Module](../LinesToParagraphModule/README.md)

## How it works

It simply takes every line one by one of each paragraph and creates a heading if the satisfaction of at least one of the following criteria:

1.  Superior font size to the most common font size in the document.
2.  **Entirely bold lines**
3.  Title Case presence across the entire line - with the presence of at least one entirely non-numeric string token (a word).
4.  UPPER CASE presence across the entire line - with the presence of at least one entirely non-numeric string token (a word).

The level of headings is decided based on font size differences - the lines with the largest fonts become superior level headings.

## Accuracy

Almost perfect
