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

import * as string_similarity from 'string-similarity';
import { BoundingBox, Document, Line, Page, Word } from '../../types/DocumentRepresentation';
import { KeyValueMetadata } from '../../types/Metadata/KeyValueMetadata';
import { getSubCollections } from '../../utils';
import logger from '../../utils/Logger';
import { Module } from '../Module';
import { WordsToLineModule } from '../WordsToLineModule/WordsToLineModule';
import * as defaultConfig from './defaultConfig.json';

interface Options {
	keyPatterns?: {
		value: object; // object of type { keyname: Array<string> } to represent various keys and set of patterns to match
	};
	keyValueDividerChars?: string[];
	thresholdRatio?: {
		value: number;
		range: {
			min: number;
			max: number;
		};
	};
}

const defaultOptions = (defaultConfig as any) as Options;

export type KeyCandidate = {
	words: Word[];
	matchingPattern: string;
	score: number;
	keyName: string;
};

/**
 * Detect key value pairs in a document, of the type <Key> <Seperator> <Value>, using a thresholdRatio probability.
 */
export class KeyValueDetectionModule extends Module<Options> {
	public static moduleName = 'key-value-detection';
	public static dependencies = [WordsToLineModule];

	constructor(options?: Options) {
		super(options, defaultOptions);
	}

	public main(doc: Document): Document {
		if (this.options.thresholdRatio.value === undefined) {
			logger.info('Not computing key-value pairs, no thresholdRatio vas specified');
			return doc;
		} else if (this.options.keyPatterns.value === {}) {
			logger.info('The key patterns not precised. Not computing key-value pairs.');
			return doc;
		} else {
			logger.info(
				'Detecting key-value pairs, for key patterns',
				Object.keys(this.options.keyPatterns.value),
				'...',
			);
		}

		// Extract collections of key-matches for each permutation of word length in a particular line,
		// then select the highest scoring matches above the limiting thresholdRatio.
		doc.pages.forEach(page => {
			logger.debug('----------------- page', page.pageNumber);
			const allLines: Line[] = page.getElementsOfType<Line>(Line);
			const allKeys: KeyCandidate[] = [];

			for (const [key, patterns] of Object.entries(this.options.keyPatterns.value)) {
				allLines.forEach(line => {
					if (Array.isArray(patterns)) {
						const bestKey: KeyCandidate = patterns
							.map(p => {
								return this.findKeys(key, p, line.content).sort((a, b) => b.score - a.score)[0];
							})
							.filter(k => typeof k !== 'undefined' && k.words.length !== 0)
							.filter(c => c.score > this.options.thresholdRatio.value)
							.reduce(this.takeBestScore, {
								score: 0,
								words: [],
								matchingPattern: '',
								keyName: '',
							});
						if (bestKey.score !== 0) {
							allKeys.push(bestKey);
						}
					}
				});
			}

			const uniqueKeys: KeyCandidate[] = [];
			const overlappingKeysArray: KeyCandidate[][] = [];

			// Using bins to group keys by word they apply to
			allKeys.forEach(key1 => {
				// Try to find a bin with overlapping words
				const overlappingKeys = overlappingKeysArray.filter(o => {
					return o.some(key2 => key1.words.some(w => key2.words.includes(w)));
				});

				if (overlappingKeys.length > 0) {
					overlappingKeys[0].push(key1);
				} else {
					overlappingKeysArray.push([key1]);
				}
			});

			overlappingKeysArray.forEach(overlappingKeys => {
				const highestScoreKey: KeyCandidate = overlappingKeys.reduce(this.takeBestScore, {
					score: 0,
					words: [],
					matchingPattern: '',
					keyName: '',
				});

				uniqueKeys.push(highestScoreKey);
			});

			uniqueKeys.forEach(key => {
				const values: Word[] = this.findValues(key, uniqueKeys, page);

				if (values.length > 0) {
					const metadata: KeyValueMetadata = new KeyValueMetadata([...key.words, ...values], {
						keyName: key.keyName,
						keyElements: key.words,
						valueElements: values,
					});

					logger.debug(
						`${key.keyName}: ${key.words.map(k => k.toString())}, ${values.map(k =>
							k.toString(),
						)} - ${key.score}`,
					);

					metadata.elements.forEach(v => v.metadata.push(metadata));
				}
			});
		});

		logger.debug('Done with key-value pair detection');
		return doc;
	}

	/**
	 *
	 * @param entry The KeyCandidate with which the keys are to be matched.
	 * @param keyCandidates All the key candidates, so that a value inside these key candidates is not matched.
	 * @param page The current page on which the key's values are to be matched.
	 */
	private findValues(entry: KeyCandidate, keyCandidates: KeyCandidate[], page: Page): Word[] {
		const keyBox: BoundingBox = BoundingBox.merge(entry.words.map(w => w.box));

		const nextKeyBox: BoundingBox = keyCandidates
			.map(keyCandidate => {
				return BoundingBox.merge(keyCandidate.words.map(w => w.box));
			})
			.filter((box: BoundingBox) => {
				return box.bottom >= keyBox.top && box.top <= keyBox.bottom && box.left >= keyBox.right;
			})
			.reduce((a, b) => {
				if (a.left <= b.left) {
					return a;
				} else {
					return b;
				}
			}, new BoundingBox(Infinity, Infinity, Infinity, Infinity));

		return page.getElementsOfType<Word>(Word).filter(word => {
			return (
				word.bottom >= keyBox.top &&
				word.top <= keyBox.bottom &&
				word.left >= keyBox.right &&
				word.right <= nextKeyBox.left &&
				keyCandidates.every(keyCandindate => !keyCandindate.words.includes(word)) &&
				!this.options.keyValueDividerChars.value.includes(word.toString())
			);
		});
	}

	/**
	 *
	 * @param key A key to be matched, corresponding to the name of a value class to be matched.
	 * @param pattern the string pattern to be matched with each candidate.
	 * @param words All the words for the pattern to be matched with.
	 */
	private findKeys(key, pattern: string, words: Word[]): KeyCandidate[] {
		const filteredWords: Word[] = words.filter(
			w => !this.options.keyValueDividerChars.value.includes(w.toString()),
		);

		let wordCollections: Word[][] = [];
		for (let len = 1; len !== words.length; ++len) {
			wordCollections = [...wordCollections, ...getSubCollections<Word>(filteredWords, len)];
		}

		const bestMatch: KeyCandidate = {
			score: 0.0,
			words: [],
			matchingPattern: pattern,
			keyName: key,
		};

		const keys: KeyCandidate[] = wordCollections.map(wc => {
			const wcString: string = wc
				.map(w => w.toString().trim())
				.reduce((w1, w2) => w1 + ' ' + w2, '')
				.trim()
				.replace(new RegExp(`(?:\\${this.options.keyValueDividerChars.value.join('|\\')})`), '');
			const score: number = string_similarity.compareTwoStrings(wcString, pattern);
			if (score > bestMatch.score) {
				bestMatch.words = wc;
				bestMatch.score = score;
			}
			return bestMatch;
		});
		return keys;
	}

	private takeBestScore(a: KeyCandidate, b: KeyCandidate) {
		if (a.score >= b.score) {
			return a;
		} else {
			return b;
		}
	}
}
