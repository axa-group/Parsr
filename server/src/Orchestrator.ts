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

import { Cleaner } from './Cleaner';
import { Extractor } from './input/Extractor';
import { Document } from './types/DocumentRepresentation';
import logger from './utils/Logger';

/**
 * The orchestrator class handles the various steps which a document goes through, including extraction, cleaning.
 * This class serves as the base class for specific instances of the class to be generated
 * using particular extractors and cleaners.
 */
export class Orchestrator {
	public extractor: Extractor;
	public cleaner: Cleaner;

	/**
	 * Constructs the orchestrator object with a specific extractor
	 *
	 * @param extractor The choice of the extractor to be used. To be chosen among abbyy, tesseract, pdf2json, etc.
	 * @param cleaner The cleaner module specifies the handler for all cleaning tasks in the second
	 * phase of the doc treatment.
	 */
	constructor(extractor: Extractor, cleaner: Cleaner) {
		this.extractor = extractor;
		this.cleaner = cleaner;
	}

	/**
	 * Runs the orchestrator, performing first the extraction, then the cleaner, followed
	 *
	 * @param document The document on which the module is to be run.
	 * @param i The index of the module to be run (among a list of modules).
	 * @returns The promise of the document after running the next module.
	 * @remarks Sets up the cleaner module with the configuration passed, along with checking of the dependencies.
	 */
	public run(filename: string): Promise<Document> {
		logger.info(`Using extractor: ${this.extractor.constructor.name}`);

		return this.extractor.run(filename).then((doc: Document) => {
			logger.info('Running cleaner...');
			return this.cleaner.run(doc);
		});
	}
}
