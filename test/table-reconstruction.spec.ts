/**
 * Copyright 2020 AXA Group Operations S.A.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import { expect } from 'chai';
import * as fs from 'fs';
import { withData } from 'leche';
import 'mocha';
import { TableDetectionModule } from '../server/src/processing/TableDetectionModule/TableDetectionModule';
import { Table } from '../server/src/types/DocumentRepresentation';
import { getDocFromJson, runModules, TableExtractorStub } from './helpers';

const assetsDir = __dirname + '/assets/';

describe('Table Reconstruction Module', () => {
  describe('horizontal cell merge', () => {
    withData(
      {
        'table with no joined cells': [
          'table-very-simple-output.json',
          [
            [1, 1, 1, 1, 1, 1],
            [1, 1, 1, 1, 1, 1],
            [1, 1, 1, 1, 1, 1],
          ],
        ],
        'only one cell merge': [
          'table-one-cell-merged.json',
          [
            [2, 1, 1, 1, 1],
            [1, 1, 1, 1, 1, 1],
            [1, 1, 1, 1, 1, 1],
          ],
        ],
        'two different merges in same row': [
          'table-two-different-merges-in-same-row.json',
          [
            [2, 1, 1, 2],
            [1, 2, 2, 1],
            [1, 1, 1, 1, 1, 1],
          ],
        ],
        'two different consecutive merges in same row': [
          'table-two-different-consecutive-merges-in-same-row.json',
          [
            [2, 2, 1, 1],
            [1, 1, 1, 1, 1, 1],
            [1, 2, 2, 1],
          ],
        ],
        'multiple colspan merge in multiple rows': [
          'table-multiple-colspan-merge.json',
          [[4, 1, 1], [1, 3, 2], [6]],
        ],
      },
      (fileName, cellInfo) => {
        let table: Table;
        before(done => {
          const camelotOutput = fs.readFileSync(assetsDir + fileName, { encoding: 'utf8' });

          const tableExtractor = new TableExtractorStub(0, '', camelotOutput);
          const tableDetectionModule = new TableDetectionModule();
          tableDetectionModule.setExtractor(tableExtractor);
          getDocFromJson(
            doc => runModules(doc, [tableDetectionModule]),
            'table-reconstruction.json',
            'test-table-reconstruction.pdf',
          ).then(after => {
            table = after.getElementsOfType<Table>(Table)[0];
            done();
          });
        });

        it(`should have correctly merged cells`, () => {
          cellInfo.forEach((row, rowIndex) => {
            row.forEach((colspan, colIndex) => {
              expect(table.content[rowIndex].content[colIndex].colspan).to.equal(colspan);
            });
          });
        });

        it(`row should have correct amount of cells`, () => {
          cellInfo.forEach((row, rowIndex) => {
            expect(table.content[rowIndex].content.length).to.equal(row.length);
          });
        });
      },
    );
  });

  describe('table markdown validation', () => {
    withData({
      'row_span.pdf': [
        'camelot-row_span.json',
        'row_span.json',
        'row_span.pdf',
        [
          '| Plan Type | County | Plan Name | Totals |',
          '|---|---|---|---|',
          '| GMC | Sacramento | Anthem Blue Cross | 164,380 |',
          '|^|^| Health Net | 126,547 |',
          '|^|^| Kaiser Foundation | 74,620 |',
          '|^|^| Molina Healthcare | 59,989 |',
          '|^| San Diego | Care 1st Health Plan | 71,831 |',
          '|^|^| Community Health Group | 264,639 |',
          '|^|^| Health Net | 72,404 |',
          '|^|^| Kaiser | 50,415 |',
          '|^|^| Molina Healthcare | 206,430 |',
          '|^| Total GMC Enrollment |<| 1,091,255 |',
          '| COHS | Marin | Partnership Health Plan of CA | 36,006 |',
          '|^| Mendocino |^| 37,243 |',
          '|^| Napa |^| 28,398 |',
          '|^| Solano |^| 113,220 |',
          '|^| Sonoma |^| 112,271 |',
          '|^| Yolo |^| 52,674 |',
          '|^| Del Norte |^| 11,242 |',
          '|^| Humboldt |^| 49,911 |',
          '|^| Lake |^| 29,149 |',
          '|^| Lassen |^| 7,360 |',
          '|^| Modoc |^| 2,940 |',
          '|^| Shasta |^| 61,763 |',
          '|^| Siskiyou |^| 16,715 |',
          '|^| Trinity |^| 4,542 |',
          '|^| Merced | Central California Alliance for Health | 123,907 |',
          '|^| Monterey |^| 147,397 |',
          '|^| Santa Cruz |^| 69,458 |',
          '|^| Santa Barbara | CenCal | 117,609 |',
          '|^| San Luis Obispo |^| 55,761 |',
          '|^| Orange | CalOptima | 783,079 |',
          '|^| San Mateo | Health Plan of San Mateo | 113,202 |',
          '|^| Ventura | Gold Coast Health Plan | 202,217 |',
          '|^| Total COHS Enrollment |<| 2,176,064 |',
          '| Subtotal for Two-Plan, Regional Model, GMC and COHS |<|<| 10,132,022 |',
          '| PCCM | Los Angeles | AIDS Healthcare Foundation | 828 |',
          '|^| San Francisco | Family Mosaic | 25 |',
          '|^| Total PHP Enrollment |<| 853 |',
          '| All Models Total Enrollments |<|<| 10,132,875 |',
          '| Source: Data Warehouse 12/14/15 |<|<|<|',
        ],
      ],
      'column_span_1.pdf': [
        'camelot-column_span_1.json',
        'column_span_1.json',
        'column_span_1.pdf',
        [
          '| Sl. No. | Year | Population (in Lakh) | Accidental Deaths |<| Suicides |<| Percentage Population growth |',
          '|---|---|---|---|---|---|---|---|',
          '|^|^|^| Incidence | Rate | Incidence | Rate |^|',
          '| (1) | (2) | (3) | (4) | (5) | (6) | (7) | (8) |',
          '| 1. | 1967 | 4999 | 126762 | 25.4 | 38829 | 7.8 | 2.2 |',
          '| 2. | 1968 | 5111 | 126232 | 24.7 | 40688 | 8.0 | 2.2 |',
          '| 3. | 1969 | 5225 | 130755 | 25.0 | 43633 | 8.4 | 2.2 |',
          '| 4. | 1970 | 5343 | 139752 | 26.2 | 48428 | 9.1 | 2.3 |',
          '| 5. | 1971 | 5512 | 105601 | 19.2 | 43675 | 7.9 | 3.2 |',
          '| 6. | 1972 | 5635 | 106184 | 18.8 | 43601 | 7.7 | 2.2 |',
          '| 7. | 1973 | 5759 | 130654 | 22.7 | 40807 | 7.1 | 2.2 |',
          '| 8. | 1974 | 5883 | 110624 | 18.8 | 46008 | 7.8 | 2.2 |',
          '| 9. | 1975 | 6008 | 113016 | 18.8 | 42890 | 7.1 | 2.1 |',
          '| 10. | 1976 | 6136 | 111611 | 18.2 | 41415 | 6.7 | 2.1 |',
          '| 11. | 1977 | 6258 | 117338 | 18.8 | 39718 | 6.3 | 2.0 |',
          '| 12. | 1978 | 6384 | 118594 | 18.6 | 40207 | 6.3 | 2.0 |',
          '| 13. | 1979 | 6510 | 108987 | 16.7 | 38217 | 5.9 | 2.0 |',
          '| 14. | 1980 | 6636 | 116912 | 17.6 | 41663 | 6.3 | 1.9 |',
          '| 15. | 1981 | 6840 | 122221 | 17.9 | 40245 | 5.9 | 3.1 |',
          '| 16. | 1982 | 7052 | 125993 | 17.9 | 44732 | 6.3 | 3.1 |',
          '| 17. | 1983 | 7204 | 128576 | 17.8 | 46579 | 6.5 | 2.2 |',
          '| 18. | 1984 | 7356 | 134628 | 18.3 | 50571 | 6.9 | 2.1 |',
          '| 19. | 1985 | 7509 | 139657 | 18.6 | 52811 | 7.0 | 2.1 |',
          '| 20. | 1986 | 7661 | 147023 | 19.2 | 54357 | 7.1 | 2.0 |',
          '| 21. | 1987 | 7814 | 152314 | 19.5 | 58568 | 7.5 | 2.0 |',
          '| 22. | 1988 | 7966 | 163522 | 20.5 | 64270 | 8.1 | 1.9 |',
          '| 23. | 1989 | 8118 | 169066 | 20.8 | 68744 | 8.5 | 1.9 |',
          '| 24. | 1990 | 8270 | 174401 | 21.1 | 73911 | 8.9 | 1.9 |',
          '| 25. | 1991 | 8496 | 188003 | 22.1 | 78450 | 9.2 | 2.7 |',
          '| 26. | 1992 | 8677 | 194910 | 22.5 | 80149 | 9.2 | 2.1 |',
          '| 27. | 1993 | 8838 | 192357 | 21.8 | 84244 | 9.5 | 1.9 |',
          '| 28. | 1994 | 8997 | 190435 | 21.2 | 89195 | 9.9 | 1.8 |',
          '| 29. | 1995 | 9160 | 222487 | 24.3 | 89178 | 9.7 | 1.8 |',
          '| 30. | 1996 | 9319 | 220094 | 23.6 | 88241 | 9.5 | 1.7 |',
          '| 31. | 1997 | 9552 | 233903 | 24.5 | 95829 | 10.0 | 2.5 |',
          '| 32. | 1998 | 9709 | 258409 | 26.6 | 104713 | 10.8 | 1.6 |',
          '| 33. | 1999 | 9866 | 271918 | 27.6 | 110587 | 11.2 | 1.6 |',
          '| 34. | 2000 | 10021 | 255883 | 25.5 | 108593 | 10.8 | 1.6 |',
          '| 35. | 2001 | 10270 | 271019 | 26.4 | 108506 | 10.6 | 2.5 |',
          '| 36. | 2002 | 10506 | 260122 | 24.8 | 110417 | 10.5 | 2.3 |',
          '| 37. | 2003 | 10682 | 259625 | 24.3 | 110851 | 10.4 | 1.7 |',
          '| 38. | 2004 | 10856 | 277263 | 25.5 | 113697 | 10.5 | 1.6 |',
          '| 39. | 2005 | 11028 | 294175 | 26.7 | 113914 | 10.3 | 1.6 |',
          '| 40. | 2006 | 11198 | 314704 | 28.1 | 118112 | 10.5 | 1.5 |',
          '| 41. | 2007 | 11366 | 340794 | 30.0 | 122637 | 10.8 | 1.5 |',
          '| 42. | 2008 | 11531 | 342309 | 29.7 | 125017 | 10.8 | 1.4 |',
          '| 43. | 2009 | 11694 | 357021 | 30.5 | 127151 | 10.9 | 1.4 |',
          '| 44. | 2010 | 11858 | 384649 | 32.4 | 134599 | 11.4 | 1.4 |',
          '| 45. | 2011 | 12102 | 390884 | 32.3 | 135585 | 11.2 | 2.1 |',
          '| 46. | 2012 | 12134 | 394982 | 32.6 | 135445 | 11.2 | 1.0 |',
          '| 47. | 2013 | 12288 | 400517 | 32.6 | 134799 | 11.0 | 1.0 |',
        ],
      ],
      'column_span_2.pdf': [
        'camelot-column_span_2.json',
        'column_span_2.json',
        'column_span_2.pdf',
        [
          '| Investigations | No. of HHs | Age/Sex/ Physiological Group | Preva- lence | C.I\\* | Relative Precision | Sample size per State |',
          '|---|---|---|---|---|---|---|',
          '| Anthropometry | 2400 | All the available individuals |<|<|<|<|',
          '| Clinical Examination |^|^|<|<|<|<|',
          '| History of morbidity |^|^|<|<|<|<|',
          '| Diet survey | 1200 | All the individuals partaking meals in the HH |<|<|<|<|',
          '| Blood Pressure \\# | 2400 | Men (≥ 18yrs) | 10% | 95% | 20% | 1728 |',
          '|^|^| Women (≥ 18 yrs) |^|^|^| 1728 |',
          '| Fasting blood glucose | 2400 | Men (≥ 18 yrs) | 5% | 95% | 20% | 1825 |',
          '|^|^| Women (≥ 18 yrs) |^|^|^| 1825 |',
          '| Knowledge & Practices on HTN & DM | 2400 | Men (≥ 18 yrs) | - | - | - | 1728 |',
          '|^| 2400 | Women (≥ 18 yrs) | - | - | - | 1728 |',
        ],
      ],
    },
      (camelotJson, parsrJson, pdfFile, expectedMarkdownRows) => {
        let table: Table;
        before(done => {
          const camelotOutput = fs.readFileSync(assetsDir + camelotJson, { encoding: 'utf8' });
          const tableExtractor = new TableExtractorStub(0, '', camelotOutput);
          const tableDetectionModule = new TableDetectionModule();
          tableDetectionModule.setExtractor(tableExtractor);
          getDocFromJson(
            doc => runModules(doc, [tableDetectionModule]),
            parsrJson,
            pdfFile,
          ).then(after => {
            table = after.getElementsOfType<Table>(Table)[0];
            done();
          });
        });

        it('should export expected markdown', () => {
          const md = table.toMarkdown();
          md.split('\n').forEach((row, i) => {
            if (row) {
              expect(row.trim()).to.eq(expectedMarkdownRows[i].trim());
            }
          });
        });
      });
  });
});
