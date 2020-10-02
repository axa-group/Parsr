# Words to Line New Module

## Purpose

Create lines from a bunch of words inside pages.

## What it does

It creates new line elements that contains arrays of word elements.

## Dependencies

No dependencie.

## How it works

It takes every word of the page one by one, then it is splitted into line depending of vertical alignement, finaly each line can be splitted when a space between two words is big enough according to the average space and common space between words.

## Accuracy

Almost perfect.

## Limitations

If on specific case it is not working, you can tune up by incrementing / decrementing value of average and common space detected between words.
