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
import * as fs from 'fs';
import { withData } from 'leche';
import 'mocha';
import { MarkdownExporter } from '../../server/src/output/markdown/MarkdownExporter';
import { json2document } from '../../server/src/utils/json2document';

describe('Markdown Exporter', () => {
    withData(
        {
            'MD export with special characters': [
                'lorem-ipsum-special-characters.json',
            ],
        },
        (fileName) => {
            let exportedMD: string;
            let expectedMD: string;

            before(done => {
                const json = JSON.parse(
                    fs.readFileSync(__dirname + '/assets/' + fileName, { encoding: 'utf8' }),
                );

                const docBefore = json2document(json);
                docBefore.inputFile = __dirname + '/assets/' + fileName.replace('.json', '.pdf');

                const exporter = new MarkdownExporter(docBefore, false);
                const exportedMDFile = docBefore.inputFile.replace('.pdf', '.md');
                const expectedMDFile = docBefore.inputFile.replace('.pdf', '-expected.md');

                exporter.export(exportedMDFile)
                    .then(() => {
                        exportedMD = fs.readFileSync(exportedMDFile, { encoding: 'utf8' });
                        expectedMD = fs.readFileSync(expectedMDFile, { encoding: 'utf8' });
                        done();
                    });
            });

            after(done => {
                fs.unlinkSync(__dirname + '/assets/' + fileName.replace('.json', '.md'));
                done();
            });

            it('MD exporter should escape characters', () => {
                expect(exportedMD).to.eq(expectedMD);
            });
        },
    );
});
