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

import { spawnSync } from 'child_process';
import * as fs from 'fs';
import * as utils from '../utils';
import logger from '../utils/Logger';

// TODO Handle more than just TrueType (.ttf) files
/**
 * Stability: Experimental
 * Use Mutool to extract fonts files in a specific folder.
 */
export function extractImagesAndFonts(pdfInputFile: string): Promise<void> {
  return new Promise<void>((resolve, reject) => {
    const mutoolPath = utils.getCommandLocationOnSystem('mutool');
    if (!mutoolPath) {
      logger.warn('MuPDF not installed. Will not treats images inside documents...');
      resolve();
    } else {
      const folder = utils.getMutoolExtractionFolder();
      logger.info(`Extracting images and fonts to ${folder} using command 'mutool extract ${pdfInputFile}'...`);
      const ret = spawnSync('mutool', ['extract', pdfInputFile], { cwd: folder });

      if (ret.status !== 0) {
        logger.error(ret.stderr.toString());
        reject(ret.stderr.toString());
      }

      const ttfRegExp = /^[A-Z]{6}\+(.*)\-[0-9]+\.ttf$/;
      fs.readdirSync(folder).forEach(file => {
        const match = file.match(ttfRegExp);

        if (match) {
          fs.renameSync(`${folder}/${file}`, `${folder}/${match[1]}` + '.ttf');
        }
      });

      resolve();
    }
  });
}
