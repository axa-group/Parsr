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

import { existsSync, readdirSync, readFileSync } from 'fs';
export interface ConfigFile {
  version: number;
  extractor: {
    pdf: string;
    ocr: string;
    language: string[];
    credentials?: object;
  };
  cleaner: object[];
  output: object[];
}

export class ServerManager {
  private defaultConfigPath: string = `../../server/defaultConfig.json`;
  private defaultModulesFolder: string = `../../server/src/processing`;
  private defaultExtractorsFolder: string = '../../server/src/input';

  /**
   * Returns the default configuration of the server
   */
  public getDefaultConfig(): ConfigFile {
    return JSON.parse(readFileSync(this.defaultConfigPath, 'utf-8'));
  }

  public getDefaultConfigWithSpecs(): ConfigFile {
    const mainDefaultConfig = this.getDefaultConfig();
    mainDefaultConfig.cleaner = mainDefaultConfig.cleaner.map(this.fillModuleWithSpecs.bind(this));
    mainDefaultConfig.extractor = this.fillExtractorConfig(mainDefaultConfig.extractor);
    return mainDefaultConfig;
  }

  /**
   * Returns all the modules on the server
   */
  public getModules(): string[] {
    return readdirSync(this.defaultModulesFolder, { withFileTypes: true })
      .filter(dirEntry => dirEntry.isDirectory())
      .map(dirEntry => dirEntry.name)
      .map(d => d.replace(/([a-z])([A-Z])/g, '$1-$2').toLowerCase())
      .map(d => d.replace(/-module/g, ''));
  }

  /**
   * Returns the defaultConfig of the module asked for
   * @param moduleName the name of the module in snake-case
   */
  public getModuleConfig(moduleName: string): object {
    moduleName += '-module';
    const moduleFolderName = moduleName
      .split('-')
      .map(w => w[0].toUpperCase() + w.substr(1).toLowerCase())
      .join('');
    return JSON.parse(
      readFileSync(
        this.defaultModulesFolder + '/' + moduleFolderName + '/defaultConfig.json',
        'utf-8',
      ),
    );
  }

  private fillModuleWithSpecs(mod: object): object {
    const [moduleName, customConfig] = Array.isArray(mod) ? mod : [mod, {}];

    const { specs } = this.getModuleConfig(moduleName) as any;

    // merges custom parameter values with the value in the module specs
    Object.keys(customConfig).forEach(key => {
      specs[key].value = customConfig[key];

      if (
        Array.isArray(specs[key].value) &&
        typeof specs[key].value[0] === 'object' &&
        {}.hasOwnProperty.call(specs[key].value[0], 'pages') &&
        {}.hasOwnProperty.call(specs[key].value[0], 'flavor')
      ) {
        specs[key].value = specs[key].value.map((v: any) => ({
          ...v,
          table_areas: v.table_areas || [],
        }));
      }
    });

    const mergedResult = [moduleName, specs].filter(m => !!m);

    // if length === 2, config has parameters. if not, i return only the module name as a string
    return mergedResult.length === 2 ? mergedResult : mergedResult[0];
  }

  private fillExtractorConfig(extractor: ConfigFile['extractor']): ConfigFile['extractor'] {
    const pdfConfig = this.getExtractorConfig(extractor.pdf);
    const ocrConfig = this.getExtractorConfig(extractor.ocr);
    if (!extractor.credentials) {
      extractor.credentials = {};
    }
    extractor.credentials = {
      ...pdfConfig,
      ...ocrConfig,
      ...extractor.credentials,
    };
    return extractor;
  }

  private getExtractorConfig(name: string): any {
    const path = this.defaultExtractorsFolder + '/' + name + '/credentials.json';
    if (existsSync(path)) {
      return JSON.parse(readFileSync(path, 'utf-8'));
    } else {
      return {};
    }
  }
}
