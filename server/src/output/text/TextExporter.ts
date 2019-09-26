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

import { Document, Paragraph, Table } from '../../types/DocumentRepresentation';
import { Exporter } from '../Exporter';

export class TextExporter extends Exporter {
	private includeHeaderFooter: boolean;

	constructor(doc: Document, includeHeaderFooter: boolean) {
		super(doc);
		this.includeHeaderFooter = includeHeaderFooter;
	}

	public export(outputPath: string): Promise<any> {
		return this.writeFile(outputPath, this.getPlainText());
	}

	private getPlainText(): string {
		let output: string = '';
		this.doc.pages.forEach(page => {
			page.elements.forEach(element => {
				if (
					(element.properties.isHeader || element.properties.isFooter) &&
					!this.includeHeaderFooter
				) {
					return;
				}
				if (element instanceof Paragraph) {
					output = output.concat(element.toString());
				} else if (element instanceof Table) {
					element.content.forEach(tableRow => {
						tableRow.content.forEach(tableCell => {
							tableCell.content.forEach(para => {
								const paraContent: string = para.toString().replace(/\n/, '');
								output = output.concat(paraContent);
								// output = output.concat('\t');
							});
							output = output.concat('\t');
						});
						output = output.concat('\n');
					});
					output = output.concat('\n\n');
				}
				// end of paragraph
				output = output.concat('\n\n');
			});
			// end of page
			output = output.concat('\n'.repeat(10));
		});
		return output;
	}
}
