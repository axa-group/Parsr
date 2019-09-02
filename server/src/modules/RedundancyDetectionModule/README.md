# Redundancy Detection Module

## Purpose

Detects and remove duplicate textual elements on each page of the document.

## What it does

Removes all the elements which exist as duplicates in the document.
If an element **A** has the same content and bounding box as another element **B**, then one of them will be removed.

## Dependencies

None

## How it works

1. Creates groups of text based on location, by checking between each pairs of elements if they are aligned and overlap vertically.
2. For each group, check if the elements are really duplicates by checking the concurrency of their content and bounding boxes.
3. If yes, we keep only one of the elements in the group and remove the others from the collection.

## Accuracy

Good

## Limitations

If the contents and location of the two duplicates are not identical, the removal might not take place.
The accuracy in that case will depend on the delta.
