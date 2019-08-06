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

import { Config } from '../types/Config';
import { Document } from '../types/DocumentRepresentation/Document';

/**
 * The extractor is responsible to extract every possible information
 * from the PDF/Image file and store it in the Json file.
 * It also ensure that the Json file is correctly formated and contains all the needed
 * information in a clever way.
 */
export abstract class Extractor {
	public config: Config;

	constructor(config: Config) {
		this.config = config;
	}

	public abstract run(inputFile: string): Promise<Document>;
}
