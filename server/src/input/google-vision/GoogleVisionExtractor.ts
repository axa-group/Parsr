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

import * as vision from '@google-cloud/vision';
import { writeFileSync } from 'fs';
import { Config } from '../../types/Config';
import {
  BoundingBox,
  Character,
  Document,
  Element,
  Font,
  Line,
  Page,
  Paragraph,
  Word,
} from '../../types/DocumentRepresentation';
import { getTemporaryFile } from '../../utils';
import { OcrExtractorFactory } from '../OcrExtractor';
import * as credentials from './credentials.json';

type GoogleVisionBoundingPoly = vision.protos.google.cloud.vision.v1.IBoundingPoly;

/**
 * An extractor class to extract content from images using Google Vision
 */
export class GoogleVisionExtractor extends OcrExtractorFactory {

  constructor(config: Config) {
    super(config, credentials);
    this.checkCredentials([
      "auth_provider_x509_cert_url",
      "auth_uri",
      "client_email",
      "client_id",
      "client_x509_cert_url",
      "private_key",
      "private_key_id",
      "project_id",
      "token_uri",
      "type",
    ]);

    const filePath = getTemporaryFile('.json');
    writeFileSync(filePath, JSON.stringify(this.config.extractor.credentials));
    process.env.GOOGLE_APPLICATION_CREDENTIALS = filePath;
  }

  public async scanImage(inputFile: string) {
    const client = new vision.ImageAnnotatorClient();
    const [result] = await client.documentTextDetection(inputFile);

    if (result.error) {
      const e = result.error;
      let details = '';

      if (e.details.length > 0) {
        details = ` Details: \n${e.details.join('\n')}`;
      }
      throw new Error(`Google Vision Error #${e.code}: ${e.message}${details}`);
    }

    const pages: Page[] = [];
    let pageNumber = 1;
    let order = 1;

    result.fullTextAnnotation.pages.forEach(gPage => {
      const elements: Element[] = [];
      gPage.blocks.forEach(gBlock => {
        const paragraphs = [];
        gBlock.paragraphs.forEach(gParagraph => {
          const words = [];
          gParagraph.words.forEach(gWord => {
            const characters = [];
            gWord.symbols.forEach(gSymbol => {
              const character = new Character(
                this.googleBoxToParsrBox(gSymbol.boundingBox),
                gSymbol.text,
              );
              character.properties.order = order++;
              if (gSymbol.confidence > 0) {
                character.confidence = gSymbol.confidence;
              }
              characters.push(character);
            });

            let lang;

            if (
              gWord.property &&
              gWord.property.detectedLanguages.length > 0 &&
              gWord.property.detectedLanguages[0].languageCode
            ) {
              lang = gWord.property.detectedLanguages[0].languageCode;
            }

            const word = new Word(
              this.googleBoxToParsrBox(gWord.boundingBox),
              characters,
              Font.undefinedFont,
              lang,
            );
            word.properties.order = order++;
            if (gWord.confidence > 0) {
              word.confidence = gWord.confidence;
            }
            words.push(word);
          });

          const line = new Line(this.googleBoxToParsrBox(gParagraph.boundingBox), words);
          line.properties.order = order++;
          const paragraph = new Paragraph(this.googleBoxToParsrBox(gParagraph.boundingBox), [line]);
          paragraph.properties.order = order++;
          if (gParagraph.confidence > 0) {
            paragraph.confidence = gParagraph.confidence;
          }
          paragraphs.push(paragraph);
          elements.push(paragraph);
        });
      });

      const page = new Page(
        pageNumber++,
        elements,
        new BoundingBox(0, 0, gPage.width, gPage.height),
      );
      pages.push(page);
    });

    return new Document(pages, inputFile);
  }

  private googleBoxToParsrBox(box: GoogleVisionBoundingPoly): BoundingBox {
    const left = Math.min(...box.vertices.map(v => v.x));
    const right = Math.max(...box.vertices.map(v => v.x));
    const top = Math.min(...box.vertices.map(v => v.y));
    const bottom = Math.max(...box.vertices.map(v => v.y));

    return new BoundingBox(left, top, right - left, bottom - top);
  }
}
