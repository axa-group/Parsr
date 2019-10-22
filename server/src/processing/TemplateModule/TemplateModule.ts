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

import { Document } from '../../types/DocumentRepresentation';
import logger from '../../utils/Logger';
import { Module } from '../Module';
import { WordsToLineModule } from '../WordsToLineModule/WordsToLineModule';
import * as defaultConfig from './defaultConfig.json';

// List of every options you need.
// Don't forget the question mark!
interface Options {
	yourOption?: string;
}

// Default options if none have been set in the configuration file.
const defaultOptions = (defaultConfig as any) as Options;

/**
 * Template Module. Do not use as is.
 */
export class TemplateModule extends Module<Options> {
	// The module name is useful to call it in the configuration.
	// Please keep it kebab-case.
	public static moduleName = 'template-module';
	// If your module can only be ran after another module, add it to the list.
	// For instance, if your module needs a document where lines have already be created,
	// you need to add `WordsToLineModule` as a dependency.
	public static dependencies = [WordsToLineModule];

	// This constructor ensures options and default options will be correctly copied.
	constructor(options?: Options) {
		super(options, defaultOptions);
	}

	// The main function will be called by the platform (by `../Cleaner.ts`).
	public main(doc: Document): Document {
		// Modify the document here as you want.
		// You can use options with `this.options.yourOption`
		logger.info(this.options.yourOption);
		return doc;
	}

	// Note that you can also return a `Promise<Document>` if your process is async.
	// In this case, use this main function instead:
	/*
	public main(doc: Document): Promise<Document> {
		const promise: Promise<Document> = new Promise<Document>((resolve, reject) => {
			resolve(doc);
		});

		return promise;
	}
	*/
}
