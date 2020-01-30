# Table of Contents Detection Module

## Purpose

Detects and extracts tables of content from the PDF file.

## What it does

Given a pdf it generates a `TableOfContent` element containing an array of `TableOfContentItem`'s with info for each item.

## How it works

Searches for keywords and specific paragraph formats and then extracts the info from each detected paragraph with Regular Expressions

## Accuracy

The accuracy is high on one-column documents.
