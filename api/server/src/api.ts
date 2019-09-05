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
import { Binder, PipelineProcess, QueueStatus, SingleFileType } from './types';

export class ApiServer {
	private outputDir: string = path.resolve(`${__dirname}/output`);
	private fileManager: FileManager = new FileManager();
	private processManager: ProcessManager = new ProcessManager();

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
		v1_0.get('/confidances/:id', this.handleGetConfidances.bind(this));
		v1_0.get('/csv/:id', this.handleGetCsvList.bind(this));
		v1_0.get('/csv/:id/:page/:table', this.handleGetCsv.bind(this));
		v1_0.get('/markdown/:id', this.handleGetMarkdown.bind(this));
		v1_0.get('/xml/:id', this.handleGetXml.bind(this));
		// TODO add every other endpoint
		v1_0.get('/thumbnail/:id/:page', this.handleGetThumb.bind(this));

		app.listen(port, () => {
			logger.info(`Api listening on port ${port}!`);
		});
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

	private handleGetConfidances(req: Request, res: Response) {
		this.handleGetFile(req, res, 'confidances');
	}

	private handleGetCsv(req: Request, res: Response) {
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
		const docId: string = req.params.id;
		const folder: string = this.fileManager.getFilePath(docId, 'csvs');
		const paths: string[] = fs.readdirSync(folder).map(filename => {
			const match = filename.match(/-(\d+)-(\d+)\.csv$/);
			return `${req.baseUrl}/csv/${docId}/${match[1]}/${match[2]}`;
		});

		res.json(paths);
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
			res.status(404).send(err);
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
		const page: number = parseInt(req.params.page, 10);
		const binder: Binder = this.fileManager.getBinder(docId);
		var PDFImage = require('pdf-image').PDFImage;
		var pdfImage = new PDFImage(binder.input, {
			convertOptions: {
				'-resize': '200x200',
				'-colorspace': 'RGB',
			},
		});
		pdfImage.convertPage(page).then(
			function(imagePath: string) {
				logger.info(`Thumbnail path ${imagePath}!`);
				res.sendFile(imagePath, {
					headers: {
						responseType: 'blob',
					},
				});
			},
			function(err: Error) {
				res.status(500).send(err);
			},
		);
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
