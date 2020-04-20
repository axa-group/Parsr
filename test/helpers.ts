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

import * as clone from 'clone';
import { readFileSync } from 'fs';
import { PdfminerExtractor } from '../server/src/input/pdfminer/PdfminerExtractor';
import { TesseractExtractor } from '../server/src/input/tesseract/TesseractExtractor';
import { Module } from '../server/src/processing/Module';
import {
  Options,
  TableExtractor,
  TableExtractorResult,
} from '../server/src/processing/TableDetectionModule/TableDetectionModule';
import { Config } from '../server/src/types/Config';
import { Document } from '../server/src/types/DocumentRepresentation/Document';
import { json2document } from '../server/src/utils/json2document';

export class TableExtractorStub implements TableExtractor {
  private status: number;
  private stderr: string;
  private stdout: string;

  constructor(status: number = 0, stderr: string = '', stdout: string = '[]') {
    this.status = status;
    this.stderr = stderr;
    this.stdout = stdout;
  }

  public async readTables(_: string, _options: Options): Promise<TableExtractorResult> {
    return {
      stdout: this.stdout,
      stderr: this.stderr,
      status: this.status,
    };
  }
}

export function getPdf(
  func: (doc: Document) => Promise<Document>,
  filename: string,
): Promise<[Document, Document]> {
  const config: Config = JSON.parse(
    readFileSync(`${__dirname}/../server/defaultConfig.json`, 'utf8'),
  );

  let docBefore: Document;

  return new PdfminerExtractor(config)
    .run(`${__dirname}/assets/${filename}`)
    .then((doc: Document) => {
      docBefore = clone(doc);
      const docAfterPromise: Promise<Document> = func(doc);
      return docAfterPromise;
    })
    .then(docAfter => {
      return [docBefore, docAfter] as [Document, Document]; // required because TS doesn't handle tuples correctly
    });
}

export function getDocFromJson(
  func: (doc: Document) => Promise<Document>,
  fullJsonPath: string,
  pdfFilename?: string, // Parameter required to assign the path of a pdf inside document.inputFile
): Promise<Document> {
  const document = json2document(JSON.parse(readFileSync(fullJsonPath, 'utf8')));
  if (pdfFilename) {
    document.inputFile = pdfFilename;
  }
  return func(document);
}

export async function getImage(
  func: (doc: Document) => Promise<Document>,
  filename: string,
): Promise<[Document, Document]> {
  const config: Config = JSON.parse(
    readFileSync(`${__dirname}/../server/defaultConfig.json`, 'utf8'),
  );

  const te = new TesseractExtractor(config);
  const doc = await te.run(`${__dirname}/assets/${filename}`, false);
  const docBefore = clone(doc);
  const docAfter = await func(doc);

  return [docBefore, docAfter];
}

export function runModules(originalDocument: Document, modules: Module[]): Promise<Document> {
  return runNextModule(originalDocument, 0);

  function runNextModule(document: Document, i: number): Promise<Document> {
    if (i < modules.length) {
      return modules[i].run(document).then((newDoc: Document) => {
        return runNextModule(newDoc, i + 1);
      });
    } else {
      return Promise.resolve(document);
    }
  }
}
