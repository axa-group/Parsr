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

import * as axios from 'axios';
import { readFileSync, writeFileSync } from 'fs';
import * as path from 'path';
import { parseString } from 'xml2js';
import * as utils from '../../utils';
import logger from '../../utils/Logger';

export class AbbyyClient {
	/**
	 * Getter serverTimeout
	 * @return {number}
	 */
	public get serverTimeout(): number {
		return this._serverTimeout;
	}

	/**
	 * Setter serverTimeout
	 * @param {number} value
	 */
	public set serverTimeout(value: number) {
		this._serverTimeout = value;
	}

	/**
	 * Getter host
	 * @return {string}
	 */
	public get host(): string {
		return this._host;
	}

	/**
	 * Setter host
	 * @param {string} value
	 */
	public set host(value: string) {
		this._host = value;
	}

	/**
	 * Getter serverVersion
	 * @return {string}
	 */
	public get serverVersion(): string {
		return this._serverVersion;
	}

	/**
	 * Setter serverVersion
	 * @param {string} value
	 */
	public set serverVersion(value: string) {
		this._serverVersion = value;
	}

	/**
	 * Getter serverString
	 * @return {string}
	 */
	public get serverString(): string {
		return this._serverString;
	}

	/**
	 * Setter serverString
	 * @param {string} value
	 */
	public set serverString(value: string) {
		this._serverString = value;
	}

	/**
	 * Getter workflowList
	 * @return {string[]}
	 */
	public get workflowList(): string[] {
		return this._workflowList;
	}

	/**
	 * Setter workflowList
	 * @param {string[]} value
	 */
	public set workflowList(value: string[]) {
		this._workflowList = value;
	}

	/**
	 * Getter headers
	 * @return {object}
	 */
	public get headers(): object {
		return this._headers;
	}

	/**
	 * Setter headers
	 * @param {object} value
	 */
	public set headers(value: object) {
		this._headers = value;
	}

	public reqStrGetWorkflows: string = `<?xml version="1.0" encoding="utf-8"?>
    <soap:Envelope xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
                   xmlns:xsd="http://www.w3.org/2001/XMLSchema"
                   xmlns:soap="http://schemas.xmlsoap.org/soap/envelope/">
      <soap:Body>
        <GetWorkflows xmlns="http://www.abbyy.com/FineReaderServer14_xml/FineReaderServer14.xml">
          <serverLocation>localhost</serverLocation>
        </GetWorkflows>
      </soap:Body>
    </soap:Envelope>`;

	public reqStrFileSend: string = `<?xml version="1.0" encoding="utf-8"?>
    <soap:Envelope xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
                   xmlns:xsd="http://www.w3.org/2001/XMLSchema"
                   xmlns:soap="http://schemas.xmlsoap.org/soap/envelope/">
      <soap:Body>
        <StartProcessFile xmlns="http://www.abbyy.com/FineReaderServer14_xml/FineReaderServer14.xml">
          <serverLocation>localhost</serverLocation>
          <workflowName>PLACEHOLDER_WORKFLOW</workflowName>
          <file>
            <FileName>PLACEHOLDER_FILENAME</FileName>
            <FileContents>PLACEHOLDER_FILECONTENT</FileContents>
          </file>
        </StartProcessFile>
      </soap:Body>
    </soap:Envelope>`;

	public reqStrGetJobState: string = `<?xml version="1.0" encoding="utf-8"?>
    <soap:Envelope xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
                   xmlns:xsd="http://www.w3.org/2001/XMLSchema"
                   xmlns:soap="http://schemas.xmlsoap.org/soap/envelope/">
      <soap:Body>
        <GetJobStateInfo xmlns="http://www.abbyy.com/FineReaderServer14_xml/FineReaderServer14.xml">
          <serverLocation>localhost</serverLocation>
          <jobId>PLACEHOLDER_JOBID</jobId>
        </GetJobStateInfo>
      </soap:Body>
    </soap:Envelope>`;

	public reqStrGetResult: string = `<?xml version="1.0" encoding="utf-8"?>
    <soap:Envelope xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
                   xmlns:xsd="http://www.w3.org/2001/XMLSchema"
                   xmlns:soap="http://schemas.xmlsoap.org/soap/envelope/">
      <soap:Body>
        <GetJobResultEx xmlns="http://www.abbyy.com/FineReaderServer14_xml/FineReaderServer14.xml">
          <serverLocation>localhost</serverLocation>
          <jobId>PLACEHOLDER_JOBID</jobId>
          <options>DoNotDeleteJob</options>
        </GetJobResultEx>
      </soap:Body>
    </soap:Envelope>`;
	private _host: string;
	private _serverVersion: string;
	private _serverString: string;
	private _workflowList: string[];
	private _headers: object;
	private _serverTimeout: number;

	constructor(host: string, serverVersion: string, serverTimeout: number) {
		this.host = host;
		this.serverVersion = serverVersion;
		this.serverString = `http://${this.host}/FineReaderServer${this.serverVersion}/WebService.asmx`;
		this.serverTimeout = serverTimeout;
		this.headers = {
			'content-type': 'text/xml',
		};
	}

