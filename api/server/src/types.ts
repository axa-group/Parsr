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

import { ChildProcess } from 'child_process';

export type FileMapper = {
  [docId: string]: Binder;
};

export type ProcessMapper = {
  [docId: string]: PipelineProcess;
};

export type PipelineProcess = {
  childProcess: ChildProcess;
  isDone: boolean;
  exitCode?: number;
  start: Date;
  stdout: string[];
  stderr: string[];
};

export type Binder = BinderFiles & BinderKeys;

type BinderFiles = { [key in SingleFileType]?: string };

type BinderKeys = {
  csvs?: string[][];
  outputPath: string;
  name: string;
  docId: string;
};

export type SingleFileType =
  | 'config'
  | 'input'
  | 'json'
  | 'simple-json'
  | 'xml'
  | 'text'
  | 'pdf'
  | 'markdown'
  | 'confidences';

export type QueueStatus = {
  'progress-percentage': number;
  status: string;
  'start-date': Date;
  'estimated-remaining-time': number;
};

export type OutputGranularityOptions = 'character' | 'word';
export type OutputConfig = {
  granularity: OutputGranularityOptions;
  formats: {
    json?: boolean;
    'json-compact'?: boolean;
    text?: boolean;
    markdown?: boolean;
    xml?: boolean;
    confidences?: boolean;
    csv?: boolean;
    pdf?: boolean;
  };
};
