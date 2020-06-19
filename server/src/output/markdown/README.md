# Markdown Output Module

This module will generate a markdown file based on the contents of the input file.

Example from [foo.pdf](../../../../samples/foo.pdf) sample file:

```
## Table 2-1. Simulated fuel savings from isolated cycle improvements

| **Cycle Name** | **KI (1/km)** | **Distance (mi)** | **Percent Fuel Savings** |<|<|<|  
|---|---|---|---|---|---|---|  
|^|^|^| **Improved Speed** | **Decreased Accel** | **Eliminate Stops** | **Decreased Idle** |  
| 2012\_2 | 3.30 | 1.3 | 5.9% | 9.5% | 29.2% | 17.4% |  
| 2145\_1 | 0.68 | 11.2 | 2.4% | 0.1% | 9.5% | 2.7% |  
| 4234\_1 | 0.59 | 58.7 | 8.5% | 1.3% | 8.5% | 3.3% |  
| 2032\_2 | 0.17 | 57.8 | 21.7% | 0.3% | 2.7% | 1.2% |  
| 4171\_1 | 0.07 | 173.9 | 58.1% | 1.6% | 2.1% | 0.5% |  

Figure 2-1 extends the analysis from eliminating stops for the five example cycles and examines the additional benefit from avoiding slow-and-go driving below various speed thresholds.
```

*As it can be seen, Markdown exporter can differentiate between Paragraphs, Headings and Tables. It can also export images, tables of content and lists.*