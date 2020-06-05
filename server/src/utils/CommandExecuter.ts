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

import { spawn as spawnChildProcess, spawnSync as spawnSyncChildProcess } from 'child_process';
import * as fs from 'fs';
import * as os from 'os';
import * as path from 'path';
import { getMutoolExtractionFolder, getTemporaryFile } from '../utils';
import Cache from './CacheLayer';
import logger from './Logger';

export interface Dimensions {
  width: number;
  height: number;
}

const COMMANDS = {
  MUTOOL: 'mutool',
  PDF2TXT: ['pdf2txt.py', 'pdf2txt'],
  IDENTIFY: ['magick', 'identify'],
  CONVERT: ['magick', 'convert'],
  PANDOC: 'pandoc',
  DUMPPDF: ['dumppdf.py', 'dumppdf'],
  PYTHON: ['python3', 'python'],
  QPDF: 'qpdf',
};

export function run(cmd: string | string[], args: string[], options?: any): Promise<string> {
  if (!isCommandAvailable(cmd)) {
    const message = `${cmd.toString()} was not found on the system. Are you sure it is installed and added to PATH?`;
    logger.warn(message);
    return new Promise((_resolve, reject) => {
      return reject({
        found: false,
        error: message,
      });
    });
  }

  if (COMMANDS.PDF2TXT === cmd || COMMANDS.DUMPPDF === cmd) {
    // Last PdfMiner version requires to be ran --> python /path_to_pdf2txt/pdf2txt.py args
    return runPythonCommand(cmd, args, options);
  } else {
    return runCommand(cmd, args, options);
  }
}

export function isCommandAvailable(cmd: string | string[]) {
  if (Array.isArray(cmd)) {
    return null != getCommandLocationOnSystem(cmd[0], cmd[1] || '', cmd[2] || '');
  } else {
    return null != getCommandLocationOnSystem(cmd);
  }
}

/**
 * Prepares a command, syncSpawns a child process and returns the object
 */
export function spawnSync(cmd: string, args: string[], options: any = {}): any {
  const cmdComponents: string[] = cmd.split(' ');
  if (cmdComponents.length > 1) {
    args.unshift(...cmdComponents.splice(1, cmdComponents.length));
  }
  return spawnSyncChildProcess(cmdComponents.join(' '), args, options);
}

/**
 * Prepares a command, spawns a child process and returns the object
 */
export function spawn(cmd: string, args: string[], options: any = {}): any {
  const cmdComponents: string[] = cmd.split(' ');
  if (cmdComponents.length > 1) {
    args.unshift(...cmdComponents.splice(1, cmdComponents.length));
  }
  return spawnChildProcess(cmdComponents.join(' '), args, options);
}

/**
 * Repair a pdf using the external qpdf and mutool utilities.
 * Use qpdf to decrcrypt the pdf to avoid errors due to DRMs.
 * @param filePath The absolute filename and path of the pdf file to be repaired.
 */

export async function repairPdf(filePath: string): Promise<string> {
  try {
    const decryptedOutput = await qpdfDecrypt(filePath);
    return mutoolClean(decryptedOutput).catch(() => decryptedOutput);
  } catch ({ found, error }) {
    return mutoolClean(filePath).catch(() => filePath);
  }
}

export function mutoolExtract(filePath: string): Promise<string> {
  const outputFolder = getMutoolExtractionFolder();
  return run(COMMANDS.MUTOOL, ['extract', '-r', filePath], {
    cwd: outputFolder,
  }).then(() => {
    logger.info(`Mutool extract succeed --> ${outputFolder}`);
    return outputFolder;
  });
}

export function pandocDocxToHtml(filePath: string): Promise<string> {
  const assetsFolder = path.dirname(filePath);
  return run(COMMANDS.PANDOC, [filePath, '--extract-media', assetsFolder, '-t', 'html5']).then(
    html => {
      logger.info(`Pandoc docx to html succeed`);
      return html;
    },
  );
}

export function imageCorrection(filePath: string): Promise<string> {
  const args: string[] = [path.join(__dirname, '../../assets/ImageCorrection.py'), filePath];
  return run(COMMANDS.PYTHON, args).then(transformation => {
    logger.info(`Image optimisation succeed`);
    return transformation;
  });
}

export function pdfPagesNumber(filePath: string): Promise<string> {
  const args: string[] = [path.join(__dirname, '../../assets/PdfPageNumber.py'), filePath];
  return run(COMMANDS.PYTHON, args).then(transformation => {
    logger.info(`Pages number extraction succeed`);
    return transformation;
  });
}

