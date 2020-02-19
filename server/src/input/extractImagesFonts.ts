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

import * as fs from 'fs';
import * as CommandExecuter from '../utils/CommandExecuter';

// TODO Handle more than just TrueType (.ttf) files
/**
 * Stability: Experimental
 * Use Mutool to extract fonts files in a specific folder.
 */
export function extractImagesAndFonts(pdfInputFile: string): Promise<string> {
  return new Promise<string>((resolve, reject) => {
    CommandExecuter.mutoolExtract(pdfInputFile)
      .then(assetsFolder => {
        const ttfRegExp = /^[A-Z]{6}\+(.*)\-[0-9]+\.ttf$/;
        fs.readdirSync(assetsFolder).forEach(file => {
          const match = file.match(ttfRegExp);
          if (match) {
            fs.renameSync(`${assetsFolder}/${file}`, `${assetsFolder}/${match[1]}` + '.ttf');
          }
        });
        resolve(assetsFolder);
      })
      .catch(({ found, error }) => {
        if (found) {
          reject(error);
        } else {
          resolve();
        }
      });
  });
}
