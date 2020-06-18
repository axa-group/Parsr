# Simple json

This module exports a simpler json file with ordered information about the contents of the document. Here we do not export information about the positions / structure inside the document.

Example from [foo.pdf](../../../../samples/foo.pdf) sample file:
```json
[
  {
    "type": "heading",
    "level": 2,
    "content": "2 Quantifying Fuel-Saving Opportunities from Specific Driving Behavior Changes"
  },
  {
    "type": "paragraph",
    "content": "2.1 Savings from Improving Individual Driving Profiles"
  },
  {
    "type": "heading",
    "level": 5,
    "content": "2.1.1 Drive Profile Subsample from Real-World Travel Survey"
  },
  {
    "type": "paragraph",
    "content": "The interim report (Gonder et al. 2010) included results from detailed analyses on five cycles selected from a large set of real-world global positioning system (GPS) travel data collected in 2006 as part of a study by the Texas Transportation Institute and the Texas Department of Transportation (Ojah and Pearson 2008). The cycles were selected to reflect a range of kinetic intensity (KI) values. (KI represents a ratio of characteristic acceleration to aerodynamic speed and has been shown to be a useful drive cycle classification parameter [O’Keefe et al. 2007].) To determine the maximum possible cycle improvement fuel savings, the real-world cycles were converted into equivalent “ideal” cycles using the following steps:"
  }
]
```

For more information about the complete structure of the json file, refer to the [Simple JSON output format.](../../../../docs/simple-json-output.md)

*SimpleJson exporter can export Headings, Paragraphs, Lists, Tables and Tables of Content.*