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

import { DrawingDetectionModule } from './processing/DrawingDetectionModule/DrawingDetectionModule';
import { HeaderFooterDetectionModule } from './processing/HeaderFooterDetectionModule/HeaderFooterDetectionModule';
import { HierarchyDetectionModule } from './processing/HierarchyDetectionModule/HierarchyDetectionModule';
import { ImageDetectionModule } from './processing/ImageDetectionModule/ImageDetectionModule';
import { KeyValueDetectionModule } from './processing/KeyValueDetectionModule/KeyValueDetectionModule';
import { LinesToParagraphModule } from './processing/LinesToParagraphModule/LinesToParagraphModule';
import { LinkDetectionModule } from './processing/LinkDetectionModule/LinkDetectionModule';
import { ListDetectionModule } from './processing/ListDetectionModule/ListDetectionModule';
import { MlHeadingDetectionModule } from './processing/MlHeadingDetectionModule/MlHeadingDetectionModule';
import { Module } from './processing/Module';
import { NumberCorrectionModule } from './processing/NumberCorrectionModule/NumberCorrectionModule';
import { OutOfPageRemovalModule } from './processing/OutOfPageRemovalModule/OutOfPageRemovalModule';
import { PageNumberDetectionModule } from './processing/PageNumberDetectionModule/PageNumberDetectionModule';
import { ReadingOrderDetectionModule } from './processing/ReadingOrderDetectionModule/ReadingOrderDetectionModule';
import { RedundancyDetectionModule } from './processing/RedundancyDetectionModule/RedundancyDetectionModule';
import { RegexMatcherModule } from './processing/RegexMatcherModule/RegexMatcherModule';
import { RemoteModule } from './processing/RemoteModule/RemoteModule';
import { SeparateWordsModule } from './processing/SeparateWordsModule/SeparateWordsModule';
import { TableDetection2Module } from './processing/TableDetection2Module/TableDetection2Module';
import { TableDetectionModule } from './processing/TableDetectionModule/TableDetectionModule';
import { TableOfContentsDetectionModule } from './processing/TableOfContentsDetectionModule/TableOfContentsDetectionModule';
import { WhitespaceRemovalModule } from './processing/WhitespaceRemovalModule/WhitespaceRemovalModule';
import { WordsToLineModule } from './processing/WordsToLineModule/WordsToLineModule';
import { WordsToLineNewModule } from './processing/WordsToLineNewModule/WordsToLineNew';
import { CleanerConfig, Config } from './types/Config';
import { Document } from './types/DocumentRepresentation/Document';
import logger from './utils/Logger';

/**
 * The cleaner a pipeline of tool used to clean up the PDF file represented in the Json,
 * such as removing useless white blocks, merging text blocks together to form words, sentences or paragraphs.
 * It can also add some metadata to any block to help higher level tools.
 */
export class Cleaner {
  private modules: Module[] = [];
  private solvedDependencies: Array<typeof Module> = [];

  // Every newly created module should figure in this register
  private cleaningToolRegister: Array<typeof Module> = [
    OutOfPageRemovalModule,
    ReadingOrderDetectionModule,
    WordsToLineModule,
    WordsToLineNewModule,
    KeyValueDetectionModule,
    LinesToParagraphModule,
    MlHeadingDetectionModule,
    HierarchyDetectionModule,
    LinkDetectionModule,
    ListDetectionModule,
    HeaderFooterDetectionModule,
    PageNumberDetectionModule,
    NumberCorrectionModule,
    RedundancyDetectionModule,
    WhitespaceRemovalModule,
    TableDetection2Module,
    TableDetectionModule,
    ImageDetectionModule,
    RegexMatcherModule,
    RemoteModule,
    SeparateWordsModule,
    TableOfContentsDetectionModule,
    DrawingDetectionModule,
    // Add your own module here!
  ];

  /**
   * Constructor for a cleaner based class.
   *
   * @param config Configuration for the cleaner type module.
   * @remarks Sets up the cleaner module with the configuration passed, along with checking if the dependencies.
   */
  constructor(config: Config) {
    if (config.version <= 0.4) {
      this.parse0_4Config(config.cleaner);
    } else {
      this.parseLatestConfig(config.cleaner);
    }
  }

