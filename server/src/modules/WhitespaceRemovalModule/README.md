# Whitespace Removal Module

## Purpose

Removes textual elements containing only whitespace as content.

## What it does

Removes (filters out) all the textual elements not containing any content at all.

## Dependancies

None

## Parameters

`minWidth`: The minimum width to see if an element is atleast a certain size for it to be taken into consideration as a candidate for removal

## How it works

All whitespace textual elements are checked to see if their width is less than `minWidth`, then checked if they are overlapping with other text elements (a very common case), and then deleted.

## Accuracy

Good. The module treats the most common cases, but its completeness is based on observation. New edge-cases might appear and will be interesting to treat in the future.
