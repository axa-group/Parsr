# CSV Output Module

CSV exporter will generate a csv file with the contents of each table on the document.

Example from [foo.pdf](../../../../samples/foo.pdf) sample file:

```
Cycle Name;KI (1/km);Distance (mi);Percent Fuel Savings;;;;
;;;;Improved Speed;Decreased Accel;Eliminate Stops;Decreased Idle
2012_2;3.30;1.3;5.9%;9.5%;29.2%;17.4%;
2145_1;0.68;11.2;2.4%;0.1%;9.5%;2.7%;
4234_1;0.59;58.7;8.5%;1.3%;8.5%;3.3%;
2032_2;0.17;57.8;21.7%;0.3%;2.7%;1.2%;
4171_1;0.07;173.9;58.1%;1.6%;2.1%;0.5%;
```

*As you can see, this will not take into account col/row spans.*
*This module will only output Tables from the document*