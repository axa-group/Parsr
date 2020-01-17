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

import * as Textract from 'aws-sdk/clients/textract';
import { AWSError } from 'aws-sdk/lib/error';
import { readFileSync } from 'fs';
import { Config } from '../../types/Config';
import { BoundingBox, Document, Font, Line, Page, Word } from '../../types/DocumentRepresentation';
import logger from '../../utils/Logger';
import { Extractor } from '../Extractor';
import { setPageDimensions } from '../set-page-dimensions';

type AmazonTextractResponse = {
  DocumentMetadata: {
    Pages: number;
  },
  Blocks: Array<{
    BlockType: 'PAGE' | 'WORD' | 'LINE',
    Confidence: number;
    Text: string;
    Geometry: {
      BoundingBox: {
        Width: number;
        Height: number;
        Left: number;
        Top: number;
      }
      Polygon: Array<{
        X: number;
        Y: number;
      }>;
    };
    Id: string;
    Relationships: Array<{
      Type: 'VALUE' | 'CHILD';
      Ids: string[];
    }>;
  }>;
  DetectDocumentTextModelVersion: string;
};

export class AmazonTextractExtractor extends Extractor {
  private textract = null;

  constructor(config: Config) {
    super(config);

    this.textract = new Textract({
      accessKeyId: '',
      secretAccessKey: '',
      region: 'us-east-1',
    });

  }
  public run(inputFile: string): Promise<Document> {
    return new Promise((resolve, reject) => {
      logger.info(inputFile);
      this.textract.detectDocumentText({
        Document: {
          Bytes: readFileSync(inputFile),
        },
      }, (error: AWSError, data: AmazonTextractResponse) => {
        if (error) {
          reject(error);
        } else {
          const pages: Page[] = this.amazonResponseToParsrPages(data);
          const doc = new Document(pages, inputFile);
          resolve(setPageDimensions(doc, inputFile));
        }
      });
    });
  }

  private amazonResponseToParsrPages(data: AmazonTextractResponse): Page[] {
    /*
      as, for now, we are only processing image files,
      there will always be only one page so it's not neccesary to iterate over pages.

      I'll iterate over all detected Lines and then matching each Line words.
    */

    const lines: Line[] = [];
    data.Blocks.filter(block => block.BlockType === 'LINE').forEach(amzLine => {
      let words: Word[] = [];
      if (amzLine.Relationships.length > 0 && amzLine.Relationships.some(r => r.Type === 'CHILD')) {
        words = this.getWordsFromIds(amzLine.Relationships.filter(r => r.Type === 'CHILD')[0].Ids, data);
      }
      const line: Line = new Line(this.amzBBToParsrBB(amzLine.Geometry.BoundingBox), words);
      lines.push(line);
    });
    return [new Page(1, lines, new BoundingBox(0, 0, 0, 0))]; // page dimensions will be set later
  }

  private amzBBToParsrBB(amzBB: { Width: number; Height: number; Left: number; Top: number }): BoundingBox {
    return new BoundingBox(amzBB.Left, amzBB.Top, amzBB.Width, amzBB.Height);
  }

  private getWordsFromIds(ids: string[], data: AmazonTextractResponse): Word[] {
    const words: Word[] = [];
    data.Blocks.filter(block => ids.includes(block.Id)).forEach(amzWord => {
      words.push(new Word(this.amzBBToParsrBB(amzWord.Geometry.BoundingBox), amzWord.Text, Font.undefinedFont));
    });
    return words;
  }
}
