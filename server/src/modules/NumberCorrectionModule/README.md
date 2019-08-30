# Number Correction Module

## Purpose

Perform error detection and correction on financial numbers.

## What it does

It iterates on every lines and try to apply a correction on numbers such that:

- `13S` becomes `135`
- `o.oo` becomes `0.00`
- `1,802,86` becomes `1,802.86`
- `443 65` becomes `443.65`

This module has been made to perform error correction on scanned invoices.

## Dependencies

None

## How it works

It generates edits and use a scoring system to select the best candidate.  
It tries to match a regex that can be change via the module's options and can also take a whitelist of elements that should be accepted as is.

## Accuracy

Good

## Limitations

- Can have some false positive and correct things that are not errors on numbers.