export function pandocMdToPdf(mdFilePath: string, pdfOutputPath: string): Promise<string> {
  const args: string[] = [
    '-f',
    'markdown_github+all_symbols_escapable',
    '--pdf-engine=xelatex',
    '--quiet',
    '-s',
    mdFilePath,
    '-o',
    pdfOutputPath,
  ];
  return run(COMMANDS.PANDOC, args, {
    cwd: process.cwd(),
    env: process.env,
  }).then(() => {
    return pdfOutputPath;
  });
}

export function detectTables(
  filePath: string,
  flavor: string,
  lineScale: string,
  pages: string,
  tableAreas: string[],
): Promise<string> {
  const args: string[] = [
    path.join(__dirname, '../../assets/TableDetectionScript.py'),
    filePath,
    flavor,
    lineScale,
    pages,
  ];
  if (tableAreas.length > 0) {
    args.push(tableAreas.join(';'));
  }
  return run(COMMANDS.PYTHON, args).then(tableData => {
    logger.info(`Table detection succeed`);
    return tableData;
  });
}

export function detectTables2(filePath: string, pages: string): Promise<string> {
  const args: string[] = [
    path.join(__dirname, '../../assets/TableDetection2Script.py'),
    filePath,
    pages,
  ];
  return run(COMMANDS.PYTHON, args).then(tableData => {
    logger.info(`Table detection succeed`);
    return tableData;
  });
}

export function pdfMinerExtract(
  filePath: string,
  pages: string,
  rotationDegrees: number = 0,
): Promise<string> {
  const xmlOutputFile: string = getTemporaryFile('.xml');
  let pdf2txtArguments: string[] = [
    '--detect-vertical',
    '-R',
    rotationDegrees.toString(),
    '-c',
    'utf-8',
    '-t',
    'xml',
    '--word-margin',
    '0.2',
    '-o',
    xmlOutputFile,
    filePath,
  ];

  if (pages != null) {
    pdf2txtArguments = ['-p', pages].concat(pdf2txtArguments);
    const from = pages.split(',').shift();
    const to = pages.split(',').pop();
    logger.info('PdfMiner extracting contents (pages ' + from + ' to ' + to + ')');
  }

  const key = ['pdf2txt', ...pdf2txtArguments].filter(arg => arg !== xmlOutputFile).join(' ');
  if (Cache.has(key)) {
    return Promise.resolve(Cache.get(key));
  }

  return run(COMMANDS.PDF2TXT, pdf2txtArguments).then(() => {
    logger.info(`PdfMiner pdf2txt.py succeed --> ${xmlOutputFile}`);
    Cache.set(key, xmlOutputFile);
    return xmlOutputFile;
  });
}

export function dumpPdf(filePath: string): Promise<string> {
  const xmlOutputFile: string = getTemporaryFile('.xml');
  const dumpAarguments = ['-a', '-o', xmlOutputFile, filePath];
  const key = `dumppdf -a -o <outfile> ${filePath}`;
  if (Cache.has(key)) {
    return Promise.resolve(Cache.get(key));
  }
  return run(COMMANDS.DUMPPDF, dumpAarguments).then(() => {
    logger.info(`PdfMiner dumppdf.py succeed --> ${xmlOutputFile}`);
    Cache.set(key, xmlOutputFile);
    return xmlOutputFile;
  });
}

export function magickImageDimensions(filePath: string): Promise<Dimensions[]> {
  const args = ['-format', '%[fx:w]x%[fx:h],', filePath];
  return run(COMMANDS.IDENTIFY, magickRetroCompatibility(COMMANDS.IDENTIFY, args)).then(data => {
    const dimensions = data.split(',');
    const retDimension: Dimensions[] = dimensions.map(dimension => {
      const [width, height] = dimension.split('x').map(s => parseInt(s, 10));
      return { width, height };
    });
    logger.info(`Magick identify succeed`);
    return retDimension;
  });
}

export function magickImageToPdf(filePath: string): Promise<string> {
  const outputFilePath = getTemporaryFile('.pdf');
  const args = [filePath, '-units', 'PixelsPerInch', '-density', '96', outputFilePath];
  return run(COMMANDS.CONVERT, magickRetroCompatibility(COMMANDS.CONVERT, args)).then(() => {
    logger.info(`Magick convert Pdf to image succeed --> ${outputFilePath}`);
    return outputFilePath;
  });
}

