# Simple JSON Output

This page describes the components of the simple JSON output file in detail.
Block examples are obtained using the [foo.pdf](../samples/foo.pdf) sample file:


- [JSON Output](#simple-json-output)
  - [0. Introduction](#0-introduction)
  - [1. Element types](#1-element-types)
    - [1.1. Paragraphs](#11-paragraphs)
    - [1.2. Headings](#12-headings)
    - [1.3. Table](#13-tables)
    - [1.4. Lists](#14-lists)
    - [1.5. Tables of Content](#15-table-of-contents)

## 0. Introduction

The output for simple JSON file is composed of the following overall structure:

```json
[
  {
    "type": "heading" | "paragraph" | "list" | "table" | "tableOfContent",
    "level": 1,
    "content": "..."
  },
  ...
]
```


This file represents the generated output from each of the extraction, cleaning and enrichment modules.

### 1. Element types

Each element in the array can be a *Paragraph, Heading, List, Table or Table of Contents*.

#### 1.1. Paragraphs

The paragraph type contains the text contents of that paragraph under the key 'content'.
  ```js
  {
    "type": "paragraph",
    "content": "Figure 2-1 extends the analysis from eliminating stops for the five example cycles and examines the additional benefit from avoiding slow-and-go driving below various speed thresholds."
  }
  ```
#### 1.2. Headings

The heading type contains the text contents of that heading under the key 'content', and also the Heading level under the key 'level'.
  ```js
  {
    "type": "heading",
    "level": 2,
    "content": "2 Quantifying Fuel-Saving Opportunities from Specific Driving Behavior Changes"
  }
  ```
  *This means that the element is a Level 2 Heading with the text specified in 'content' key.*  


#### 1.3. Tables

The following structure defines a table with three rows, seven columns and multiple cell spans (indicated with the '**^**' and '**<**' characters).

Each element inside the 'content' array is a TableRow, and each element inside the TableRow is a TableCell.

```json
{
    "type": "table",
    "content": [
      [
        "**Cycle Name**",
        "**KI (1/km)**",
        "**Distance (mi)**",
        "**Percent Fuel Savings**",
        "<",
        "<",
        "<"
      ],
      [
        "^",
        "^",
        "^",
        "**Improved Speed**",
        "**Decreased Accel**",
        "**Eliminate Stops**",
        "**Decreased Idle**"
      ],
      [
        "4171\\_1",
        "0.07",
        "173.9",
        "58.1%",
        "1.6%",
        "2.1%",
        "0.5%",
      ]
    ]
  }
```

#### 1.4. Lists

For lists, the content key is set with the string contents of every ListItem on the List, like the following:

```json
  {
    "type": "list",
    "content": "1. Calculate the trip distance of each sample trip.\n2. Eliminate stop-and-go and idling within each trip.\n3. Set the acceleration rate to 3 mph/s.\n4. Set the cruising speed to 40 mph.\n5. Continue cruising at 40 mph until the trip distance is reached."
  },
```

#### 1.5. Table of Contents

Table of Contents 'content' key is an array containing the texts of every item, on the ToC:

```json
  {
    "type": "tableOfContent",
    "content": [
      "Introduction - 3",
      "Get Sarted - 5",
      "First Use - 7",
      "Settings - 25",
    ]
  },
```