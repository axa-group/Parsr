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

const { spawn } = require('child_process');
const { platform } = require('os');

const commands = {
  win32: require('./windows.commands'),
  darwin: require('./darwin.commands'),
};

function promisifySpawn(cmd, args = []) {
  return new Promise((resolve, reject) => {
    const process = spawn(cmd, args, { stdio: 'inherit' });
    process.on('close', code => {
      resolve(code);
    });
    process.on('error', err => {
      reject(err);
    });
    process.on('message', m => {
      console.log(m.toString());
    });
  });
}

function install() {
  const osPlatform = platform();
  if ({}.hasOwnProperty.call(commands, osPlatform)) {
    const [cmd, ...args] = commands[osPlatform];
    if (cmd) {
      return promisifySpawn(cmd, args)
        .then(code => {
          console.log('Finished process with code', code);
          console.log('Please close this window in order to refresh the PATH variable.');
        })
        .catch(console.error);
    }
  } else {
    console.warn('Missing installation script for', osPlatform, 'platform.');
  }
}

install();
