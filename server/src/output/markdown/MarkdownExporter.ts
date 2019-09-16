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

import * as mdtable from 'markdown-table';
import { Document, Heading, List, Paragraph, Table } from '../../types/DocumentRepresentation';
import logger from '../../utils/Logger';
import { Exporter } from '../Exporter';

export class MarkdownExporter extends Exporter {
	private includeHeaderFooter: boolean;

	constructor(doc: Document, includeHeaderFooter: boolean) {
		super(doc);
		this.includeHeaderFooter = includeHeaderFooter;
	}

	public export(outputPath: string): Promise<any> {
		logger.info('Exporting markdown...');
		return this.writeFile(outputPath, this.getMarkdown());
	}

	private getMarkdown(): string {
		let output: string = '';
		this.doc.pages.forEach(page => {
			page.elements.forEach(element => {
				if (
					(element.properties.isHeader || element.properties.isFooter) &&
					!this.includeHeaderFooter
				) {
					return;
				}
				if (element instanceof Heading) {
					if (element.level < 7) {
						let theHeading: string = '';
						for (let i = 0; i !== element.level; ++i) {
							theHeading += '#';
						}
						theHeading += ' ';
						theHeading += element.toString().replace(/(?:\r\n|\r|\n)/g, '<br />');
						output += theHeading;
						output += '\n'.repeat(2);
					} else {
						output += element.toString();
						output += '\n'.repeat(2);
					}
				} else if (element instanceof Paragraph) {
					output += element.toString();
					output += '\n'.repeat(2);
				} else if (element instanceof List) {
					element.content.forEach((para, itemNumber) => {
						const paraText: string = para.toString();
						if (element.isOrdered) {
							output += (itemNumber + 1).toString() + ' ';
						} else {
							output += '- ';
						}
						output += paraText;
						output += '\n';
					});
				} else if (element instanceof Table) {
					output += mdtable(element.toArray());
					output += '\n'.repeat(2);
				}
			});
			// end of page
			output += '\n'.repeat(10);
		});
		return output;
	}
}