export function magickPdfToImages(filePath: string): Promise<string[]> {
  const folder = path.dirname(filePath).concat('/samples');
  try {
    if (!fs.existsSync(folder)) {
      fs.mkdirSync(folder);
    }
  } catch (e) {
    Promise.reject(e);
  }
  const fileName = 'Sample_' + path.basename(filePath, '.pdf');
  const extension = 'jpeg';
  const outPutFilePath = folder + '/' + fileName + '_%03d.' + extension;
  const regExp = new RegExp(fileName + '_(\\d{3}).' + extension);
  const args = [
    '-colorspace',
    'RGB',
    '-density',
    '300x300',
    '-compress',
    'lzw',
    '-alpha',
    'remove',
    '-background',
    'white',
    filePath,
    outPutFilePath,
  ];

  return run(COMMANDS.CONVERT, magickRetroCompatibility(COMMANDS.CONVERT, args)).then(() => {
    logger.info(`Magick convert Pdf to image succeed --> ${folder}`);
    return fs
      .readdirSync(folder)
      .map(file => path.join(folder, file))
      .filter(file => regExp.test(file));
  });
}

function magickRetroCompatibility(command: string[], args: string[]): string[] {
  if (isCommandAvailable(command[0]) && command === COMMANDS.CONVERT) {
    // Magick 7.X --> 'magick convert ' + args
    // Magick 6.X --> 'convert ' + args
    args = ['convert'].concat(args);
  }

  if (isCommandAvailable(command[0]) && command === COMMANDS.IDENTIFY) {
    // Magick 7.X --> 'magick identify ' + args
    // Magick 6.X --> 'identify ' + args
    args = ['identify'].concat(args);
  }
  return args;
}

function qpdfDecrypt(filePath: string): Promise<string> {
  const outputFilePath = getTemporaryFile('.pdf');
  return run(COMMANDS.QPDF, ['--decrypt', '--no-warn', filePath, outputFilePath]).then(() => {
    logger.info(`Qpdf repair succeed --> ${outputFilePath}`);
    return outputFilePath;
  });
}

function mutoolClean(filePath: string): Promise<string> {
  const outputFilePath = getTemporaryFile('.pdf');
  return run(COMMANDS.MUTOOL, ['clean', '-g', filePath, outputFilePath]).then(() => {
    logger.info(`Mutool clean succeed --> ${outputFilePath}`);
    return outputFilePath;
  });
}

function runPythonCommand(cmd: string | string[], args: string[], options?: any): Promise<string> {
  const newArgs = [systemCommandPath(cmd)].concat(args);
  return runCommand(COMMANDS.PYTHON, newArgs, options);
}

function runCommand(cmd: string | string[], args: string[], options?: any): Promise<string> {
  return new Promise((resolve, reject) => {
    const command = availableCommand(cmd);
    logger.info(`executing command: ${command} ${args.join(' ')}`);
    const { stderr, stdout, status } = spawnSync(command, args, options);
    if (status === 0) {
      return resolve((stdout || '').toString());
    }
    logger.error(`executing command error: ${(stderr || '').toString()}`);
    return reject({ found: true, error: (stderr || '').toString() });
  });
}

/**
 * returns the location of a command on a system.
 * @param firstChoice the first choice name of the executable to be located
 * @param secondChoice the second choice name of the executable to be located
 * @param thirdChoice the third choice name of the executable to be located
 */
function getCommandLocationOnSystem(
  firstChoice: string,
  secondChoice: string = '',
  thirdChoice: string = '',
): string {
  const cmdComponents: string[] = firstChoice.split(' ');
  const info = spawnSync(getExecLocationCommandOnSystem(), [cmdComponents[0]]);
  const result = info.status === 0 ? info.stdout.toString().split(os.EOL)[0] : null;
  if (result === null && secondChoice !== '') {
    return getCommandLocationOnSystem(secondChoice, thirdChoice);
  }
  if (result === null) {
    return null;
  }
  return result;
}

/**
 * returns the location of the executable locator command on the current system.
 * on linux/unix machines, this is 'which', on windows machines, it is 'where'.
 */
function getExecLocationCommandOnSystem(): string {
  return os.platform() === 'win32' ? 'where' : 'which';
}

function systemCommandPath(cmd: string | string[]) {
  if (Array.isArray(cmd)) {
    return getCommandLocationOnSystem(cmd[0], cmd[1] || '', cmd[2] || '');
  } else {
    return getCommandLocationOnSystem(cmd);
  }
}

function availableCommand(cmd: string | string[]): string {
  if (!Array.isArray(cmd)) {
    return isCommandAvailable(cmd) ? cmd : null;
  }

  if (isCommandAvailable(cmd[0])) {
    return cmd[0];
  } else if (cmd[1] && isCommandAvailable(cmd[1])) {
    return cmd[1];
  } else if (cmd[2] && isCommandAvailable(cmd[2])) {
    return cmd[2];
  }
  return null;
}
