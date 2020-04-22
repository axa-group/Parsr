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

import archiver from 'archiver';
import { exec, spawnSync } from 'child_process';
import * as crypto from 'crypto';
import express from 'express';
import { Request, Response } from 'express-serve-static-core';
import * as fs from 'fs';
import multer from 'multer';
import * as os from 'os';
import * as path from 'path';
import dependencies from './dependencies.json';
import { FileManager } from './FileManager';
import logger from './Logger';
import { ProcessManager } from './ProcessManager';
import { ConfigFile, ServerManager } from './ServerManager';
import { Binder, PipelineProcess, QueueStatus, SingleFileType } from './types';

export class ApiServer {
  private outputDir: string = path.resolve(`${__dirname}/output`);
  private fileManager: FileManager = new FileManager();
  private processManager: ProcessManager = new ProcessManager();
  private serverManager: ServerManager = new ServerManager();

  private upload = multer({
    storage: multer.diskStorage({
      destination: (req, file, cb) => {
        cb(null, this.getRandomFolder());
      },
      filename: (req, file, cb) => {
        const ext = file.originalname.split('.').pop();
        cb(null, path.basename(this.getRandomFile(`.${ext}`)));
      },
    }),
  });

  private allowedMimetypes: string[] = [
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document', // .docx
    'message/rfc822', // .eml
    'application/pdf',
    'application/xml',
    'text/xml',
    'image/tiff',
    'image/png',
    'image/jpeg',
  ];

  constructor() {
    if (!fs.existsSync(this.outputDir)) {
      fs.mkdirSync(this.outputDir);
    }
  }

  public launchServer(port: number): void {
    const app = express();

    // tslint:disable-next-line:variable-name
    const v1_0 = express.Router();
    app.use('/api/v1.0', v1_0);
    app.use('/api/v1', v1_0);
    app.use('/api', v1_0);

    app.get('/', this.handleRoot.bind(this));

    const uploadsConf: multer.Field[] = [
      { name: 'file', maxCount: 1 },
      { name: 'config', maxCount: 1 },
    ];

    v1_0.post('/document', this.upload.fields(uploadsConf), this.handlePostDoc.bind(this));
    v1_0.get('/queue/:id', this.handleGetQueue.bind(this));
    v1_0.get('/json/:id', this.handleGetJson.bind(this));
    v1_0.get('/text/:id', this.handleGetText.bind(this));
    v1_0.get('/confidences/:id', this.handleGetConfidences.bind(this));
    v1_0.get('/csv/:id', this.handleGetCsvList.bind(this));
    v1_0.get('/csv/:id/:page/:table', this.handleGetCsv.bind(this));
    v1_0.get('/markdown/:id', this.handleGetMarkdown.bind(this));
    v1_0.get('/xml/:id', this.handleGetXml.bind(this));
    // TODO add every other endpoint
    v1_0.get('/thumbnail/:id/:page', this.handleGetThumb.bind(this));
    v1_0.get('/image/:docId/:imageId', this.handleGetImage.bind(this));
    // server info endpoints
    v1_0.get('/default-config', this.handleGetDefaultConfig.bind(this));
    v1_0.get('/modules', this.handleGetModules.bind(this));
    v1_0.get('/module-config/:modulename', this.handleGetModuleConfig.bind(this));

    v1_0.get('/check-installation', this.handleCheckInstallation.bind(this));

    app.listen(port, () => {
      logger.info(`Api listening on port ${port}!`);
    });
  }

