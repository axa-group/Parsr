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

import {
	BoundingBox,
	Character,
	Document,
	Line,
	Page,
	Word,
} from '../../types/DocumentRepresentation';
import { Module } from '../Module';
import * as defaultConfig from './defaultConfig.json';

/**
 * Stability: Experimental
 * Merge elements or replace contents to make some words look like numbers when
 * they are matching a pattern.
 */

interface Options {
	numberRegExp?: string;
	fixSplitNumbers?: boolean;
	maxConsecutiveSplits?: number;
	whitelist?: [];
}

// The default regexps might be changed depending of the language and number notation.
// French accounting notation: 1234567,89
// US English scientific notation: 1.892323
// US English accounting notation: 1,234,567.89
const defaultOptions = (defaultConfig as any) as Options;

function charArrayToString(input: Character[] | string): string {
	if (Array.isArray(input)) {
		const a = input.map(char => char.content).join('');
		return a;
	}
	return input;
}

export class NumberCorrectionModule extends Module<Options> {
	public static moduleName = 'number-correction';

	constructor(options?: Options) {
		super(options, defaultOptions);
	}

	public main(doc: Document): Document {
		const options = Object.assign(defaultOptions, this.options);
		doc.pages.forEach(page => {
			// Correct numbers embedded into Words
			this.correctWords(page);
			// Correct numbers that might be split by mistake into exactly 2 Words under a Line node.
			if (options.fixSplitNumbers) {
				this.correctLines(page);
			}
		});

		return doc;
	}

	public suggestNumberCorrections(
		inputStr: string,
		numberRegExp: RegExp,
		whitelist?: Set<string>,
		preCandidates?: Map<string, number>,
	): Array<[string, number]> {
		const proximityLetters = {
			',': '.',
			D: '0',
			I: '1',
			O: '0',
			S: '5',
			T: '1',
			o: '0',
		};

		const deletes = ' "\''.split('');

		function isValidNumber(input: string): boolean {
			return numberRegExp.test(input);
		}

		function generateEdits(word: string) {
			const results: string[] = [];

			// Proximity replacements
			let proximity = word;
			Object.keys(proximityLetters).forEach(letter => {
				const re = RegExp(letter, 'g');
				proximity = proximity.replace(re, proximityLetters[letter]);
			});
			results.push(proximity);

			// Right-most comma replacement 1,232,20 -> 1,232.20
			if (RegExp(',[0-9]{2}$').test(word)) {
				results.push(word.slice(0, word.length - 3) + '.' + word.slice(word.length - 2));
			}

			// Insert decimal separator for accounting notation only with leading 0
			// 000 -> 0.00
			// 00001 -> 0.0001
			// 12345 -> 12345
			if (RegExp('^0[^\\.]+$').test(word)) {
				results.push(word.slice(0, 1) + '.' + word.slice(1));
			}

			// Deletes
			deletes.forEach(letterToDel => {
				const re = RegExp(letterToDel, 'g');
				results.push(word.replace(re, ''));
			});

			return results;
		}

		function checkAndPopulateCanditates(list: string[], score: number): Map<string, number> {
			const candidates = new Map<string, number>();
			list.forEach(edit => {
				if (isValidNumber(edit) /* && !candidates.has(edit) */) {
					candidates.set(edit, score);
				}
			});
			return candidates;
		}

		function suggest(input: string): Array<[string, number]> {
			// bail out if the input is too large - TODO: move this to the options
			if (input.length > 16) {
				return new Array<[string, number]>();
			}
			// bail out if the input is white listed
			if (whitelist && whitelist.has(input)) {
				return new Array<[string, number]>();
			}

			// Generate a scored set of candidates
			let candidates: Map<string, number> = preCandidates
				? preCandidates
				: new Map<string, number>();
			if (isValidNumber(input)) {
				candidates.set(input, 0);
			}
			const editsLevel1 = generateEdits(input);
			candidates = new Map([...checkAndPopulateCanditates(editsLevel1, 1), ...candidates]);
			editsLevel1.forEach(edit1 => {
				// Generate 2nd level edits
				// We need at least 2 level edits to get from ooo => 000 (level 1) => 0.00 (level 2)
				// We could consider going deeper with generators (to save a bit of memory).
				const editsLevel2 = generateEdits(edit1);
				// Scoring might be improved, we currently consider bigger changes as better changes.
				candidates = new Map([...checkAndPopulateCanditates(editsLevel2, 2), ...candidates]);
			});

			const sortedCandidates = Array.from(candidates.keys())
				.sort((a: string, b: string) => {
					return candidates.get(b) - candidates.get(a);
				})
				.map((k: string): [string, number] => {
					return [k, candidates.get(k)];
				});
			// Return an ordered list, high scoring changes should be more important
			// and preferred suggestions
			return sortedCandidates;
		}

		return suggest(inputStr);
	}

	private correctWord(word: Word, preCandidates?: Map<string, number>) {
		const content = charArrayToString(word.content);
		const suggestion = this.getBestSuggestion(content, preCandidates);
		if (suggestion) {
			word.content = suggestion;
		}
	}

	private getBestSuggestion(input: string, preCandidates?: Map<string, number>): string | null {
		const suggestions = this.suggestNumberCorrections(
			input,
			RegExp(this.options.numberRegExp),
			new Set(this.options.whitelist),
			preCandidates,
		);
		if (suggestions.length > 0) {
			return suggestions[0][0];
		}
		return null;
	}

	private correctWords(page: Page) {
		page.getElementsOfType<Word>(Word).forEach(word => {
			this.correctWord(word);
		});
	}

	private scorePreCandidate(input: string): number {
		let score = 0;
		if (RegExp('\\.[0-9]{2}$').test(input)) {
			score += 10;
		}
		return score;
	}

	private generateCandidateMap(candidates: Word[]): Map<string, number> {
		const scoredCandidates = new Map<string, number>();
		candidates.forEach(word => {
			const wordContent = charArrayToString(word.content);
			scoredCandidates.set(wordContent, this.scorePreCandidate(wordContent));
		});
		return scoredCandidates;
	}

	private correctLines(page: Page) {
		page.getElementsOfType<Line>(Line).map(line => {
			if (
				line.content &&
				line.content.length >= 2 &&
				line.content.length <= this.options.maxConsecutiveSplits
			) {
				// Make sure words are numbers
				const consecutiveWordsAreNumbers = line.content.reduce((acc, word) => {
					return acc && /^[0-9,. "']+$/.test(charArrayToString(word.content));
				}, true);
				if (!consecutiveWordsAreNumbers) {
					return;
				}
				const candidates: Word[] = [' ', ',', '.'].map(sep =>
					line.content.reduce((acc, e) => {
						return new Word(
							BoundingBox.merge([e.box, acc.box]),
							charArrayToString(acc.content) + sep + charArrayToString(e.content),
							e.font,
							e.language,
						);
					}),
				);
				const defaultCandidate = candidates[0];
				const suggestion = this.getBestSuggestion(
					charArrayToString(defaultCandidate.content),
					this.generateCandidateMap(candidates),
				);
				if (suggestion) {
					defaultCandidate.content = suggestion;
					line.content = [defaultCandidate];
				}
			}
		});
	}
}
