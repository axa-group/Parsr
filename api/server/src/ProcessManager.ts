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

import { spawn } from 'child_process';
import * as path from 'path';
import logger from './Logger';
import { PipelineProcess, ProcessMapper } from './types';

export class ProcessManager {
  private processes: ProcessMapper = {};

  public start(
    doc: string,
    docId: string,
    config: string,
    docName: string,
    outputPath: string,
  ): void {
    logger.info('Processing ' + doc);

    process.env.NODE_DEBUG = 'pipeline';

    const args: string[] = [
      '--max-old-space-size=4096',
      `../../dist/bin/index.js`,
      '--input-file',
      path.resolve(doc),
      '--output-folder',
      path.resolve(outputPath),
      '--document-name',
      docName,
      '--config',
      path.resolve(config),
    ];

    logger.info('node', args.join(' '));

    const pipelineProcess: PipelineProcess = {
      childProcess: spawn(`node`, args, {
        env: process.env,
      }),
      isDone: false,
      stdout: [],
      stderr: [],
      start: new Date(),
    };

    pipelineProcess.childProcess.stdout.on('data', data => {
      data
        .toString('utf-8')
        .split(/\r?\n/)
        .map((json: string) => {
          if (json.trim().length > 0) {
            try {
              logger.info(JSON.parse(json).msg);
            } catch (err) {
              logger.info(json);
            }
          }
        });
      pipelineProcess.stdout.push(data.toString('utf-8'));
    });

    pipelineProcess.childProcess.stderr.on('data', data => {
      pipelineProcess.stderr.push(data.toString('utf-8'));
      logger.error(data.toString('utf-8'));
    });

    pipelineProcess.childProcess.on('exit', code => {
      pipelineProcess.isDone = true;
      pipelineProcess.exitCode = code;
      logger.info('Process exited');
    });

    this.processes[docId] = pipelineProcess;
  }

  public getProcess(docId: string): PipelineProcess {
    if (this.processes[docId]) {
      return this.processes[docId];
    } else {
      throw new Error(`Process with Document ID ${docId} not found.`);
    }
  }
}
