# JSON Output Module

This module exports a json file with information about the contents and structure of the document.

Example from [foo.pdf](../../../../samples/foo.pdf) sample file:
```json
{
  "metadata": [],
  "pages": [
    {
      "margins": {
        "top": -1,
        "left": -1,
        "bottom": -1,
        "right": -1
      },
      "box": {
        "l": 0,
        "t": 0,
        "w": 612,
        "h": 792
      },
      "rotation": {
        "degrees": 0,
        "origin": { "x": 0, "y": 0 },
        "translation": { "x": 0, "y": 0 }
      },
      "pageNumber": 1,
      "elements": [
        {
          "id": 3555,
          "type": "heading",
          "properties": { "order": 0 },
          "metadata": [],
          "box": { "l": 72, "t": 74.13, "w": 451.37, "h": 32.22 },
          "content": [
            {
              "id": 3466,
              "type": "line",
              "properties": { "order": 0 },
              "metadata": [],
              "box": { "l": 72, "t": 74.13, "w": 451.37, "h": 15 },
              "content": [
                {
                  "id": 56,
                  "type": "word",
                  "properties": { "order": 0 },
                  "metadata": [],
                  "box": { "l": 72, "t": 74.13, "w": 8.34, "h": 15 },
                  "content": "2",
                  "font": 1,
                  "fontSize": 15
                },
                {
                  "id": 57,
                  "type": "word",
                  "properties": { "order": 1 },
                  "metadata": [],
                  "box": { "l": 93.6, "t": 74.13, "w": 83.34, "h": 15 },
                  "content": "Quantifying",
                  "font": 1,
                  "fontSize": 15
                },
                {
                  "id": 58,
                  "type": "word",
                  "properties": { "order": 2 },
                  "metadata": [],
                  "box": { "l": 181.1, "t": 74.13, "w": 84.99, "h": 15 },
                  "content": "Fuel-Saving",
                  "font": 1,
                  "fontSize": 15
                },
                {
                  "id": 59,
                  "type": "word",
                  "properties": { "order": 3 },
                  "metadata": [],
                  "box": { "l": 270.25, "t": 74.13, "w": 98.27, "h": 15 },
                  "content": "Opportunities",
                  "font": 1,
                  "fontSize": 15
                }, 
              ]
            },
          ],
          "level": 1
        }
      ]
    }
  ]
}
```
By default the level of granularity of the export will be "word". You can configure it to "character" in the config file. For more information, refer to [Output Config/Granularity.](../../../../docs/configuration.md#42-Granularity).

For information about the complete structure of the json file, refer to the [JSON output format.](../../../../docs/json-output.md).
