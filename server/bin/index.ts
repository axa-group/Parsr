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

import * as child_process from 'child_process';
import * as commander from 'commander';
import * as filetype from 'file-type';
import * as fs from 'fs';
import * as path from 'path';
import { Cleaner } from '../src/Cleaner';
import { AbbyyTools } from '../src/input/abbyy/AbbyyTools';
import { AbbyyToolsXml } from '../src/input/abbyy/AbbyyToolsXml';
import { GoogleVisionExtractor } from '../src/input/google-vision/GoogleVisionExtractor';
import { JsonExtractor } from '../src/input/json/JsonExtractor';
import { PdfminerExtractor } from '../src/input/pdfminer/PdfminerExtractor';
import { TesseractExtractor } from '../src/input/tesseract/TesseractExtractor';
import { Orchestrator } from '../src/Orchestrator';
import { CsvExporter } from '../src/output/csv/CsvExporter';
import { JsonExporter } from '../src/output/json/JsonExporter';
import { MarkdownExporter } from '../src/output/markdown/MarkdownExporter';
import { PdfExporter } from '../src/output/pdf/PdfExporter';
import { TextExporter } from '../src/output/text/TextExporter';
import { Config } from '../src/types/Config';
import { Document } from '../src/types/DocumentRepresentation/';
import * as utils from '../src/utils';
import logger from '../src/utils/Logger';

/**
 * Runs the CLI handler for Parsr
 */
