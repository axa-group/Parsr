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

import axios, { AxiosInstance } from 'axios';
import { readFileSync } from 'fs';
import { Config } from '../../types/Config';
import { BoundingBox, Document, Font, Line, Page, Word } from '../../types/DocumentRepresentation';
import { OcrExtractorFactory } from '../OcrExtractor';

type MSCognitiveServicesResponse = {
  status: 'NotStarted' | 'Running' | 'Failed' | 'Succeeded';
  recognitionResults: Array<{
    page: number;
    clockwiseOrientation: number;
    width: number;
    height: number;
    unit: string;
    lines: Array<{
      boundingBox: number[];
      text: string;
      words: Array<{
        boundingBox: number[];
        text: string;
      }>;
    }>;
  }>;
};

export class MicrosoftCognitiveExtractor extends OcrExtractorFactory {
  private apiClient: AxiosInstance = null;

  constructor(config: Config) {
    super(config);
    if (!process.env.OCP_APIM_SUBSCRIPTION_KEY) {
      throw new Error(
        `Required environment variable OCP_APIM_SUBSCRIPTION_KEY not found. Make sure you set it as 'OCP_APIM_SUBSCRIPTION_KEY=<API_KEY>' before running the tool.`,
      );
    }

    this.apiClient = axios.create({
      baseURL: process.env.OCP_APIM_ENDPOINT || 'https://westeurope.api.cognitive.microsoft.com/',
      headers: {
        'Content-Type': 'application/octet-stream',
        'Ocp-Apim-Subscription-Key': process.env.OCP_APIM_SUBSCRIPTION_KEY,
      },
      timeout: 20000,
    });
  }

  public async scanImage(inputFile: string) {
    try {
      const { headers } = await this.apiClient.post(
        '/vision/v2.0/read/core/asyncBatchAnalyze',
        readFileSync(inputFile),
      );
      const data: MSCognitiveServicesResponse = await this.awaitForCompletion(
        headers['operation-location'],
      );
      const pages: Page[] = this.msResponseToParsrPages(data);
      return new Document(pages, inputFile);
    } catch (error) {
      throw new Error(error);
    }
  }

  private async awaitForCompletion(url: string): Promise<MSCognitiveServicesResponse> {
    return this.apiClient.get(url).then(({ data }) => {
      const response: MSCognitiveServicesResponse = data;
      return new Promise((resolve, reject) => {
        if (response.status === 'Running' || response.status === 'NotStarted') {
          setTimeout(() => {
            resolve(this.awaitForCompletion(url));
          }, 1000); // check response status every 1 second
        } else if (response.status === 'Succeeded') {
          resolve(response);
        } else {
          reject(response.status);
        }
      });
    });
  }

  private msResponseToParsrPages(data: MSCognitiveServicesResponse): Page[] {
    const pages: Page[] = [];
    data.recognitionResults.forEach(p => {
      const lines: Line[] = [];
      p.lines.forEach(line => {
        const words: Word[] = [];
        line.words.forEach(word => {
          const bb: BoundingBox = this.msBBToParsrBB(word.boundingBox);
          const w = new Word(bb, word.text, Font.undefinedFont);
          words.push(w);
        });
        lines.push(new Line(this.msBBToParsrBB(line.boundingBox), words));
      });
      const page = new Page(p.page, lines, new BoundingBox(0, 0, p.width, p.height));
      pages.push(page);
    });
    return pages;
  }

  /**
   * @param msBB array of 8 numbers in format [x1,y1,x2,y2,x3,y3,x4,y4]
   *  representing the 4 vertices of a Box in clockwise direction.
   *
   *  As this MSBox can be rotated or have an irregular shape, a transformation is required
   *  to always return a rectangular box that fully includes the original shape
   */
  private msBBToParsrBB(msBB: number[]): BoundingBox {
    const [x1, y1, x2, y2, x3, y3, x4, y4] = msBB;
    return new BoundingBox(
      Math.min(x1, x2, x3, x4),
      Math.min(y1, y2, y3, y4),
      Math.max(x1, x2, x3, x4) - Math.min(x1, x2, x3, x4),
      Math.max(y1, y2, y3, y4) - Math.min(y1, y2, y3, y4),
    );
  }
}