  /**
   * Get a module using just its name.
   *
   * @param config Configuration for the cleaner type module.
   * @returns The found module.
   * @remarks Sets up the cleaner module with the configuration passed, along with checking if the dependencies.
   */
  public getModuleByName(name: string): typeof Module {
    const moduleClass: typeof Module = this.cleaningToolRegister.filter(
      M => M.moduleName === name,
    )[0];
    if (!moduleClass) {
      throw new Error(
        `Module called ${name} not found. Please check your config file with the documentation.`,
      );
    }

    return moduleClass;
  }

  /**
   * Runs the cleaning pipeline.
   *
   * @param document The document to be cleaned
   * @returns The promise of the document after the run of all the cleaning modules.
   * @remarks Goes through all the modules one by one and executes them, noting
   * the execution time for each one, then logging it.
   */
  public run(document: Document, config: Config): Promise<Document> {
    const startTime: number = Date.now();
    return this.runNextModule(document, 0, config).then(newDocument => {
      const endTime: number = (Date.now() - startTime) / 1000;
      logger.info(`Total elapsed time: ${endTime}s`);
      return newDocument;
    });
  }

  private parseLatestConfig(config: CleanerConfig) {
    config.forEach((entry: string | [string, object]) => {
      let toolName: string;
      let options: object = {};

      if (Array.isArray(entry)) {
        toolName = entry[0];

        if (typeof entry[1] === 'object') {
          options = entry[1];
        }
      } else {
        toolName = entry;
      }

      const moduleClass: typeof Module = this.getModuleByName(toolName);
      this.checkDependenciesAndAdd(moduleClass);
      logger.info('Check config module: ' + toolName);
      this.modules.push(new moduleClass(options));
    });
  }

  private parse0_4Config(config: CleanerConfig) {
    for (let i = 0; i < config.length; i++) {
      const toolName = config[i];
      if (typeof toolName !== 'string') {
        throw new Error(`expected tool name as string instead of options as object at index ${i}`);
      }

      let options: object = {};

      const opt = config[i + 1];
      if (i + 1 < config.length && typeof opt === 'object') {
        options = opt;
        i++;
      }

      const moduleClass: typeof Module = this.getModuleByName(toolName);
      this.checkDependenciesAndAdd(moduleClass);
      this.modules.push(new moduleClass(options));
    }
  }

  /**
   * Get a module using just its name.
   *
   * @param document The document on which the module is to be run.
   * @param i The index of the module to be run (among a list of modules).
   * @returns The promise of the document after running the next module.
   * @remarks Sets up the cleaner module with the configuration passed, along with checking of the dependencies.
   */

  private runNextModule(document: Document, i: number, config: Config): Promise<Document> {
    if (i < this.modules.length) {
      logger.info(
        `Running module: ${this.modules[i].constructor.name}, Options: ${JSON.stringify(
          this.modules[i].options,
        )}`,
      );

      const startTime: number = Date.now();
      return this.modules[i].run(document, config).then((doc: Document) => {
        const endTime: number = (Date.now() - startTime) / 1000;
        logger.info(`  Elapsed time: ${endTime}s`);
        return this.runNextModule(doc, i + 1, config);
      });
    } else {
      return Promise.resolve(document);
    }
  }

  /**
   * Check for dependencies given a type of a module, and then add it
   *
   * @param moduleClass The type of a module to be checked for.
   */
  private checkDependenciesAndAdd(moduleClass: typeof Module) {
    const unresolved: Array<typeof Module> = [];
    let isCovered: boolean = true;

    moduleClass.dependencies.forEach(dependency => {
      if (!this.solvedDependencies.includes(dependency)) {
        isCovered = false;
        unresolved.push(dependency);
      }
    });

    if (isCovered) {
      this.solvedDependencies.push(moduleClass);
    } else {
      const unresolvedStr: string = unresolved.map(m => m.moduleName).join(', ');
      throw new Error(
        `Module ${moduleClass.moduleName} has unresolved dependencies (${unresolvedStr}).`,
      );
    }
  }
}
