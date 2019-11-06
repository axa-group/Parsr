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
import * as fs from 'fs';
import { withData } from 'leche';
import 'mocha';
import { LinkDetectionModule } from '../../server/src/processing/LinkDetectionModule/LinkDetectionModule';
import { Document, Word } from '../../server/src/types/DocumentRepresentation';
import { json2document } from '../../server/src/utils/json2document';

import { runModules } from './../helpers';

describe('Link Detection Module', () => {
  withData(
    {
      'simple links': [
        'link-test-1.json', 7, [
          'http://par.sr/',
          'http://par.sr/',
          'http://par.sr/',
          'http://par.sr/',
          'http://par.sr/',
          'http://par.sr/',
          'https://www.google.com',
        ],
      ],
      'two different links in the same line': [
        'link-test-2.json', 5, [
          'https://www.google.com/',
          'https://www.google.com/',
          'https://www.google.com/',
          'https://www.google.com/',
          'https://www.google.com/',
        ],
      ],
      'multi-line link': [
        'link-test-3.json', 8, [
          'https://www.google.com/?multiline=true',
          'https://www.google.com/?multiline=true',
          'https://www.google.com/?multiline=true',
          'https://www.google.com/?multiline=true',
          'https://www.google.com/?multiline=true',
          'https://www.google.com/?multiline=true',
          'https://www.google.com/?multiline=true',
          'https://www.google.com/?foo=bar',
        ],
      ],
    },
    (fileName, wordWithLinkCount, linksData) => {
      let docBefore: Document;
      let docAfter: Document;

      before(done => {
        const json = JSON.parse(
          fs.readFileSync(__dirname + '/assets/' + fileName, { encoding: 'utf8' }),
        );

        docBefore = json2document(json);
        docBefore.inputFile = __dirname + '/assets/' + fileName.replace('.json', '.pdf');

        runModules(docBefore, [new LinkDetectionModule()]).then(after => {
          docAfter = after;
          done();
        });
      });

      it('should have the expected amount of links', () => {
        const links = docAfter.pages[0].getElementsOfType<Word>(Word).filter(w => !!w.properties.link);
        expect(links.length).to.be.equal(wordWithLinkCount);
      });

      it('each word should have the correct targetURL', () => {
        const links = docAfter.pages[0].getElementsOfType<Word>(Word).filter(w => !!w.properties.link);
        expect(linksData.map((l, i) => links[i].properties.targetURL === l))
          .to.be.an('array').that.does.not.include(false);
      });
    },
  );
});