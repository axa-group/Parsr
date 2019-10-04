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

import * as fs from 'fs';
import { Document } from '../types/DocumentRepresentation';
import logger from '../utils/Logger';

export abstract class Exporter {
	public doc: Document;

	constructor(doc: Document) {
		this.doc = doc;
	}

	public abstract export(outputPath: string): Promise<void>;

	protected writeFile(
		outputPath: string,
		content: string,
		encoding: string = 'utf8',
	): Promise<void> {
		return new Promise<void>(resolve => {
			logger.info(`Writing file: ${outputPath}`);
			fs.writeFileSync(outputPath, content, encoding);
			// Check that the file is correctly written on the file system
			fs.fsyncSync(fs.openSync(outputPath, 'r+'));
			resolve();
		});
	}
}