  private handleCheckInstallation(req: Request, res: Response): void {
    const response = `
    <style>
      table,
      th,
      td {
        text-align: left;
        border: 1px solid black;
      }
      .found {
        background: lightgreen;
      }
      .not.found {
        background: red;
      }
    </style>
    <table>
      <tr>
        <th>Dependency name</th>
        <th>Found?</th>
        <th>Required?</th>
        <th>Path</th>
      </tr>
    `;
    const whereIs = os.platform() === 'win32' ? 'where' : 'which';
    const result = dependencies.required.concat(dependencies.optional).map(
      (group: any) =>
        (group as string[])
          .map(name => {
            const { status, stdout } = spawnSync(whereIs, [`${name}`]);
            return {
              name,
              found: status === 0,
              path: status === 0 ? stdout.toString() : '',
              required: dependencies.required.includes(group),
            };
          })
          .find(g => g.found) || {
          name: group[0],
          found: false,
          path: '',
          required: dependencies.required.includes(group),
        },
    );

    res
      .type('html')
      .send(
        response.concat(
          result
            .map(
              r =>
                `<tr>
            <td>${r.name}</td>
            <td class="${r.found ? 'found' : 'not found'}">${r.found ? 'YES' : 'NO'}</td>
            <td>${r.required ? 'YES' : 'NO'}</td>
            <td>${r.path || '-'}</td>
          </tr>`,
            )
            .join(''),
          '</table>',
        ),
      )
      .end();
  }

  /**
   * Status: 200 - Ok. Returns the default config of the server
   * Status: 404 - Not Found - the default server config was not found in the pre-set location
   */
  private handleGetDefaultConfig(req: Request, res: Response): void {
    res.setHeader('Access-Control-Allow-Origin', '*');

    let defaultConfig: ConfigFile;
    try {
      if (req.query.specs && req.query.specs === 'true') {
        defaultConfig = this.serverManager.getDefaultConfigWithSpecs();
      } else {
        defaultConfig = this.serverManager.getDefaultConfig();
      }
    } catch (err) {
      logger.warn(`Cannot get default server settings: ${err}`);
      res.sendStatus(404);
      return;
    }
    logger.info(`Returning the default server settings...`);
    res.status(200).json(defaultConfig);
  }

  /**
   * Status: 200 - Ok. Returns the list of all the modules on the server
   * Status: 404 - Not Found - the list of modules could not be obtained
   */
  private handleGetModules(req: Request, res: Response): void {
    res.setHeader('Access-Control-Allow-Origin', '*');

    let modules: object;
    try {
      modules = this.serverManager.getModules();
    } catch (err) {
      logger.warn(`Cannot get the module names: ${err}`);
      res.sendStatus(404);
      return;
    }
    logger.info(`Returning the modules on the server...`);
    res.status(200).json(modules);
  }

  /**
   * Status: 200 - Ok. Returns the default config of the module
   * Status: 404 - Not Found - the configuration of the module could not be obtained
   * Status: 500 - Internal Server Error
   */
  private handleGetModuleConfig(req: Request, res: Response): void {
    res.setHeader('Access-Control-Allow-Origin', '*');
    const moduleName = req.params.modulename;

    let moduleConfig: object;
    try {
      moduleConfig = this.serverManager.getModuleConfig(moduleName);
    } catch (err) {
      logger.warn(`Cannot get the module config for module ${moduleName} ${err}`);
      res.sendStatus(404);
      return;
    }
    logger.info(`Returning the default module config for module ${moduleName}...`);
    res.status(200).json(moduleConfig);
  }

  /**
   * Status: 200 - Ok. Returns the status of the queue
   * Status: 201 - Created. Returns the id of the document and links to generated resources.
   * Status: 404 - Not Found
   * Status: 500 - Internal Server Error
   */
  private handleGetQueue(req: Request, res: Response): void {
    res.setHeader('Access-Control-Allow-Origin', '*');
    const docId = req.params.id;
    let pipelineProcess: PipelineProcess;

    try {
      pipelineProcess = this.processManager.getProcess(docId);
    } catch (err) {
      res.sendStatus(404);
      return;
    }

    if (pipelineProcess.isDone) {
      if (pipelineProcess.exitCode === 0) {
        const paths = {
          id: docId,
          json: `${req.baseUrl}/json/${docId}`,
          csv: `${req.baseUrl}/csv/${docId}`,
          text: `${req.baseUrl}/text/${docId}`,
          markdown: `${req.baseUrl}/markdown/${docId}`,
        };

        res
          .status(201)
          .location(paths.json)
          .json(paths);
      } else {
        res.status(500).send(pipelineProcess.stderr.join(''));
      }
    } else {
      let status = '';

      if (pipelineProcess.stderr.length > 0) {
        status = this.processStatus(pipelineProcess.stderr[pipelineProcess.stderr.length - 1]);
      } else if (pipelineProcess.stdout.length > 0) {
        status = this.processStatus(pipelineProcess.stdout[pipelineProcess.stdout.length - 1]);
      }

      const queueStatus: QueueStatus = {
        'estimated-remaining-time': null,
        'progress-percentage': 0,
        'start-date': pipelineProcess.start,
        status,
      };

      res.json(queueStatus);
    }
  }

