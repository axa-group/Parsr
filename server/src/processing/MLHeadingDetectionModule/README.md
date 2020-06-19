# ML Heading Detection Module

## Purpose

Create headings from a collection of paragraphs.

## What it does

It creates new heading elements by detecting headings lines from all lines contained in paragraphs.

## Dependencies

- [Lines to paragraph Module](../LinesToParagraphModule/README.md)

## How it works

It uses a series of Machine Learning methods to determine if a block of text is a Heading, based on properties like font styles, text color, number of words, etc.
Also, for all the detected Headings it calculates its level property based on font size, font weight, color, etc.

## Accuracy

Accuracy depends on the quality of the trained models.

Better trained models can be easily imported into this module by following the instruction in the [Training Module Guide](./train_model/README.md).

