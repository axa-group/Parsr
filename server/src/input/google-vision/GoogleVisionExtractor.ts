import * as vision from '@google-cloud/vision';
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
import { OcrExtractorFactory } from '../OcrExtractor';

type GoogleVisionResponse = Array<{
  fullTextAnnotation: FullTextAnnotation;
  textAnnotations: TextAnnotation[];
  error: {
    message: string;
    code: number;
    details: any[];
  };
}>;

type GoogleVisionDetectedBreak = {
  type: 'UNKNOWN' | 'SPACE' | 'SURE_SPACE' | 'EOL_SURE_SPACE' | 'HYPHEN' | 'LINE_BREAK';
  is_prefix: boolean;
};

type GoogleVisionBoundingBox = {
  vertices: [
    {
      x: number;
      y: number;
    },
  ];
  normalizedVertices: [];
};

type GoogleVisionProperty = {
  detectedLanguages: [
    {
      languageCode: string;
      confidence: number;
    },
  ];
  detectedBreak: GoogleVisionDetectedBreak;
};

type FullTextAnnotation = {
  pages: [
    {
      blocks: [
        {
          paragraphs: [
            {
              words: [
                {
                  symbols: [
                    {
                      text: string;
                      property: GoogleVisionProperty;
                      boundingBox: GoogleVisionBoundingBox;
                      confidence: number;
                    },
                  ];
                  property: GoogleVisionProperty;
                  boundingBox: GoogleVisionBoundingBox;
                  confidence: number;
                },
              ];
              property: GoogleVisionProperty;
              boundingBox: GoogleVisionBoundingBox;
              confidence: number;
            },
          ];
          property: GoogleVisionProperty;
          boundingBox: GoogleVisionBoundingBox;
          blockType: 'UNKNOWN' | 'TEXT' | 'TABLE' | 'PICTURE' | 'RULER' | 'BARCODE';
          confidence: number;
        },
      ];
      property: GoogleVisionProperty;
      width: number;
      height: number;
      confidence: number;
    },
  ];
  text: string;
};

type TextAnnotation = {
  locations: [];
  properties: [];
  mid: string;
  locale: string;
  description: string;
  score: number;
  confidence: number;
  topicality: number;
  boundingPoly: GoogleVisionBoundingBox;
};

/**
 * An extractor class to extract content from images using Google Vision
 */
export class GoogleVisionExtractor extends OcrExtractorFactory {
  public async scanImage(inputFile: string) {
    const client = new vision.ImageAnnotatorClient();
    const result: GoogleVisionResponse = await client.documentTextDetection(inputFile);

    if (result[0].error) {
      const e = result[0].error;
      let details = '';

      if (e.details.length > 0) {
        details = ` Details: \n${e.details.join('\n')}`;
      }
      throw new Error(`Google Vision Error #${e.code}: ${e.message}${details}`);
    }

    const pages: Page[] = [];
    let pageNumber = 1;
    let order = 1;

    result[0].fullTextAnnotation.pages.forEach(gPage => {
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

  private googleBoxToParsrBox(box: GoogleVisionBoundingBox): BoundingBox {
    const left = Math.min(...box.vertices.map(v => v.x));
    const right = Math.max(...box.vertices.map(v => v.x));
    const top = Math.min(...box.vertices.map(v => v.y));
    const bottom = Math.max(...box.vertices.map(v => v.y));

    return new BoundingBox(left, top, right - left, bottom - top);
  }
}
