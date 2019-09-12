# Link Detection Module

## Purpose

The Link detection module detects URLs, GoTo links, as well as actionLaunch, actionNamed, actionMovie based links in a PDF document, when used on a pdf2json output.

## What it does

It appends a the link found on a word (extracted by pdf2json) to the word's content itself, by transforming the content to an html `<a>` link.

## Dependencies

None

## How it works

1. It compares each word to three Regex patterns, one looking for URI based link contents, one looking for GoTo links as well as any other Action links.
2. For each case, a suitable representation, like `<a>` for URI's, is attached with the content of the word itself.

## Accuracy

All correctly detected links from the extractor are well preserved, and the accuracy can thus be reported to be _pretty good_.

## Limitations

- As long as the pdf2json extractor is used, links are preserved, as it is the only currently present extractor with link detection and preservation capacity.
- Links are included in the body of the concerned word, instead of an actual Link element. This is a TODO.
