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

import { readFileSync } from 'fs';
import { Document, JsonExport } from '../../types/DocumentRepresentation';
import { json2document } from '../../utils/json2document';
import logger from '../../utils/Logger';
import { Extractor } from '../Extractor';

export class JsonExtractor extends Extractor {
	public run(inputFile: string): Promise<Document> {
		logger.info('processing the input file', inputFile);
		const json: JsonExport = JSON.parse(readFileSync(inputFile, 'utf8'));
		const doc: Document = json2document(json);
		return Promise.resolve(doc);
	}
}
