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

import { existsSync } from 'fs';
import { Config } from '../types/Config';
import { Document } from '../types/DocumentRepresentation/Document';

/**
 * The extractor is responsible to extract every possible information
 * from the PDF/Image file and store it in the Json file.
 * It also ensure that the Json file is correctly formated and contains all the needed
 * information in a clever way.
 */
export abstract class Extractor {
  public config: Config;

  constructor(config: Config, credentials: any = {}) {
    this.config = config;

    if (!this.config.extractor.credentials) {
      this.config.extractor.credentials = {};
    }
    Object.keys(credentials).forEach(key => {
      if (!this.config.extractor.credentials[key]) {
        this.config.extractor.credentials[key] = credentials[key];
      }
    });
  }

  public checkCredentials(required: string[]) {
    const missingCredentials: string[] = required.filter(c => !this.config.extractor.credentials[c]);
    if (missingCredentials.length > 0) {
      throw new Error(`Required credentials not found: ${missingCredentials.join(', ')}. Make sure you set it in the extractor configuration:
${
        JSON.stringify({
          extractor: {
            pdf: '...',
            ocr: '...',
            language: [],
            credentials: {
              ...missingCredentials.reduce((acc, cred) => {
                acc[cred] = '...';
                return acc;
              }, {}),
            },
          },
        }, null, 2)
        }`,
      );
    }
  }

  public checkCredentialAsFile(credential: string, format: string) {
    const filePath = this.config.extractor.credentials[credential];
    const fileExists = existsSync(filePath);
    if (!fileExists || !filePath.endsWith(format)) {
      throw new Error(
        `${credential} must be an absolute path to a ${format} file.`,
      );
    }
  }

  public abstract run(inputFile: string): Promise<Document>;

}
