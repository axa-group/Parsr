/**
 * Copyright 2019 AXA Group Operations S.A.
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
import { withData } from 'leche';
import 'mocha';
import { JsonExporter } from '../server/src/output/json/JsonExporter';
import { HierarchyDetectionModule } from '../server/src/processing/HierarchyDetectionModule/HierarchyDetectionModule';
import { LinesToParagraphModule } from '../server/src/processing/LinesToParagraphModule/LinesToParagraphModule';
import { ReadingOrderDetectionModule } from '../server/src/processing/ReadingOrderDetectionModule/ReadingOrderDetectionModule';
import { WordsToLineNewModule } from '../server/src/processing/WordsToLineNewModule/WordsToLineNew';
import { Document, Element, JsonExport } from '../server/src/types/DocumentRepresentation';
import { json2document } from '../server/src/utils/json2document';
import { getDocFromJson, runModules } from './helpers';

describe('JSON export and import', () => {
  withData(
    {
      'one line': 'line-merge.pdf.new.json',
      'big text': 'text-order-detection.json',
    },

    jsonName => {
      let docBefore: Document;
      let docAfter: Document;

      function clean(json: Document): Promise<Document> {
        Element.resetGlobalId();
        return runModules(json, [
          new WordsToLineNewModule(),
          new ReadingOrderDetectionModule(),
          new LinesToParagraphModule(),
          new HierarchyDetectionModule(),
        ]);
      }

      before(done => {
        function transform(json: Document): Promise<Document> {
          return clean(json).then(doc => {
            const jsonExporter = new JsonExporter(doc, 'word');
            const jsonDoc: JsonExport = jsonExporter.getJson();
            docAfter = json2document(jsonDoc);
            return docAfter;
          });
        }

        getDocFromJson(transform, jsonName).then(docB => {
          clean(docB).then(docA => {
            docAfter = docA;
            docBefore = docB;
            done();
          });
        });
      });

      it('should not change the document structure', () => {
        const jsonBefore: JsonExport = new JsonExporter(docBefore, 'word').getJson();
        const jsonAfter: JsonExport = new JsonExporter(docAfter, 'word').getJson();

        const jsonObjBefore: object = jsonBefore;
        const jsonObjAfter: object = jsonAfter;

        expect(jsonObjBefore).to.eql(jsonObjAfter);
      });
    },
  );
});
