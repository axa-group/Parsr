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

import * as crypto from 'crypto';
import express from 'express';
import { Request, Response } from 'express-serve-static-core';
import * as fs from 'fs';
import multer from 'multer';
import * as os from 'os';
import * as path from 'path';
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

    // server info endpoints
    v1_0.get('/default-config', this.handleGetDefaultConfig.bind(this));
    v1_0.get('/modules', this.handleGetModules.bind(this));
    v1_0.get('/module-config/:modulename', this.handleGetModuleConfig.bind(this));

    app.listen(port, () => {
      logger.info(`Api listening on port ${port}!`);
    });
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

    if (!('files' in req && 'file' in req.files && 'config' in req.files)) {
      res.status(400).send(`Bad request: file or config not found.`);
      return;
    }

    const doc: Express.Multer.File = req.files.file[0];
    const config: Express.Multer.File = req.files.config[0];
    const docName: string = doc.originalname.split('.')[0];
    const docId: string = this.getUUID();
    const outputPath = path.resolve(`${this.outputDir}/${docName}-${docId}`);

    if (!this.isValidDocument(doc) || !this.isValidConfig(config)) {
      res.sendStatus(415);
      return;
    }

    try {
      fs.mkdirSync(outputPath);
    } catch (err) {
      res.status(500).send(err);
      return;
    }

    this.fileManager.newBinder(docId, doc.path, config.path, outputPath, docName);
    this.processManager.start(doc.path, docId, config.path, docName, outputPath);

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

  private handleGetCsvList(req: Request, res: Response) {
    res.setHeader('Access-Control-Allow-Origin', '*');
    const docId: string = req.params.id;
    try {
      const folder: string = this.fileManager.getFilePath(docId, 'csvs');
      const paths: string[] = fs.readdirSync(folder).map(filename => {
        const match = filename.match(/-(\d+)-(\d+)\.csv$/);
        return `${req.baseUrl}/csv/${docId}/${match[1]}/${match[2]}`;
      });

      res.json(paths);
    } catch (err) {
      res.status(404).send(err.stack);
    }
  }

  private handleGetMarkdown(req: Request, res: Response) {
    this.handleGetFile(req, res, 'markdown');
  }

  private handleGetXml(req: Request, res: Response) {
    this.handleGetFile(req, res, 'xml');
  }

  private handleGetFile(req: Request, res: Response, type: SingleFileType): void {
    res.setHeader('Access-Control-Allow-Origin', '*');

    try {
      const file: string = this.fileManager.getFilePath(req.params.id, type);
      res.sendFile(file);
    } catch (err) {
      res.status(404).send(err.stack);
    }
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

  private handleGetThumb(req: Request, res: Response) {
    res.setHeader('Access-Control-Allow-Origin', '*');

    const docId: string = req.params.id;
    const page: number = parseInt(req.params.page, 10) + 1;
    const binder: Binder = this.fileManager.getBinder(docId);

    const filetype = require('file-type');
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

    if (fileType.mime.startsWith('image')) {
      convert = require('sharp')(binder.input).resize(200, 200, { fit: 'outside' }).toFile(filePath);
    } else if (fileType.ext === 'pdf') {
      const pdf2Pic = require('pdf2pic');
      const pdf2picConfig = new pdf2Pic({
        density: 72, // output pixels per inch
        savename: docId, // output file name
        savedir: thumbFolder, // output file location
        format: 'png', // output file format
        size: '200x200', // output size in pixels
      });
      convert = pdf2picConfig.convertBulk(binder.input, [page]);
    }

    if (convert) {
      try {
        convert.then(() => {
          logger.info('Generated Thumbnail at path ' + filePath);
          res.sendFile(filePath, {
            headers: {
              responseType: 'blob',
            },
          });
        });
      } catch (error) {
        res.status(500).send(error);
      }
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
}
