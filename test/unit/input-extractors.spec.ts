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

import { expect } from 'chai';
import { withData } from 'leche';
import 'mocha';
// import { EmailExtractor } from '../../server/src/input/email/EmailExtractor';
import { PDFJsExtractor } from '../../server/src/input/pdf.js/PDFJsExtractor';
import { LinesToParagraphModule } from '../../server/src/processing/LinesToParagraphModule/LinesToParagraphModule';
import { OutOfPageRemovalModule } from '../../server/src/processing/OutOfPageRemovalModule/OutOfPageRemovalModule';
import { ReadingOrderDetectionModule } from '../../server/src/processing/ReadingOrderDetectionModule/ReadingOrderDetectionModule';
import { WhitespaceRemovalModule } from '../../server/src/processing/WhitespaceRemovalModule/WhitespaceRemovalModule';
import { WordsToLineModule } from '../../server/src/processing/WordsToLineModule/WordsToLineModule';
import { Paragraph } from '../../server/src/types/DocumentRepresentation';
import { runModules } from './../helpers';

const ASSETS_DIR = __dirname + '/assets/';

describe('PDF.js input module', () => {
    withData(
        {
            'one paragraph text extraction': [
                'One_Paragraph.pdf',
                "**Lorem Ipsum** is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry's standard dummy text ever since the 1500s, when an unknown printer took a galley of type and scrambled it to make a type specimen book. It has survived not only five centuries, but also the leap into electronic typesetting, remaining essentially unchanged. It was popularised in the 1960s with the release of Letraset sheets containing Lorem Ipsum passages, and more recently with desktop publishing software like Aldus PageMaker including versions of Lorem Ipsum.",
            ],
        },
        (fileName, expectedText) => {
            let exportedText: string = '';

            before(done => {
                const extractor = new PDFJsExtractor({
                    "version": 0.5,
                    "extractor": {
                        "pdf": "pdfjs",
                        "img": "tesseract",
                        "language": ["eng", "fra"],
                    },
                    "cleaner": [],
                    "output": {
                        "granularity": "word",
                        "includeMarginals": false,
                        "formats": {},
                    },
                });

                extractor.run(ASSETS_DIR + fileName).then(document => {
                    runModules(document, [
                        new OutOfPageRemovalModule(),
                        new WhitespaceRemovalModule(),
                        new ReadingOrderDetectionModule(),
                        new WordsToLineModule(),
                        new LinesToParagraphModule(),
                    ]).then(doc => {
                        exportedText = doc.getElementsOfType<Paragraph>(Paragraph).map(p => p.toMarkdown()).join(' ');
                        done();
                    });
                });
            });

            it('PDF.js should export expected text', () => {
                expect(exportedText).to.eq(expectedText);
            });
        },
    );
});

// describe('EML input module', () => {
//     withData(
//         {
//             'one paragraph text extraction': [
//                 'One_Paragraph.eml',
//                 "**Lorem Ipsum** is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry's standard dummy text ever since the 1500s, when an unknown printer took a galley of type and scrambled it to make a type specimen book. It has survived not only five centuries, but also the leap into electronic typesetting, remaining essentially unchanged. It was popularised in the 1960s with the release of Letraset sheets containing Lorem Ipsum passages, and more recently with desktop publishing software like Aldus PageMaker including versions of Lorem Ipsum.",
//             ],
//         },
//         (fileName, expectedText) => {
//             let exportedText: string = '';

//             before(done => {
//                 const extractor = new EmailExtractor({
//                     "version": 0.5,
//                     "extractor": {
//                         "pdf": "pdfjs",
//                         "img": "tesseract",
//                         "language": ["eng", "fra"],
//                     },
//                     "cleaner": [],
//                     "output": {
//                         "granularity": "word",
//                         "includeMarginals": false,
//                         "formats": {},
//                     },
//                 });

//                 extractor.run(ASSETS_DIR + fileName).then(document => {
//                     runModules(document, [
//                         new OutOfPageRemovalModule(),
//                         new WhitespaceRemovalModule(),
//                         new ReadingOrderDetectionModule(),
//                         new WordsToLineModule(),
//                         new LinesToParagraphModule(),
//                     ]).then(doc => {
//                         exportedText = doc.getElementsOfType<Paragraph>(Paragraph).map(p => p.toMarkdown()).join(' ');
//                         done();
//                     });
//                 });
//             });

//             it('EML extractor should export expected text', () => {
//                 expect(exportedText).to.eq(expectedText);
//             });
//         },
//     );
// });
