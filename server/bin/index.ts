/**
 * Copyright 2020 AXA Group Operations S.A.
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
import { AbbyyToolsLocalXml } from '../src/input/abbyy/AbbyyToolsXml';
import { DocxExtractor } from '../src/input/doc/DocxExtractor';
import { EmailExtractor } from '../src/input/email/EmailExtractor';
import { JsonExtractor } from '../src/input/json/JsonExtractor';
import { Orchestrator } from '../src/Orchestrator';
import { CsvExporter } from '../src/output/csv/CsvExporter';
import { JsonExporter } from '../src/output/json/JsonExporter';
import { MarkdownExporter } from '../src/output/markdown/MarkdownExporter';
import { PdfExporter } from '../src/output/pdf/PdfExporter';
import { SimpleJsonExporter } from '../src/output/simpleJson/SimpleJsonExporter';
import { TextExporter } from '../src/output/text/TextExporter';
import { Config } from '../src/types/Config';
import { Document } from '../src/types/DocumentRepresentation/';
import * as utils from '../src/utils';
import * as CommandExecuter from '../src/utils/CommandExecuter';
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
      `${__dirname}/defaultConfig.json`,
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
  const config: Config = new Config(configStr);

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
    orchestrator = new Orchestrator(new AbbyyToolsLocalXml(), cleaner);
  } else if (fileType.ext === 'pdf') {
    orchestrator = new Orchestrator(utils.getPdfExtractor(config), cleaner);
  } else if (fileType.mime.slice(0, 5) === 'image') {
    orchestrator = new Orchestrator(utils.getOcrExtractor(config), cleaner);
  } else if (fileType.ext === 'json') {
    orchestrator = new Orchestrator(new JsonExtractor(config), cleaner);
  } else if (fileType.ext === 'eml') {
    orchestrator = new Orchestrator(new EmailExtractor(config), cleaner);
  } else if (fileType.ext === 'docx') {
    orchestrator = new Orchestrator(new DocxExtractor(config), cleaner);
  } else {
    throw new Error('Input file format is unsupported');
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
        copyAssetsToOutputFolder(doc);
        return doc;
      })
      .then((doc: Document) => {
        const promises: Array<Promise<any>> = [];
        if (config.output.formats.json) {
          promises.push(
            new JsonExporter(doc, config.output.granularity, config.output.includeDrawings).export(
              `${outputFolder}/${omitFilenameExtension(documentName)}.json`,
            ),
          );
        }
        if (config.output.formats.simpleJson) {
          promises.push(
            new SimpleJsonExporter(doc, false).export(
              `${outputFolder}/${omitFilenameExtension(documentName)}.simple.json`,
            ),
          );
        }

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
        if (err && err.stack) {
          logger.error(`There was an error running the orchestrator: ${err.stack}`);
        }
        logger.error(JSON.stringify(err));
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
}

/**
 * Outputs the current version of the code into the logger.
 * Uses the git repository to retrieve this information using the command 'git'.
 * If the git command fails, a failure message is logged.
 */
function printVersion() {
  try {
    const message = CommandExecuter.spawnSync(
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