	public run(
		workflowName: string,
		filename: string,
		pollingInterval: number = 1000,
	): Promise<string> {
		const promise = new Promise<string>((resolve, reject) => {
			this.getWorkflows()
				.then(workFlows => {
					logger.info('[AbbyyClient getWorkflows]: got these workflows:', workFlows);
					logger.info(
						`[AbbyyClient send]: sending file: ${filename} on the workflow: ${workflowName}`,
					);
					return this.sendFile(filename, workflowName);
				})
				.then(jobId => {
					logger.info('[AbbyyClient send]: got this jobId:', jobId);
					return this.waitTillJobDone(jobId, pollingInterval);
				})
				.then(jobId => {
					logger.info('[AbbyyClient jobStatus]: Finished, getting result.');
					return this.getResult(jobId);
				})
				.then(xml => {
					logger.info('[AbbyyClient result]: Returning xml result.');
					resolve(xml);
				})
				.catch(err => {
					logger.error('[AbbyyClient jobResult]: got an error:', err);
					reject(err);
				});
		});
		return promise;
	}

	public soapRequest(url: string, headers: any, xml: any, timeout = 0x7fffffff): Promise<any> {
		const config: axios.AxiosRequestConfig = {
			method: 'post',
			url,
			headers,
			data: xml,
			timeout,
			maxContentLength: Infinity,
			proxy: false,
		};

		const promise: Promise<any> = axios
			.default(config)
			.then(response => {
				if (response.status !== 200) {
					throw new Error(`Unexpected response code ${response.status}, ${response.data}`);
				}

				return response;
			})
			.then(response => {
				return this.parseResponse(response);
			});

		return promise;
	}

	private parseResponse(response: axios.AxiosResponse): Promise<any> {
		return new Promise<any>((resolve, reject) => {
			parseString(response.data, (err: any, obj: any) => {
				if (err) {
					reject(err);
				}

				resolve(obj);
			});
		});
	}

	private getWorkflows(): Promise<string[]> {
		const promise: Promise<string[]> = new Promise<string[]>(resolve => {
			this.soapRequest(
				this.serverString,
				this.headers,
				this.reqStrGetWorkflows,
				this.serverTimeout,
			).then((obj: any) => {
				this.workflowList =
					obj['soap:Envelope']['soap:Body'][0].GetWorkflowsResponse[0].GetWorkflowsResult[0].string;
				resolve(this.workflowList);
			});
		});

		return promise;
	}

	private sendFile(filename: string, workflowName: string): Promise<string> {
		const filenameOnly = path.parse(filename).base;
		logger.info('Sending the file ', filenameOnly, 'on workflow', workflowName);

		const promise = new Promise<string>((resolve, reject) => {
			if (!this.workflowList.includes(workflowName)) {
				return reject('Workflow not found');
			}

			const fileContent: string = readFileSync(filename, 'base64');
			let sendString = this.reqStrFileSend.replace('PLACEHOLDER_WORKFLOW', workflowName);
			sendString = sendString.replace('PLACEHOLDER_FILENAME', filenameOnly);
			sendString = sendString.replace('PLACEHOLDER_FILECONTENT', fileContent);

			this.soapRequest(this.serverString, this.headers, sendString, this.serverTimeout).then(
				obj => {
					resolve(
						obj['soap:Envelope']['soap:Body'][0].StartProcessFileResponse[0]
							.StartProcessFileResult[0],
					);
				},
			);
		});

		return promise;
	}

	private waitTillJobDone(jobId: string, wait: number): Promise<string> {
		const promise = new Promise<string>(resolve => {
			this.soapRequest(
				this.serverString,
				this.headers,
				this.reqStrGetJobState.replace('PLACEHOLDER_JOBID', jobId),
			).then(obj => {
				logger.debug('current state of job', jobId, 'is', utils.prettifyObject(obj));
				const state: any =
					obj['soap:Envelope']['soap:Body'][0].GetJobStateInfoResponse[0].GetJobStateInfoResult[0];

				logger.info(
					`[AbbyyClient jobStatus]: Job ${jobId}: ${state.State[0]}, ${state.Progress[0]}`,
				);

				if (state.State[0] === 'JS_Complete') {
					resolve(jobId);
				} else {
					resolve(this.waitTillJobDone(jobId, wait));
				}
			});
		});

		return promise;
	}

	private getResult(jobId: string): Promise<string> {
		const promise = new Promise<string>(resolve => {
			this.soapRequest(
				this.serverString,
				this.headers,
				this.reqStrGetResult.replace('PLACEHOLDER_JOBID', jobId),
				this.serverTimeout,
			).then(obj => {
				const docs: { [key: string]: any } =
					obj['soap:Envelope']['soap:Body'][0].GetJobResultExResponse[0].GetJobResultExResult[0]
						.JobDocuments[0].JobDocument[0].OutputDocuments[0].OutputDocument;
				for (const docKey in docs) {
					const doc = docs[docKey];
					if (doc.FileFormat[0] === 'OFF_XML') {
						const fileName: string = path.resolve(
							utils.getTemporaryDirectory() + '/' + doc.Files[0].FileContainer[0].FileName[0],
						);
						const fileContentBuffer: string = doc.Files[0].FileContainer[0].FileContents[0];
						const fileContent: string = Buffer.from(fileContentBuffer, 'base64').toString('utf8');

						writeFileSync(fileName, fileContent, { encoding: 'utf-8' });
						logger.info('ABBYY XML file written to', fileName);
						resolve(fileContent);
					}
				}
			});
		});

		return promise;
	}
}
