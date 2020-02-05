# Words to Line Module

## Purpose

Create lines from a bunch of words, according to the reading order.

## What it does

It creates new line elements that contains arrays of word elements.

## Dependencies

[Reading Order Module](../ReadingOrderDetectionModule/README.md)

## How it works

It simply takes every word one by one according to the reading order and stops and loops if the next word is on another line.

## Accuracy

Almost perfect

## Limitations

- It depends on the reading order detection quality
- It sometimes fails if lines are close to each others and there's an exponent
