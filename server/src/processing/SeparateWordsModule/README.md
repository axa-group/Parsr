# Separate Words Module Module

## Purpose

Separates words that are incorrectly joined by a punctuation mark.

## How it works

For every word in the document that is not in the dictionary, checks if it contains punctuation marks like . : , ; ! ?, etc and tries to find words that are separated by this marks.

## Dependencies

None

## Limitations

The module uses the words array of [an-array-of-english-words](https://www.npmjs.com/package/an-array-of-english-words) NPM package. So it can only work with documents written in english.

