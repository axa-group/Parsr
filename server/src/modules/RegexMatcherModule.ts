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

import { Document, Paragraph, Word } from '../types/DocumentRepresentation';
import { RegexMetadata } from '../types/Metadata';
import logger from '../utils/Logger';
import { LinesToParagraphModule } from './LinesToParagraphModule';
import { Module } from './Module';

interface Options {
	queries?: Array<{ regex: string; label: string }>;
	isGlobal?: boolean;
	isCaseSensitive?: boolean;
}

const defaultOptions: Options = {
	isCaseSensitive: true,
	isGlobal: true,
};

export class RegexMatcherModule extends Module<Options> {
	public static moduleName = 'regex-matcher';
	public static dependencies = [LinesToParagraphModule];

	constructor(options?: Options) {
		super(options, defaultOptions);
	}

	public main(doc: Document): Document {
		this.options.queries.forEach(query => {
			logger.info(`Labeling Texts with label ${query.label} from regex ${query.regex}`);

			let regexType: string = '';
			if (this.options.isGlobal) {
				regexType += 'g';
			}
			if (this.options.isCaseSensitive) {
				regexType += 'i';
			}

			const re: RegExp = new RegExp(query.regex, regexType);
			doc.pages = doc.pages.map(page => {
				// const labelCount = 0;

				const paragraphs = page.getElementsOfType<Paragraph>(Paragraph);
				for (const paragraph of paragraphs) {
					let result = null;
					// tslint:disable-next-line:no-conditional-assignment
					while ((result = re.exec(paragraph.toString()))) {
						const matchingWords: Word[] = paragraph.findWordsFromParagraphSubstring(
							result.index,
							result[0].length,
						);

						const metadata = new RegexMetadata(matchingWords, {
							name: query.label,
							regex: query.regex,
							fullMatch: result[0],
							groups: result.slice(1),
						});

						matchingWords.forEach(word => word.metadata.push(metadata));
					}
				}
				return page;
			});
		});

		return doc;
	}
}
