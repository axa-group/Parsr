# Regex Matcher Module

## Purpose

Matches the text against a certain number of Regular Expressions, configurable in the configuration.

## What it does

Generates new metadata info with RegexMetadata object, containing info about the match result and label for the word.

## Example

with config: 
```json
{
  "isCaseSensitive": true,
  "isGlobal": true,
  "queries": [
    {
      "label": "Number",
      "regex": "[0-9]+"
    },
    {
      "label": "unit",
      "regex": "second|seconds|mph|kilometers|km"
    }
  ]
}
```

`document.metadata` property after execution of this module:
```json
[
  {
    "id": 1,
    "elements": [
      561
    ],
    "type": "regex",
    "data": {
      "name": "Number",
      "regex": "[0-9]+",
      "fullMatch": "2008",
      "groups": []
    }
  },
    {
    "id": 2,
    "elements": [
      684
    ],
    "type": "regex",
    "data": {
      "name": "unit",
      "regex": "second|seconds|mph|kilometers|km",
      "fullMatch": "mph",
      "groups": []
    }
  }
]
```
*Here we can see that 2 words had been matched, with element id 561 and 684. Information about the regexp is also included.*

## Dependencies

None 

## Accuracy

Results accuracy depends on the regular expressions sent in the configuration.
