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

var shell = require('shelljs');

if (!shell.test('-d', './dist/assets') || !shell.test('-d', './dist/bin')) {
  shell.mkdir('./dist', './dist/assets', './dist/bin');
}
shell.cp('-u', './server/assets/*.py', './dist/assets/');
shell.cp('-u', './server/defaultConfig.json', './dist/bin/');
shell.cp('-u', './server/assets/model.json', './dist/assets/');
shell.cp('-u', './server/assets/group1-shard1of1.bin', './dist/assets/');
