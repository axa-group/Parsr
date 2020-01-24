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

export class Config {
  public version: number;
  public cleaner: CleanerConfig;
  public extractor: ExtractorConfig;
  public output: OutputConfig;
  constructor(config: any) {
    this.version = config.version;
    this.cleaner = config.cleaner;
    this.extractor = config.extractor;
    this.output = config.output;

    if (typeof this.extractor.pdf === 'undefined') {
      this.extractor.pdf = 'pdfminer';
    }

    if (typeof this.extractor.img === 'undefined') {
      this.extractor.img = 'tesseract';
    }

    if (typeof this.output.granularity === 'undefined') {
      this.output.granularity = 'word';
    }
  }
}

export type OutputGranularityOptions = 'character' | 'word';
export interface OutputConfig {
  granularity: OutputGranularityOptions;
  includeMarginals: boolean;
  formats: {
    json?: boolean;
    // 'json-compact'?: boolean;
    text?: boolean;
    markdown?: boolean;
    // xml?: boolean;
    // confidences?: boolean;
    csv?: boolean;
    pdf?: boolean;
  };
}

export type CleanerConfig = Array<string | [string, object]>;

export interface ExtractorConfig {
  pdf: 'pdfminer' | 'tesseract' | 'abbyy' | 'pdfjs';
  img: 'tesseract' | 'abbyy' | 'google-vision' | 'ms-cognitive-services' | 'amazon-textract';
  language: TesseractLanguage | TesseractLanguage[];
}

type TesseractLanguage =
  | 'afr'
  | 'amh'
  | 'ara'
  | 'asm'
  | 'aze'
  | 'aze_cyrl'
  | 'bel'
  | 'ben'
  | 'bod'
  | 'bos'
  | 'bre'
  | 'bul'
  | 'cat'
  | 'ceb'
  | 'ces'
  | 'chi_sim'
  | 'chi_sim_vert'
  | 'chi_tra'
  | 'chi_tra_vert'
  | 'chr'
  | 'cos'
  | 'cym'
  | 'dan'
  | 'deu'
  | 'div'
  | 'dzo'
  | 'ell'
  | 'eng'
  | 'enm'
  | 'epo'
  | 'est'
  | 'eus'
  | 'fao'
  | 'fas'
  | 'fil'
  | 'fin'
  | 'fra'
  | 'frk'
  | 'frm'
  | 'fry'
  | 'gla'
  | 'gle'
  | 'glg'
  | 'grc'
  | 'guj'
  | 'hat'
  | 'heb'
  | 'hin'
  | 'hrv'
  | 'hun'
  | 'hye'
  | 'iku'
  | 'ind'
  | 'isl'
  | 'ita'
  | 'ita_old'
  | 'jav'
  | 'jpn'
  | 'jpn_vert'
  | 'kan'
  | 'kat'
  | 'kat_old'
  | 'kaz'
  | 'khm'
  | 'kir'
  | 'kmr'
  | 'kor'
  | 'kor_vert'
  | 'lao'
  | 'lat'
  | 'lav'
  | 'lit'
  | 'ltz'
  | 'mal'
  | 'mar'
  | 'mkd'
  | 'mlt'
  | 'mon'
  | 'mri'
  | 'msa'
  | 'mya'
  | 'nep'
  | 'nld'
  | 'nor'
  | 'oci'
  | 'ori'
  | 'osd'
  | 'pan'
  | 'pol'
  | 'por'
  | 'pus'
  | 'que'
  | 'ron'
  | 'rus'
  | 'san'
  | 'script/Arabic'
  | 'script/Armenian'
  | 'script/Bengali'
  | 'script/Canadian_Aboriginal'
  | 'script/Cherokee'
  | 'script/Cyrillic'
  | 'script/Devanagari'
  | 'script/Ethiopic'
  | 'script/Fraktur'
  | 'script/Georgian'
  | 'script/Greek'
  | 'script/Gujarati'
  | 'script/Gurmukhi'
  | 'script/HanS'
  | 'script/HanS_vert'
  | 'script/HanT'
  | 'script/HanT_vert'
  | 'script/Hangul'
  | 'script/Hangul_vert'
  | 'script/Hebrew'
  | 'script/Japanese'
  | 'script/Japanese_vert'
  | 'script/Kannada'
  | 'script/Khmer'
  | 'script/Lao'
  | 'script/Latin'
  | 'script/Malayalam'
  | 'script/Myanmar'
  | 'script/Oriya'
  | 'script/Sinhala'
  | 'script/Syriac'
  | 'script/Tamil'
  | 'script/Telugu'
  | 'script/Thaana'
  | 'script/Thai'
  | 'script/Tibetan'
  | 'script/Vietnamese'
  | 'sin'
  | 'slk'
  | 'slv'
  | 'snd'
  | 'snum'
  | 'spa'
  | 'spa_old'
  | 'sqi'
  | 'srp'
  | 'srp_latn'
  | 'sun'
  | 'swa'
  | 'swe'
  | 'syr'
  | 'tam'
  | 'tat'
  | 'tel'
  | 'tgk'
  | 'tha'
  | 'tir'
  | 'ton'
  | 'tur'
  | 'uig'
  | 'ukr'
  | 'urd'
  | 'uzb'
  | 'uzb_cyrl'
  | 'vie'
  | 'yid'
  | 'yor';
