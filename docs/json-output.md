# JSON Output

This page describes the components of the JSON output file in detail.

- [JSON Output](#json-output)
  - [0. Introduction](#0-introduction)
  - [1. `pages` component](#1-pages-component)
    - [1.1. Bounding Boxes](#11-bounding-boxes)
    - [1.2. Element types](#12-element-types)
      - [1.2.1. Text type](#121-text-type)
      - [1.2.2. Table type](#122-table-type)
      - [1.2.3. List type](#123-list-type)
      - [1.2.4. Barcode type](#124-barcode-type)
      - [1.2.5. Image type](#125-image-type)
      - [1.2.6. Drawing type](#126-drawing-type)
    - [1.3. Properties of an Element](#13-properties-of-an-element)
  - [2. `fonts` component](#2-fonts-component)
  - [3. `metadata` component](#3-metadata-component)
    - [3.1. Key-Value pair metadata](#31-key-value-pair-metadata)
    - [3.2. Regex metadata](#32-regex-metadata)

## 0. Introduction

The output JSON file is composed of the following overall structure:

```js
{
  "metadata": [/* ... */],
  "fonts": [/* ... */],
  "pages": [/* ... */],
}
```

This file represents the generated output from each of the extraction, cleaning and enrichment modules.

## 1. `pages` component

`pages` contains an array representing a single page of the document. It contains the following structure:

```js
"pages" : [
  0: {
    "box": {/* ... */},            // Bounding box of the page, see Section 1.1
    "pageNumber": "1",             // The page's page number
    "elements": [                  // The elements (contents) on the page.
      0: {                         // The first element.
        "box": {/* ... */},        // Bounding box for this particular element.
        "type": "heading",         // The type of the element; see Section 1.2
        "properties": [/* ... */], // Properties of the element; see Section 1.3
        "metadata": [/* ... */],   // Indices of all the metadatas associated with this element.
        "content": [/* ... */],    // List of contents inside the high level element.
      },
      1: {/* ... */},
      2: {/* ... */}
    ],
  },
  1: {
    "box": {/* ... */},
    "pageNumber": "2",
    "elements": [
      0: {
        "box": {/* ... */},
        "type": "table",
        "properties": [/* ... */],
        "metadata": [/* ... */],
        "content": [/* ... */],
      },
      1: {/* ... */},
    ],
  },
]
```

Each page element contains data relative to the contents of the page in the `elements` section (described in further detail in the Section 1.2), as well as general information pertaining to the properties of that page.
Each element also features a bounding box, which describes its position and size on a given page.

### 1.1. Bounding Boxes

A bounding box is represented by the following object in the output json:

```js
{
  "t": 10,                         // top
  "l": 10,                         // left
  "w": 640,                        // width
  "h": 480,                        // height
}
```

### 1.2. Element types

An element is a dinstinguishable block of content inside a page of a document.
All elements contain a Bounding Box object, which is described in the section 1.1.
The list of metadatas attached to an element are listed under the key 'metadata'.
We categorise each content element as one of the following:

#### 1.2.1. Text type

The text element type is of multiple levels of subtypes:

- **Paragraph**: The paragraph type contains a list of Lines as elements under the key 'content'.
  ```js
  {
    "id": 1024,
    "box": {/* ... */},
    "type": "paragraph",
    "content": [/* ... */],        // strictly Line type elements
    "properties": [/* ... */],
    "metadata": [/* ... */],
  }
  ```
- **Line**: The line type contains a list of words as elements under the key 'content'.
  ```js
  {
    "id": 1025,
    "box": {/* ... */},
    "type": "line",
    "content": [/* ... */],        // strictly Word type elements
    "properties": [/* ... */],
    "metadata": [/* ... */],
  }
  ```
- **Word**: The word type contains either a list of character type objects or a string under the key 'content'.
  ```js
  {
    "id": 1028,
    "box": {/* ... */},
    "type": "word",
    "content": [/* ... */],        // strictly Character or string type elements
    "properties": [/* ... */],
    "metadata": [/* ... */],
  }
  ```
- **Character**: The character type contains a single character as the content.
  ```js
  {
    "id": 1029,
    "box": {/* ... */},
    "type": "character",
    "content": "p",                // strictly single character string element
    "properties": [/* ... */],
    "metadata": [/* ... */],
  }
  ```
- **Heading**: The heading type is like a paragraph type but with a heading level.
  ```js
  {
    "id": 1024,
    "box": {/* ... */},
    "type": "heading",
    "content": [/* ... */],        // strictly Line type elements
    "level": 2                     // this is a level 2 heading
    "properties": [/* ... */],
    "metadata": [/* ... */],
  }
  ```

#### 1.2.2. Table type

The following structure defines a table with a single row, single column containing a single cell with a paragraph of text as the cell content.

```js
{
  "id": 4758,
  "type": "table",
  "properties": ,
  "order": 15,
  "metadata": [/* ... */],
  "box": {
    "l": 416,
    "t": 2411,
    "w": 4182,
    "h": 3560,
  }
  "content": [
    "0": {
      "id": 2704,
      "type": "table-row",
      "properties": {/* ... */},
      "metadata": [/* ... */],
      "box": {/* ... */},
      "content": [
        "0": {
          "id": 2604,
          "type": "table-cell",
          "properties": {/* ... */},
          "metadata": [/* ... */],
          "box": {/* ... */},
          "rowspan": 1,
          "colspan": 1,
          "content": [
            "0": {
              "id": 2603,
              "type": "paragraph",
              "properties": {/* ... */},
              "metadata": [/* ... */],
              "box": {/* ... */},
              "content": [/* ... */],
            }
          ]
        }
      ]
    }
  ]
}
```

#### 1.2.3. List type

The content of a list is a set of paragraphs.
A list of both types bulleted and numbered can be represented by this object.
The distinction between the two can be noted by the boolean value 'isOrdered'.

```js
{
  "id": 169,
  "type": "list",
  "properties": {/* ... */},
  "metadata": [/* ... */],
  "box": {/* ... */},
  "isOrdered": false,            // distinguishes bullet points from numbered lists
  "content": [
    "0": {
      "id": 168,
      "type": "paragraph",
      "properties": {/* ... */},
      "metadata": [/* ... */],
      "box": {/* ... */},
      "content": [/* ... */],
    },
   "1": {
      "id": 169,
      "type": "paragraph",
      "properties": {/* ... */},
      "metadata": [/* ... */],
      "box": {/* ... */},
      "content": [/* ... */],
    }
  ]
}
```

#### 1.2.4. Barcode type

A barcode type element represents a barcode element, including the barcode type, as well as the scanned value.

```js
{
  "id": 166,
  "type": "barcode",
  "properties": {/* ... */},
  "metadata": [/* ... */],
  "box": {/* ... */},
  "codeType": "CODE128",
  "codeValue": "0000703082\n"
}
```

#### 1.2.5. Image type

An image is a component representing an image found on the source document, which can (or cannot, depending on its extractability) contain a location on where an extracted version can be found.
An image also contains location and embedded size information.

```js
{
  "id": 146,
  "type": "image",
  "properties": {/* ... */},
  "metadata": [/* ... */],
  "box": {/* ... */},
  "src": "/tmp/imageFile.jpg"   // location of the image
}
```

#### 1.2.6. Drawing type

A drawing is an SVG element, which for now, can be of subtype 'svg-line'.
An SVG-line represents a line in 2D space with a thickness.

```js
{
  "id": 166,
  "type": "drawing",
  "properties": {/* ... */},
  "metadata": [/* ... */],
  "box": {/* ... */},
  "content": [
    0: {
    "id": 167,
    "type": "svg-line",
    "properties": {/* ... */},
    "metadata": [/* ... */],
    "box": {/* ... */},
    "fromX": "12",
    "fromY": "12",
    "toX": "1558",
    "toY": "1570",
    "thickness": "7"
    }
  ]
}
```

### 1.3. Properties of an Element

The properties of an element describe boolean states related to an element. Following provides an example of all the possible values of an element:

```js
"properties": {
  "order": 7,
  "isRedundant": true,
  "isHeader": true,
  "isFooter": true,
  "isPageNumber": true,
  "bulletList": true,
  "titleScores": {
    "size": 1.16,
    "weight": 0,
    "color": 0,
    "name": 0,
    "italic": 0,
    "underline": 0,
  },
}
```

## 2. `fonts` component

`fonts` contains an array representing each font formatting in the document. Each formatting style is represented uniquely; for example: Arial 10pt and Arial 10pt Bold will be represented as two seperate elements.

```js
"fonts" : [
  0: {
    "id": 1,
    "name": "Arial",
    "size": 10,
    "weight": "medium",
    "isItalic": false,
    "isUnderline": false,
    "color": "000000",
  },
  1: {
    "id": 2,
    "name": "Arial",
    "size": 10,
    "weight": "bold",
    "isItalic": false,
    "isUnderline": false,
    "color": "000000",
  }
]
```

## 3. `metadata` component

`metadata` elements represent an outer layer of supplementary information lying on top of the content layer of the document.
Following are the two types of metadatas:

### 3.1. Key-Value pair metadata

A key-value pair is a group of data labelled as a key-value pair, more precisely divided into two categories: key and value.
The metadata that define elements as key-value pairs group elements defined over two fields.
The key-value pair metadata is generated according to the key-value configuration passed to the pipeline.

```js
{
  "id": 4,
  "type": "key-value",
  "keyName": "Policy Number",
  "elements": {
    "0": 286,
    "1": 289,
  },
  "data": {
    "keyElements": {
      "0": 286,
    },
    "valueElements": {
      "0": 289,
    }
  }
}
```

### 3.2. Regex metadata

A regex metadata represents a regex match, and provides information on the pattern used for the matching, the name of the match, the value found, and the elements on which it was found.

```js
{
  "id": 89,
  "type": "regex",
  "elements": [
    842
  ],
  "data": {
    "name": "Age",
    "regex": "(\\d+)[ -]*(ans|jarige)",
    "fullMatch": "24 ans",
    "groups": [
      "24",
      "ans"
    ]
  }
}
```

`fullMatch` shows the match instance to which the entire query was matched, while `groups` lists instances of individual matches.
