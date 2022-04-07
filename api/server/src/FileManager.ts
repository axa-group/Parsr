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

import * as fs from 'fs';
import * as path from 'path';
import { Binder, FileMapper, SingleFileType } from './types';
import Datastore from 'nedb';

interface Db {
  docBindings: Datastore<Binder>
}

export class FileManager {
  private db: Db;

  constructor(outputDir: string) {
    this.db = {
      'docBindings': new Datastore({ filename: outputDir + '/db/doc_bindings', autoload: true }),
    };
  }

  public newBinder(
    docId: string,
    document: string,
    configPath: string,
    outputPath: string,
    docName: string,
  ) {
    const binder: Binder = {
      input: document,
      name: docName,
      outputPath,
      config: configPath,
      docId: docId,
    };
    this.insertBinderWrapper(binder);
  }

  public getCsvFilePath(binder: Binder, page: number, table: number): string {
    const absPath: string = path.resolve(
      `${binder.outputPath}/csv/${binder.name}-${page}-${table}.csv`,
    );
    if (!fs.existsSync(absPath)) {
      throw new Error(`File not found for document ID ${binder.docId}`);
    }
    return absPath;
  }

  public getFilePath(binder: Binder, type: SingleFileType | 'csvs'): string {
    if (type === 'json') {
      return this.checkFile(binder, `${binder.name}.json`);
    }
    
    if (type === 'simple-json') {
      return this.checkFile(binder, `${binder.name}.simple.json`);
    }

    if (type === 'markdown') {
      return this.checkFile(binder, `${binder.name}.md`);
    }

    if (type === 'pdf') {
      return this.checkFile(binder, `${binder.name}.pdf`);
    }

    if (type === 'text') {
      return this.checkFile(binder, `${binder.name}.txt`);
    }

    if (type === 'xml') {
      return this.checkFile(binder, `${binder.name}.xml`);
    }

    if (type === 'confidences') {
      return this.checkFile(binder, `${binder.name}-confidences.txt`);
    }

    if (type === 'csvs') {
      const absPath = path.resolve(`${binder.outputPath}/csv`);

      if (!fs.existsSync(absPath)) {
        throw new Error(`Folder of CSV files not found for document ID ${binder.docId}`);
      }
      return absPath;
    }
  }

  public getBinder(docId: string): Promise<Binder> {
    return this.getDocByDocIdWrapper(docId);
  }

  private checkFile(binder: Binder, filePath: string): string {
    const outputPath = `${binder.outputPath}/${filePath}`;
    const absPath = path.resolve(outputPath);
    if (!fs.existsSync(absPath)) {
      throw new Error(`File not found`);
    }

    return absPath;
  }

  private async getDocByDocIdWrapper(docId: string): Promise<Binder> {
    try {
      const result = await this.getDocByDocId(docId);
      return result;
    } catch (err) {
      throw new Error('error fetching the binding in db for ' + docId + ', err = ' + err);
    }
  }

  private getDocByDocId(docId: string): Promise<Binder> {
    return new Promise((resolve, reject) => {
      this.db.docBindings.findOne({docId: docId}, (err: Error | null, doc: Binder) => {
        if (!err && doc) {
          resolve(doc);
        }
        reject(err || 'binder doc is undefined while fetching.');
      });
    });
  }

  private async insertBinderWrapper(binder: Binder): Promise<Binder> {
    try {
      return await this.insertBinder(binder).then(result => result);
    } catch (err) {
      throw new Error('error inserting the binding in db' + err);
    }
  }

  private insertBinder(binder: Binder) {
    return new Promise<Binder|undefined>((resolve, reject) => {
      this.db.docBindings.insert(binder, (err: Error, doc: Binder) => {
        if (!err && doc) {
          resolve(doc);
        }
        reject(err || 'binder doc is undefined after inserting.');
      });
    });
    
  }
}
