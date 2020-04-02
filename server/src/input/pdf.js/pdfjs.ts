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

import { BoundingBox, Element, Page } from '../../types/DocumentRepresentation';
import { OperatorsManager } from './OperatorsManager';

/**
 * Executes the pdfjs extraction function, reading an input pdf file and extracting a document representation.
 * This function involves recovering page contents like words, bounding boxes, fonts and other information that
 * the pdfjs tool's output provides.
 *
 * @param pdfInputFile The path including the name of the pdf file for input.
 * @returns The promise of a valid document (in the format DocumentRepresentation).
 */

export async function loadPage(document: any, pageNum: number): Promise<Page> {
  const page = await document.getPage(pageNum);
  const viewport = page.getViewport({ scale: 1.0 });
  const pageOperatorList: any = await page.getOperatorList();

  const opManager = new OperatorsManager(pageOperatorList);
  const pageElements: Element[] = opManager.processOperators();

  return new Page(pageNum, pageElements, new BoundingBox(0, 0, viewport.width, viewport.height));
}