  private processStatus(status: string): string {
    try {
      return JSON.parse(status).msg;
    } catch (e) {
      return status;
    }
  }

  /*
  {
    fieldname: 'file',
    originalname: 't1_bis.pdf',
    encoding: '7bit',
    mimetype: 'application/pdf',
    destination: 'uploads',
    filename: 'cbfa07119f4df59b76ba0126b5f5c4cf',
    path: 'uploads/cbfa07119f4df59b76ba0126b5f5c4cf',
    size: 108284
  }
  */
  private handlePostDoc(req: Request, res: Response): void {
    res.setHeader('Access-Control-Allow-Origin', '*');

    if (!('files' in req && 'file' in req.files)) {
      res.status(400).send(`Bad request: file not found.`);
      return;
    }
    const doc: Express.Multer.File = req.files.file[0];
    let config: Express.Multer.File;
    if (req.files.config) {
      config = req.files.config[0];
    }
    const docName: string = doc.originalname.split('.')[0];
    const docId: string = this.getUUID();
    const outputPath = path.resolve(`${this.outputDir}/${docName}-${docId}`);

    if (!this.isValidDocument(doc) || (!!config && !this.isValidConfig(config))) {
      res.sendStatus(415);
      return;
    }

    if (!this.checkConfig(config)) {
      res.status(419).send('Config file is not valid, check the JSON format and required keys');
      return;
    }

    try {
      fs.mkdirSync(outputPath);
    } catch (err) {
      res.status(500).send(err);
      return;
    }
    let configPath = '../../server/defaultConfig.json';
    if (!!config) {
      configPath = config.path;
    }

    this.fileManager.newBinder(docId, doc.path, configPath, outputPath, docName);
    this.processManager.start(doc.path, docId, configPath, docName, outputPath);

    res
      .status(202)
      .location(`${req.baseUrl}/queue/${docId}`)
      .send(docId);
  }

  private handleGetJson(req: Request, res: Response): void {
    this.handleGetFile(req, res, 'json');
  }

  private handleGetText(req: Request, res: Response): void {
    this.handleGetFile(req, res, 'text');
  }

  private handleGetConfidences(req: Request, res: Response) {
    this.handleGetFile(req, res, 'confidences');
  }

  private handleGetCsv(req: Request, res: Response) {
    res.setHeader('Access-Control-Allow-Origin', '*');
    const docId: string = req.params.id;
    const page: number = parseInt(req.params.page, 10);
    const table: number = parseInt(req.params.table, 10);

    try {
      const file: string = this.fileManager.getCsvFilePath(docId, page, table);
      res.sendFile(file);
    } catch (err) {
      res.status(404).send(err);
    }
  }

  private async handleGetCsvList(req: Request, res: Response) {
    res.setHeader('Access-Control-Allow-Origin', '*');
    const docId: string = req.params.id;
    try {
      const fileName = this.fileManager.getBinder(docId).name;
      const folder: string = this.fileManager.getFilePath(docId, 'csvs');
      const filesInFolder = fs.readdirSync(folder);
      let paths: string[] = [];
      if (req.query.download) {
        paths = filesInFolder.map(this.fileToLocalPath(docId)).filter(fs.existsSync);
        if (paths.length > 0) {
          const zipFile = await this.compress(paths, fileName.concat('.csv'));
          res.download(zipFile);
        } else {
          res.end();
        }
      } else {
        paths = filesInFolder.map(this.fileToDownloadURI(docId, req.baseUrl));
        res.json(paths);
      }
    } catch (err) {
      res.status(404).send(err.stack);
    }
  }

  private fileToLocalPath(docId: string): (file: string) => string {
    return (file: string) => {
      const match = file.match(/-(\d+)-(\d+)\.csv$/);
      return this.fileManager.getCsvFilePath(docId, parseInt(match[1], 10), parseInt(match[2], 10));
    };
  }

