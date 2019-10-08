# Lines to Paragraph Module

## Purpose

Create paragraphs from a collection of lines.

## What it does

It creates new paragraph elements that contains arrays of line elements.

## Dependencies

[Words to Lines](words-to-line-module.md)
[Reading Order Module](reading-order-module.md)

## How it works

It simply takes every line one by one according to the reading order and stops and loops if the next line is on another paragraph.

## Accuracy

Almost perfect

## Limitations

- It depends on the reading order detection quality
- To detect the space between paragraphs, it's currently using an heuristics and doesn't detect automatically according the the interline. So if a paragraph have a large interline spacing, the algo may fail and create one paragraph per line. That said, this rarely occures according to our experience.
