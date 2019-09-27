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

import * as stringify from 'csv-stringify/lib/sync';
import * as fs from 'fs';
import * as path from 'path';

import { Page, Table } from '../../types/DocumentRepresentation';
import { Exporter } from '../Exporter';

export class CsvExporter extends Exporter {
	public export(outputPath: string): Promise<any> {
		const promises: Array<Promise<any>> = [];
		const ext = '.csv';

		// FIXME This is a dirty way to check if the folder already exists
		try {
			fs.mkdirSync(`${path.dirname(outputPath)}/csv`);
		} catch {
			// noop
		}

		outputPath = `${path.dirname(outputPath)}/csv/${path.basename(outputPath, ext)}`;

		this.doc.pages.forEach((page: Page) => {
			let index = 1;

			page.elements
				.filter(e => e instanceof Table)
				.forEach((table: Table) => {
					promises.push(
						this.writeFile(
							`${outputPath}-${page.pageNumber}-${index}${ext}`,
							this.getCsvContent(table),
						),
					);
					index++;
				});
		});

		return Promise.all(promises);
	}

	private getCsvContent(table: Table): string {
		return stringify(table.toArray(), { delimiter: ';' });
	}
}
