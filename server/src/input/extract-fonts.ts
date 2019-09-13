/**
 * Copyright 2019 AXA
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
import * as os from 'os';
import * as utils from '../utils';
import logger from '../utils/Logger';

// TODO Handle more than just TrueType (.ttf) files
/**
 * Stability: Experimental
 * Use Mutool to extract fonts files in a specific folder.
 */
export function extractFonts(pdfInputFile: string): Promise<void> {
	return new Promise<void>((resolve, reject) => {
		const mutoolPath = spawnSync(utils.getExecLocationCommandOnSystem(), ['mutool']).output.join(
			'',
		);
		if (mutoolPath === '' || (/^win/i.test(os.platform()) && /no mutool in/.test(mutoolPath))) {
			logger.warn('MuPDF not installed !! Skip fonts extraction.');
			resolve();
		} else {
			logger.info('Extracting fonts...');
			const folder = utils.getMutoolExtractionFolder();
			const command = `mutool extract '${pdfInputFile}'`;
			logger.debug(command);
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