  private fileToDownloadURI(docId: string, baseUrl: string): (file: string) => string {
    return (file: string) => {
      const match = file.match(/-(\d+)-(\d+)\.csv$/);
      return `${baseUrl}/csv/${docId}/${match[1]}/${match[2]}`;
    };
  }

  private handleGetMarkdown(req: Request, res: Response) {
    this.handleGetFile(req, res, 'markdown');
  }

  private handleGetXml(req: Request, res: Response) {
    this.handleGetFile(req, res, 'xml');
  }

  private async handleGetFile(req: Request, res: Response, type: SingleFileType): Promise<void> {
    res.setHeader('Access-Control-Allow-Origin', '*');

    try {
      let file: string = this.fileManager.getFilePath(req.params.id, type);
      if (req.query.download && type === 'markdown') {
        const fileName = this.fileManager.getBinder(req.params.id).name;
        const assetsFolder = path.join(path.dirname(file), `assets_${fileName}`);
        const filesToCompress = [file, assetsFolder].filter(fs.existsSync);
        if (filesToCompress.length > 1) {
          file = await this.compress(filesToCompress, fileName.concat('.md'));
        }
      }
      req.query.download ? res.download(file) : res.sendFile(file);
    } catch (err) {
      res.status(404).send(err.stack);
    }
  }

  /**
   * puts all files and folders in files array into a compressed zip file and returns it's path
   * @param files array of paths with files and folders to compress.
   *  The path to the first file on this array will be used as the .zip output path
   * @param zipFileName name of the compressed zip file to generate
   * @return path to the compressed zip file
   */
  private compress(files: string[], zipFileName: string): Promise<string> {
    return new Promise((resolve, reject) => {
      try {
        const zipPath = zipFileName.concat('.zip');
        const outputZip = fs.createWriteStream(zipPath);
        outputZip.on('close', () => {
          resolve(zipPath);
        });
        const archive = archiver('zip', { zlib: { level: 0 } });
        archive.pipe(outputZip);
        files.forEach(f => {
          const stats = fs.statSync(f);
          if (stats.isFile()) {
            archive.file(f, { name: path.basename(f) });
          } else {
            archive.directory(f, f.split(path.sep).pop());
          }
        });
        archive.finalize();
      } catch (error) {
        reject(error);
      }
    });
  }

  private handleRoot(req: Request, res: Response): void {
    res.send(`
      <p>
      Welcome to the API.<br>
      Are you lost? Checkout the
      <a href="https://github.com/axa-group/Parsr/blob/develop/docs/api-guide.md">documentation</a>!
      </p>
    `);
  }

  private handleGetImage(req: Request, res: Response) {
    res.setHeader('Access-Control-Allow-Origin', '*');
    const docId: string = req.params.docId;
    const imageName: string = 'img-' + req.params.imageId.padStart(4, '0') + '.';
    const binder: Binder = this.fileManager.getBinder(docId);
    const assetsFolder = binder.outputPath + '/assets_' + binder.name;
    if (!fs.existsSync(assetsFolder)) {
      res.sendStatus(404);
      return;
    }
    const paths: string[] = fs
      .readdirSync(assetsFolder)
      .filter(filename => {
        return path.basename(filename).startsWith(imageName);
      })
      .map(file => assetsFolder + '/' + file);

    if (paths.length > 0) {
      logger.info('Return image at path ' + paths[0]);
      res.sendFile(paths[0], {
        headers: {
          responseType: 'blob',
        },
      });
    } else {
      res.sendStatus(404);
    }
  }

