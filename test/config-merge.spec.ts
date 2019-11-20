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
import { Module } from '../server/src/processing/Module';

const rootConfigPath = '/assets/configs/';

describe('Module constructor', () => {
  withData(
    {
      'complete custom config': [
        'complete-custom-config.json',
        'module-specs-1.json',
        'complete-custom-config.json',
      ],
      'partial custom configuration': [
        'partial-custom.json',
        'module-specs-3.json',
        'partial-expected.json',
      ],
      'empty custom config': [null, 'module-specs-2.json', 'expected-config-2.json'],
      'booleans as values': [
        'with-booleans-config.json',
        'with-booleans-module-specs.json',
        'with-booleans-config.json',
      ],
    },
    (customFile, defaultModuleFile, expectedOptionsFile) => {
      let module: Module;
      let expectedOptions;
      before(done => {
        let customConfig;
        try {
          customConfig = JSON.parse(
            fs.readFileSync(__dirname + rootConfigPath + customFile, { encoding: 'utf-8' }),
          );
        } catch (e) {
          customConfig = {};
        }
        const defaultConfig = JSON.parse(
          fs.readFileSync(__dirname + rootConfigPath + defaultModuleFile, { encoding: 'utf-8' }),
        );

        expectedOptions = JSON.parse(
          fs.readFileSync(__dirname + rootConfigPath + expectedOptionsFile, { encoding: 'utf-8' }),
        );

        module = new Module(customConfig, defaultConfig);
        done();
      });
      it('should correctly merge configurations', () => {
        expect(module.options).to.deep.equal(expectedOptions);
      });
    },
  );
});
