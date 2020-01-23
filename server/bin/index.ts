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

import * as commander from 'commander';
import * as filetype from 'file-type';
import * as fs from 'fs';
import * as path from 'path';
import { Cleaner } from '../src/Cleaner';
import { AbbyyTools } from '../src/input/abbyy/AbbyyTools';
import { AbbyyToolsXml } from '../src/input/abbyy/AbbyyToolsXml';
import { AmazonTextractExtractor } from '../src/input/amazon-textract/AmazonTextractExtractor';
import { EmailExtractor } from '../src/input/email/EmailExtractor';
import { GoogleVisionExtractor } from '../src/input/google-vision/GoogleVisionExtractor';
import { JsonExtractor } from '../src/input/json/JsonExtractor';
import { MicrosoftCognitiveExtractor } from '../src/input/ms-cognitive-services/MicrosoftCognitiveServices';
import { TesseractExtractor } from '../src/input/tesseract/TesseractExtractor';
import { Orchestrator } from '../src/Orchestrator';
import { CsvExporter } from '../src/output/csv/CsvExporter';
import { JsonExporter } from '../src/output/json/JsonExporter';
import { MarkdownExporter } from '../src/output/markdown/MarkdownExporter';
import { PdfExporter } from '../src/output/pdf/PdfExporter';
import { TextExporter } from '../src/output/text/TextExporter';
import { Config } from '../src/types/Config';
import { Document, Image } from '../src/types/DocumentRepresentation/';
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
      "The file's path from which the application's parameters will be loaded",
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

  const filePath: string = path.resolve(commander.inputFile);
  const outputFolder: string = path.resolve(commander.outputFolder);
  if (!fs.existsSync(outputFolder)) {
    logger.info(`Requested output folder ${outputFolder} did not exist. Creating... `);
    try {
      fs.mkdirSync(outputFolder);
    } catch (err) {
      logger.error(`Error creating the requested output folder ${outputFolder}: ${err}`);
      throw err;
    }
  }
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
    orchestrator = new Orchestrator(utils.getPdfExtractor(config), cleaner);
  } else if (fileType.mime.slice(0, 5) === 'image') {
    orchestrator = getImgExtractor();
  } else if (fileType.ext === 'json') {
    orchestrator = getJsonExtractor();
  } else if (fileType.ext === 'eml') {
    orchestrator = getEmlExtractor();
  } else {
    throw new Error('Input file format is unsupported');
  }

  /**
   * Run the extraction pipeline on the file
   */
  runOrchestrator(fileType);

  /**
   * Run the pipeline - go through the extraction, cleaning, and enrichment modules.
   *
   * @remarks
   * This method contains the primary pipeline call itself.
   */
  function runOrchestrator(fileTypeInfo: { ext: string; mime: string }) {
    orchestrator
      .run(filePath)
      .then((doc: Document) => {
        if (fileTypeInfo.ext === 'pdf' && isDocumentImageBased(doc)) {
          logger.info(
            `Since the input file is a PDF with only images, trying to run an OCR on all pages...`,
          );
          return getImgExtractor().run(filePath);
        }
        return doc;
      })
      .then((doc: Document) => {
        copyAssetsToOutputFolder(doc);
        return doc;
      })
      .then((doc: Document) => {
        const promises: Array<Promise<any>> = [];
        if (config.output.formats.json) {
          promises.push(
            new JsonExporter(doc, config.output.granularity).export(
              `${outputFolder}/${omitFilenameExtension(documentName)}.json`,
            ),
          );
        }

        // if (config.output.formats['json-compact']) {
        // 	promises.push(
        // 		new JsonCompactExporter(doc).export(
        // 			`${outputFolder}/${omitFilenameExtension(documentName)}.compact.json`,
        // 		),
        // 	);
        // }

        if (config.output.formats.text) {
          promises.push(
            new TextExporter(doc, config.output.includeMarginals).export(
              `${outputFolder}/${omitFilenameExtension(documentName)}.txt`,
            ),
          );
        }

        if (config.output.formats.markdown) {
          promises.push(
            new MarkdownExporter(doc, config.output.includeMarginals, documentName).export(
              `${outputFolder}/${omitFilenameExtension(documentName)}.md`,
            ),
          );
        }

        // if (config.output.formats.xml) {
        // 	promises.push(
        // 		new XmlExporter(doc).export(
        // 			`${outputFolder}/${omitFilenameExtension(documentName)}.md`
        // 		)
        // 	);
        // }

        // if (config.output.formats.confidences) {
        // 	promises.push(
        // 		new ConfidencesExporter(doc).export(
        // 			`${outputFolder}/${omitFilenameExtension(documentName)}.confidences`
        // 		)
        // 	);
        // }

        if (config.output.formats.csv) {
          promises.push(
            new CsvExporter(doc).export(
              `${outputFolder}/${omitFilenameExtension(documentName)}.csv`,
            ),
          );
        }

        if (config.output.formats.pdf) {
          promises.push(
            new PdfExporter(doc, config.output.includeMarginals).export(
              `${outputFolder}/${omitFilenameExtension(documentName)}.pdf`,
            ),
          );
        }

        function omitFilenameExtension(filename: string): string {
          return filename.replace(/\.[^/.]+$/, '');
        }

        logger.debug('Done');
        return Promise.all(promises);
      })
      .catch(err => {
        logger.error(`There was an error running the orchestrator: ${err}`);
      });
  }

  function copyAssetsToOutputFolder(doc: Document) {
    if (!doc.assetsFolder) {
      return;
    }
    const destinationFolder = outputFolder + '/assets_' + documentName;
    const filesToCopy: Array<{ from: string; to: string }> = [];
    fs.readdirSync(doc.assetsFolder).forEach(file => {
      const imageFileType: { ext: string; mime: string } = filetype(
        fs.readFileSync(doc.assetsFolder + '/' + file),
      );

      if (imageFileType != null && imageFileType.mime.slice(0, 5) === 'image') {
        filesToCopy.push({
          from: doc.assetsFolder + '/' + file,
          to: destinationFolder + '/' + path.basename(file),
        });
      }
    });
    filesToCopy.forEach(file => {
      try {
        if (!fs.existsSync(destinationFolder)) {
          fs.mkdirSync(destinationFolder);
        }
        fs.copyFileSync(file.from, file.to);
      } catch (e) {
        logger.error('Error copying assets');
        logger.error(e);
      }
    });
  }

  /**
   * Tests if a PDF file only contains an image on each and every one of its pages
   * This is true for example, in the case of scanned documents as PDFs
   */
  function isDocumentImageBased(doc: Document): boolean {
    return !doc.pages
      .map(p => p.elements.length === 1 && p.elements[0] instanceof Image)
      .includes(false);
  }

  /**
   * Returns the email extraction orchestrator.
   * This extractor has no need of a configuration file or a cleaner
   * @returns The Orchestrator instance
   */
  function getEmlExtractor(): Orchestrator {
    return new Orchestrator(new EmailExtractor(config), cleaner);
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
    switch (config.extractor.img) {
      case 'tesseract': return new Orchestrator(new TesseractExtractor(config), cleaner);
      case 'google-vision': return new Orchestrator(new GoogleVisionExtractor(config), cleaner);
      case 'ms-cognitive-services': return new Orchestrator(new MicrosoftCognitiveExtractor(config), cleaner);
      case 'amazon-textract': return new Orchestrator(new AmazonTextractExtractor(config), cleaner);
      default: return new Orchestrator(new AbbyyTools(config), cleaner);
    }
  }
}

/**
 * Outputs the current version of the code into the logger.
 * Uses the git repository to retrieve this information using the command 'git'.
 * If the git command fails, a failure message is logged.
 */
function printVersion() {
  try {
    const message = utils
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