function main(): void {
	commander
		.option('-f, --input-file <filename>', 'Input file to be processed')
		.option(
			'-o, --output-folder <foldername>',
			'Location of the folder where the output will be stored',
		)
		.option('-n, --document-name [name]', 'Name of the document')
		.option(
			'-c, --config <filename>',
			"The file's path from which the application's parameres will be loaded",
		)
		.option(
			'-l, --log-level <verbosity>',
			'Verbosity level: debug, info (default), warn, error',
			'info',
		)
		.option('-p, --pretty-logs', 'Make logs look pretty but unreadable for a machine')
		.parse(process.argv);

	logger.init(!!commander.prettyLogs);
	logger.level = commander.logLevel;

	printVersion();

	let filePath: string = path.resolve(commander.inputFile);
	const outputFolder: string = path.resolve(commander.outputFolder);
	const documentName: string = commander.documentName;
	const configPath: string = path.resolve(commander.config);
	let fileType: { ext: string; mime: string } = filetype(fs.readFileSync(filePath));
	const configStr: string = fs.readFileSync(configPath, 'utf-8');
	const config: Config = new Config(JSON.parse(configStr));

	logger.info('Using config:');
	logger.info(utils.prettifyObject(config));

	const cleaner: Cleaner = new Cleaner(config);
	let orchestrator: Orchestrator;

	if (!fileType) {
		fileType = { ext: '', mime: '' };
		const a = filePath.split('.');
		fileType.ext = a[a.length - 1];
	}

	/**
	 * Decide file type and associate a suitable orchestrator
	 */
	if (fileType.ext === 'xml') {
		orchestrator = new Orchestrator(new AbbyyToolsXml(config), cleaner);
	} else if (fileType.ext === 'pdf') {
		orchestrator = getPdfExtractor();
	} else if (fileType.mime.slice(0, 5) === 'image') {
		orchestrator = getImgExtractor();
	} else if (fileType.ext === 'json') {
		orchestrator = getJsonExtractor();
	} else {
		process.exit(1);
		throw new Error('Input file is neither a PDF nor an image');
	}

	/**
	 * Run the extraction pipeline on the file
	 */
	runOrchestrator();

	/**
	 * Run the pipeline - go through the extraction, cleaning, and enrichment modules.
	 *
	 * @remarks
	 * This method contains the primary pipeline call itself.
	 */
	function runOrchestrator() {
		orchestrator
			.run(filePath)
			.then((doc: Document) => {
				const nbTexts = doc.pages.map(p => p.elements.length).reduce((a, b) => a + b, 0);
				if (nbTexts === 0) {
					logger.warn(
						`No text was found in the document. Trying to treat it as an image and perform OCR using ${config.extractor.img}...`,
					);
					if (config.extractor.img === 'tesseract') {
						filePath = pdfToImage(filePath);
						orchestrator = new Orchestrator(new TesseractExtractor(config), cleaner);
					} else {
						orchestrator = new Orchestrator(new AbbyyTools(config), cleaner);
					}

					return orchestrator.run(filePath);
				} else {
					return doc;
				}
			})
			.then((doc: Document) => {
				const promises: Array<Promise<any>> = [];

				if (config.output.formats.json) {
					promises.push(
						new JsonExporter(doc, config.output.granularity).export(
							`${outputFolder}/${documentName}.json`,
						),
					);
				}

				// if (config.output.formats['json-compact']) {
				// 	promises.push(
				// 		new JsonCompactExporter(doc).export(
				// 			`${outputFolder}/${documentName}.compact.json`,
				// 		),
				// 	);
				// }

				if (config.output.formats.text) {
					promises.push(
						new TextExporter(doc, config.output.includeMarginals).export(
							`${outputFolder}/${documentName}.txt`,
						),
					);
				}

				if (config.output.formats.markdown) {
					promises.push(
						new MarkdownExporter(doc, config.output.includeMarginals).export(
							`${outputFolder}/${documentName}.md`,
						),
					);
				}

				// if (config.output.formats.xml) {
				// 	promises.push(
				// 		new XmlExporter(doc).export(
				// 			`${outputFolder}/${documentName}.md`
				// 		)
				// 	);
				// }

				// if (config.output.formats.confidences) {
				// 	promises.push(
				// 		new ConfidencesExporter(doc).export(
				// 			`${outputFolder}/${documentName}.confidences`
				// 		)
				// 	);
				// }

				if (config.output.formats.csv) {
					promises.push(new CsvExporter(doc).export(`${outputFolder}/${documentName}.csv`));
				}

				if (config.output.formats.pdf) {
					promises.push(
						new PdfExporter(doc, config.output.includeMarginals).export(
							`${outputFolder}/${documentName}.pdf`,
						),
					);
				}

				logger.debug('Done');
				return Promise.all(promises);
			})
			.catch(err => {
				logger.error(err);
			});
	}

	/**
	 * Returns the pdf extraction orchestrator depending on the extractor selection made in the configuration.
	 *
	 * @returns The Orchestrator instance
	 */
	function getPdfExtractor(): Orchestrator {
		if (config.extractor.pdf === 'abbyy') {
			return new Orchestrator(new AbbyyTools(config), cleaner);
		} else if (config.extractor.pdf === 'tesseract') {
			filePath = pdfToImage(filePath);
			return new Orchestrator(new TesseractExtractor(config), cleaner);
		} else {
			return new Orchestrator(new PdfminerExtractor(config), cleaner);
		}
	}

	/**
	 * Returns the json extraction orchestrator depending on the extractor selection made in the configuration.
	 *
	 * @returns The Orchestrator instance
	 */
	function getJsonExtractor(): Orchestrator {
		return new Orchestrator(new JsonExtractor(config), cleaner);
	}

	/**
	 * Returns the img extraction orchestrator depending on the extractor selection made in the configuration.
	 *
	 * @returns The Orchestrator instance
	 */
	function getImgExtractor(): Orchestrator {
		if (config.extractor.img === 'tesseract') {
			return new Orchestrator(new TesseractExtractor(config), cleaner);
		} else if (config.extractor.img === 'google-vision') {
			return new Orchestrator(new GoogleVisionExtractor(config), cleaner);
		} else {
			return new Orchestrator(new AbbyyTools(config), cleaner);
		}
	}

	/**
	 * Returns the pdf file extraction orchestrator using tesseract as the extractor.
	 * First, the pdf is sampled for it to be converted into an image, then, an image extraction orchestrator is returned.
	 *
	 * @returns The Orchestrator instance
	 */
	function pdfToImage(pdfPath: string): string {
		const tifFilePath = pdfPath + '.tiff';
		const ret = child_process.spawnSync(utils.getConvertPath(), [
			'convert',
			'-density',
			'200x200',
			'-compress',
			'Fax',
			pdfPath,
			tifFilePath,
		]);

		if (ret.status !== 0) {
			logger.error(ret.stderr);
			throw new Error(
				'ImageMagick failure: impossible to convert pdf to images (is ImageMagick installed?)',
			);
		}

		return tifFilePath;
	}
}

/**
 * Outputs the current version of the code into the logger.
 * Uses the git repository to retrieve this information using the command 'git'.
 * If the git command fails, a failure message is logged.
 */
function printVersion() {
	try {
		const message = child_process
			.spawnSync(
				'git',
				['--no-pager', 'show', '-s', '--no-color', '--format=[%h] %d - %s - (%cd, %cn <%ce>)'],
				{ encoding: 'utf-8' },
			)
			.output.join('')
			.trim();
		logger.info('Current version: ' + message);
	} catch (e) {
		logger.info('No info found about the current version');
	}
}

/**
 * Exits the program printing the exit code.
 */
process.on('exit', code => {
	return logger.info(`Exiting with code ${code}`);
});

main();