  private handleGetThumb(req: Request, res: Response) {
    res.setHeader('Access-Control-Allow-Origin', '*');

    const docId: string = req.params.id;
    const page: number = parseInt(req.params.page, 10) + 1;
    const binder: Binder = this.fileManager.getBinder(docId);

    const filetype = require('file-type');

    // if its an .eml, we have to change the binder extension to match the generated PDF
    // in Email Extractor and get the thumbnails of that PDF file
    ['.eml', '.docx'].forEach(ext => {
      if (binder.input.endsWith(ext)) {
        binder.input = binder.input.replace(ext, '-tmp.pdf');
      }
    });

    const fileType: { ext: string; mime: string } = filetype(fs.readFileSync(binder.input));

    const thumbFolder = path.join(os.tmpdir(), 'Doc-' + docId + '/');

    if (!fs.existsSync(thumbFolder)) {
      try {
        fs.mkdirSync(thumbFolder);
      } catch (error) {
        res.status(500).send(error);
        return;
      }
    }

    const filePath = thumbFolder + docId + '_' + page + '.png';
    if (fs.existsSync(filePath)) {
      logger.info('Return Thumbnail at path ' + filePath);
      res.sendFile(filePath, {
        headers: {
          responseType: 'blob',
        },
      });
      return;
    }
    let convert;
    const command = this.getCommandLocationOnSystem('magick convert', 'convert');
    if (command) {
      const inputFile =
        fileType.ext === 'pdf' ? binder.input.concat(`[${page - 1}]`) : binder.input;
      convert = new Promise((resolve, reject) => {
        exec([command, '-resize', '200x200', inputFile, filePath].join(' '), err => {
          if (err) {
            return reject(err);
          }
          return resolve();
        });
      });
    } else {
      convert = Promise.reject(
        'Cannot find ImageMagick convert tool. Are you sure it is installed?',
      );
    }
    try {
      convert
        .then(() => {
          logger.info('Generated Thumbnail at path ' + filePath);
          res.sendFile(filePath, {
            headers: {
              responseType: 'blob',
            },
          });
        })
        .catch((error: string) => {
          logger.error(error);
          res.status(500).send(error);
        });
    } catch (error) {
      res.status(500).send(error);
    }
  }

  private isValidDocument(doc: Express.Multer.File): boolean {
    if (!this.allowedMimetypes.includes(doc.mimetype)) {
      return false;
    }

    return true;
  }

  private isValidConfig(config: Express.Multer.File): boolean {
    if (config.mimetype !== 'application/json') {
      return false;
    }
    return true;
  }

  private checkConfig(config: Express.Multer.File): boolean {
    const configStr: string = fs.readFileSync(config.path, 'utf-8');
    let configObj;
    try {
      configObj = JSON.parse(configStr);
    } catch (e) {
      logger.info('The config file is not valid JSON file');
      return false;
    }
    if (
      configObj.hasOwnProperty('version') &&
      configObj.hasOwnProperty('extractor') &&
      configObj.hasOwnProperty('cleaner') &&
      configObj.hasOwnProperty('output')
    ) {
      return true;
    }
    logger.info('Required key(s) is/are missing');
    return false;
  }

  private getRandomFolder(): string {
    const randFoldername = `${os.tmpdir()}/${this.getUUID()}`;
    fs.mkdirSync(randFoldername);
    return path.resolve(`${randFoldername}`);
  }

  private getRandomFile(extension: string): string {
    const randFilename = `${os.tmpdir()}/${this.getUUID() + extension}`;
    return path.resolve(`${randFilename}`);
  }

  private getUUID(): string {
    return crypto.randomBytes(15).toString('hex');
  }

  /**
   * returns the location of the executable locator command on the current system.
   * on linux/unix machines, this is 'which', on windows machines, it is 'where'.
   */
  private getExecLocationCommandOnSystem(): string {
    return os.platform() === 'win32' ? 'where' : 'which';
  }

  /**
   * returns the location of a command on a system.
   * @param firstChoice the first choice name of the executable to be located
   * @param secondChoice the second choice name of the executable to be located
   * @param thirdChoice the third choice name of the executable to be located
   */
  private getCommandLocationOnSystem(
    firstChoice: string,
    secondChoice: string = '',
    thirdChoice: string = '',
  ): string {
    const cmdComponents: string[] = firstChoice.split(' ');
    const info = spawnSync(this.getExecLocationCommandOnSystem(), [cmdComponents[0]]);
    const result = info.status === 0 ? info.stdout.toString().split(os.EOL)[0] : null;
    if (result === null && secondChoice !== '') {
      return this.getCommandLocationOnSystem(secondChoice, thirdChoice);
    }
    if (result === null) {
      return null;
    }
    return firstChoice;
  }
}
