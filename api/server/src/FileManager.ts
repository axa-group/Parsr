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
import * as path from 'path';
import { Binder, FileMapper, OutputConfig, SingleFileType } from './types';

export class FileManager {
	private fileSystem: FileMapper = {};

	public newBinder(
		docId: string,
		document: string,
		configPath: string,
		outputPath: string,
		docName: string,
	): Binder {
		const binder: Binder = {
			input: document,
			name: docName,
			outputPath,
			config: configPath,
		};

		this.fileSystem[docId] = binder;

		return this.fileSystem[docId];
	}

	public getCsvFilePath(docId: string, page: number, table: number) {
		const binder: Binder = this.getBinder(docId);

		const absPath: string = path.resolve(
			`${binder.outputPath}/csv/${binder.name}-${page}-${table}.csv`,
		);

		if (!fs.existsSync(absPath)) {
			throw new Error(`File not found for document ID ${docId}`);
		}

		return absPath;
	}

	public getFilePath(docId: string, type: SingleFileType | 'csvs'): string {
		const binder = this.getBinder(docId);

		if (type === 'json') {
			return this.checkFile(binder, `${binder.name}.json`);
		}

		if (type === 'markdown') {
			return this.checkFile(binder, `${binder.name}.md`);
		}

		if (type === 'pdf') {
			return this.checkFile(binder, `${binder.name}.pdf`);
		}

		if (type === 'text') {
			return this.checkFile(binder, `${binder.name}.txt`);
		}

		if (type === 'xml') {
			return this.checkFile(binder, `${binder.name}.xml`);
		}

		if (type === 'confidances') {
			return this.checkFile(binder, `${binder.name}-confidances.txt`);
		}

		if (type === 'csvs') {
			const absPath = path.resolve(`${binder.outputPath}/csv`);

			if (!fs.existsSync(absPath)) {
				throw new Error(`Folder of CSV files not found for document ID ${docId}`);
			}

			return absPath;
		}
	}

	public getBinder(docId: string): Binder {
		if (this.fileSystem[docId]) {
			return this.fileSystem[docId];
		} else {
			throw new Error(`Binder with Document ID ${docId} not found.`);
		}
	}

	private checkFile(binder: Binder, filePath: string): string {
		const absPath = path.resolve(`${binder.outputPath}/${filePath}`);

		if (!fs.existsSync(absPath)) {
			throw new Error(`File not found`);
		}

		return absPath;
	}
}
