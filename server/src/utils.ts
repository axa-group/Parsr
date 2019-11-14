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

import { spawnSync } from 'child_process';
import * as concaveman from 'concaveman';
import * as crypto from 'crypto';
import * as fs from 'fs';
import * as os from 'os';
import * as path from 'path';
import { inspect } from 'util';
import { OptionsV2, parseString } from 'xml2js';
import { DOMParser } from 'xmldom';
import {
  BoundingBox,
  Document,
  Element,
  Font,
  Line,
  Page,
  Text,
} from './types/DocumentRepresentation';
import logger from './utils/Logger';

let mutoolImagesFolder: string = '';
let mutoolExtractionFolder: string = '';

export function replaceObject<T extends Element, U extends T>(
  doc: Document,
  oldObj: T,
  newObj: U,
): Document {
  doc.pages.forEach((page: Page) => {
    page.elements = page.elements.map((element: Element) => {
      _replaceObject(element);
      if (element === oldObj) {
        element = newObj;
      }
      return element;
    });
  });

  return doc;

  function _replaceObject(element: Element) {
    if (element.parent) {
      if (element.parent === oldObj) {
        element.parent = newObj;
      }
    }

    element.children = element.children.map((child: Element) => {
      if (child === oldObj) {
        child = newObj;
      }
      return child;
    });

    if (Array.isArray(element.content)) {
      element.content = element.content.map((elem: Element) => {
        if (elem === oldObj) {
          elem = newObj;
        }

        _replaceObject(elem);
        return elem;
      });
    }
  }
}

// Handle Windows convert.exe conflict.
export function getConvertPath(): string {
  const where = spawnSync(getExecLocationCommandOnSystem(), ['magick']);
  let filePaths: string[] = [];

  if (where.status === 0) {
    filePaths = where.stdout.toString().split(os.EOL);
    filePaths = filePaths.filter(
      filePath => !/System/.test(filePath) && filePath.trim().length > 0,
    );
  }

  if (filePaths.length === 0) {
    throw new Error('Cannot find ImageMagick convert tool. Are you sure it is installed?');
  } else {
    return filePaths[0];
  }
}

/**
 * Returns the location of the python command on the system
 */
export function getPythonLocation(): string {
  const pythonLocation: string = getCommandLocationOnSystem('python3', 'python');
  if (!pythonLocation) {
    logger.warn(`Unable to find python. Are you sure it is installed?`);
    return '';
  } else {
    logger.debug(`python was found at ${pythonLocation}`);
    return pythonLocation;
  }
}

/**
 * Returns the location of the pdf2txt command on the system
 */
export function getPdf2txtLocation(): string {
  const pdf2txtLocation: string = getCommandLocationOnSystem('pdf2txt.py', 'pdf2txt');
  if (!pdf2txtLocation) {
    logger.warn(
      `Unable to find pdf2txt, the pdfminer tool on the system. Are you sure it is installed?`,
    );
    return '';
  } else {
    logger.debug(`pdf2txt was found at ${pdf2txtLocation}`);
    return pdf2txtLocation;
  }
}

/**
 * Returns the location of the dumppdf command on the system
 */
export function getDumppdfLocation(): string {
  const dumppdfLocation: string = getCommandLocationOnSystem('dumppdf.py', 'dumppdf');
  if (!dumppdfLocation) {
    logger.warn(
      `Unable to find dump, the pdfminer tool on the system. Are you sure it is installed?`,
    );
    return '';
  } else {
    logger.debug(`dumppdf was found at ${dumppdfLocation}`);
    return dumppdfLocation;
  }
}

export function getMutoolImagesPrefix(): string {
  return 'page';
}

export function getMutoolImagesFolder(): string {
  if (!mutoolImagesFolder) {
    mutoolImagesFolder = getTemporaryDirectory();
  }
  return mutoolImagesFolder;
}

export function getMutoolExtractionFolder(): string {
  if (!mutoolExtractionFolder) {
    mutoolExtractionFolder = getTemporaryDirectory();
  }
  return mutoolExtractionFolder;
}

export function getTemporaryDirectory(): string {
  const randFoldername = `${os.tmpdir()}/${crypto.randomBytes(15).toString('hex')}`;
  fs.mkdirSync(randFoldername);
  return path.resolve(`${randFoldername}`);
}

export function getTemporaryFile(extension: string): string {
  const randFilename = `${os.tmpdir()}/${crypto.randomBytes(15).toString('hex') + extension}`;
  return path.resolve(`${randFilename}`);
}

/**
 * Sort function to sort elements by order
 */
export function sortElementsByOrder(elem1: Element, elem2: Element): number {
  const orderA: number = getOrder(elem1);
  const orderB: number = getOrder(elem2);
  return orderA - orderB;

  function getOrder(element: Element): number {
    if (typeof element.properties.order !== 'undefined') {
      return element.properties.order;
    } else if (Array.isArray(element.content)) {
      return element.content
        .map((cont: Element) => getOrder(cont))
        .reduce((a, b) => Math.min(a, b), Infinity);
    } else {
      return Infinity;
    }
  }
}

/**
 * Make subCollections of a predetermined size based on a collection.
 * @param collection The collection to be used as the basis for the division.
 * @param subCollectionSize The size of the smaller subCollections to be made
 */
export function getSubCollections<T>(collection: T[], subCollectionSize: number): T[][] {
  if (subCollectionSize >= collection.length) {
    return [collection];
  }
  const max: number = collection.length;
  const result: T[][] = [];
  let j: number = 0;
  for (j = subCollectionSize; j !== max + 1; ++j) {
    const i: number = j - subCollectionSize;
    result.push(collection.slice(i, j));
  }
  return result;
}

/**
 * Merge paragraphs blocks together.
 * Also handles properly bullet points.
 * @param content Array of text block to be merged into a single one
 */
export function mergeElements<T extends Text, U extends Text>(parent: U, ...content: T[]): U {
  if (content.length === 0) {
    return parent;
  }

  content = content.filter(l => l !== null && typeof l !== 'undefined');
  content.sort(sortElementsByOrder);

  parent.content = content;

  parent.box = BoundingBox.merge(content.map(c => c.box));

  // FIXME Add font support
  // paragraph.font = (lines.sort((a, b) => b.data.length - a.data.length)[0] || paragraph).font;

  // TODO Find a clever way to handle that (or not)
  // paragraph.metadata = utils.concatTags(...lines.map(l => l.metadata));

  return parent;
}

/**
 * The "median" is the "middle" value in the list of numbers.
 *
 * @param {Array} numbers An array of numbers.
 * @return {Number} The calculated median value from the specified numbers.
 */
export function median(numbers: number[]): number {
  numbers.sort((a, b) => a - b);

  if (numbers.length % 2 === 0) {
    return (numbers[numbers.length / 2 - 1] + numbers[numbers.length / 2]) / 2;
  } else {
    return numbers[(numbers.length - 1) / 2];
  }
}

/**
 * Check if text blocks are vertically aligned in the center.
 */
export function isAlignedCenter(texts: Text[], alignUncertainty: number = 0): boolean {
  for (let i = 0; i < texts.length - 1; i++) {
    const t1 = texts[i];
    const t2 = texts[i + 1];
    if (Math.abs(t1.left + t1.width / 2 - (t2.left + t2.width / 2)) > alignUncertainty) {
      return false;
    }
  }

  return true;
}

/**
 * Check if text blocks are vertically aligned on the left or right side.
 * Also handles bullet point with an uncertainty.
 */
export function isAligned(
  texts: Text[],
  alignUncertainty: number = 0,
  bulletUncertainty: number = 40,
): boolean {
  return (
    isAlignedLeft(texts, alignUncertainty, bulletUncertainty) ||
    isAlignedRight(texts, alignUncertainty)
  );
}

export function isAlignedLeft(
  texts: Text[],
  alignUncertainty: number = 0,
  bulletUncertainty: number = 40,
): boolean {
  for (let i = 0; i < texts.length - 1; i++) {
    const t1 = texts[i];
    const t2 = texts[i + 1];

    // if (!t1.metadata.bulletList && !t2.metadata.bulletList) {
    // 	bulletUncertainty = 0;
    // }

    if (Math.abs(t1.left - t2.left) > alignUncertainty + bulletUncertainty) {
      return false;
    }
  }

  return true;
}

export function findElementIDInPageBySameBoundingBox(element: Element, page: Page): number {
  let elementID: number = -1;
  const elements: Element[] = page.getAllElements();
  elements.forEach(e => {
    if (BoundingBox.isEqual(e.box, element.box)) {
      elementID = e.id;
    }
  });
  return elementID;
}

export function isAlignedRight(texts: Text[], alignUncertainty: number = 0): boolean {
  for (let i = 0; i < texts.length - 1; i++) {
    const t1 = texts[i];
    const t2 = texts[i + 1];

    if (Math.abs(t1.left + t1.width - (t2.left + t2.width)) > alignUncertainty) {
      return false;
    }
  }

  return true;
}

/**
 * Check if an element is contained inside a bounding box
 * @param element Element that'll be checked
 * @param box Containing box
 * @param strict Will check if the element can stay strictly in the box without overstepping (Default: `true`)
 */
export function isInBox(element: Element, box: BoundingBox, strict: boolean = true): boolean {
  if (strict) {
    return (
      element.box.top >= box.top &&
      element.box.top + element.box.height <= box.top + box.height &&
      element.box.left >= box.left &&
      element.box.left + element.box.width <= box.left + box.width
    );
  } else {
    return BoundingBox.getOverlap(element.box, box).jaccardIndex === 0;
  }
}

/**
 * Check if blocks are in the same location, but maybe on different pages
 * @param uncertainty error margin in px
 * @param texts text block that'll be compared
 */
export function hasSameLocation(uncertainty: number, ...texts: Text[]): boolean {
  const top = Math.min(...texts.map(t => t.top));
  const left = Math.min(...texts.map(t => t.left));
  const bottom = Math.max(...texts.map(t => t.top + t.height));
  const right = Math.max(...texts.map(t => t.left + t.width));

  for (const t of texts) {
    if (
      t.top > top + uncertainty ||
      t.left > left + uncertainty ||
      top + t.height < bottom - uncertainty * 2 ||
      left + t.width < right - uncertainty * 2
    ) {
      return false;
    }
  }

  return true;
}

/**
 * generates 'count' number of elements from start
 * @param start start number
 * @param count number of elements
 */
export function range(start, count) {
  return Array.apply(0, Array(count)).map((_element, index) => index + start);
}

/**
 * Remove `null` or `undefined` elements
 * @param doc
 */
export function removeNull(page: Page): Page {
  const newElements: Element[] = page.elements.filter(e => e !== null && typeof e !== 'undefined');
  if (page.elements.length - newElements.length !== 0) {
    logger.debug(
      `Null elements removed for page #${page.pageNumber}: ${page.elements.length -
        newElements.length}`,
    );
    page.elements = newElements;
  }
  return page;
}

/**
 * Get page from page number
 * @param doc Document
 * @param pageNumber Page number
 */
export function getPage(doc: Document, pageNumber: number): Page {
  return doc.pages.filter(p => p.pageNumber === pageNumber)[0];
}

/**
 * Build a RegExp that matches any page numbers (i.e. Page 3, -3-, 3 of 5, (iii), etc.)
 */
export function getPageRegex(): RegExp {
  const pageWord = '(?:Pages?|Páginas?)';
  const ofWord = '(?:of|de|-|/)';

  const before = '[\\(\\[\\- ]*';
  const after = '[\\]\\)\\- ]*';

  const arabNumber = '[\\d]+';
  const romanNumber = 'M{0,4}(?:CM|CD|D?C{0,3})(?:XC|XL|L?X{0,3})(?:IX|IV|V?I{0,3})';
  const pageNumber = `(${arabNumber}|${romanNumber})`;

  const pagePrefix = `${pageWord}\\s*(?:\\|\\s*)?`;

  const pageRegex = new RegExp(
    `^(?:` +
      `(?:${pagePrefix}${pageNumber})|` +
      `(?:${pageNumber}\\s*(?:\\|\\s*)?${pageWord})|` +
      `(?:(?:${pageWord}\\s*)?${pageNumber}\\s*${ofWord}\\s*${pageNumber})|` +
      `(?:${before}${pageNumber}${after})` +
      `)$`,
    'i',
  );

  return pageRegex;
}

/**
 * Create a pool of promises with a maximal number of concurrent executions
 * @param poolLimit Max number of concurrent executions
 * @param args Arguments to give to the promiseConstructor
 * @param promiseConstructor Function that will create promises
 */
export function promisePool<U, T>(
  poolLimit: number,
  args: U[],
  promiseConstructor: (arg: U) => Promise<T>,
): Promise<T[]> {
  return new Promise<T[]>((resolve, reject) => {
    let i: number = 0;
    const allPromises: Array<Promise<T>> = [];
    const racingPromises: Array<Promise<T>> = [];

    function enqueue(): void {
      if (allPromises.length === args.length) {
        // Every promise has been created, one just waits for them to resolve
        Promise.all(allPromises)
          .then(values => {
            resolve(values);
          })
          .catch(e => reject(e));
      } else {
        // Create a new promise and add it to the running pool
        const arg: U = args[i++];
        const promise: Promise<T> = promiseConstructor(arg);
        promise.then(() => racingPromises.splice(racingPromises.indexOf(promise), 1));
        allPromises.push(promise);
        racingPromises.push(promise);

        if (racingPromises.length < poolLimit) {
          enqueue();
        } else {
          Promise.race(racingPromises)
            .then(() => {
              enqueue();
            })
            .catch(e => reject(e));
        }
      }
    }

    enqueue();
  });
}

/**
 * Prettifies an object and returns the pretty string
 * @param obj The object to be prettified
 */
export function prettifyObject(obj: object, compact: boolean = false): string {
  return inspect(obj, { colors: true, compact });
}

export function round(n: number, decimals: number = 2): number {
  return Math.round(n * Math.pow(10, decimals)) / Math.pow(10, decimals);
}

export function toKebabCase(str: string): string {
  return str.replace(/([a-z])([A-Z])/g, '$1-$2').toLowerCase();
}

// converts a sentence to title case
export function toTitleCase(str: string): string {
  return str
    .split(' ')
    .map(w => w[0].toUpperCase() + w.slice(1, w.length))
    .join(' ');
}

/**
 * Generates a convex hull from vertices
 * @param vertices the list of vertices of type number[][], as [[x,y], ...]
 * @return polygon as number[][]
 */
export function getConvexHull(vertices: number[][]): number[][] {
  return concaveman(vertices);
}

/**
 * Computes all the angles of a polygon
 * @param orderedVertices list of vertices forming the segments as number[][]
 * @return angles at each vertex as number[]
 */
export function getAnglesOfPolygon(orderedVertices: number[][]): number[] {
  function computeAngle(dx: number, dy: number): number {
    let theta = Math.atan2(dy, dx); // range (-PI, PI]
    theta *= 180 / Math.PI; // rads to degs, range (-180, 180]
    // if (theta < 0) theta = 360 + theta; // range [0, 360)
    return theta;
  }
  const angles: number[] = [];
  orderedVertices.forEach((vertex, index) => {
    if (index !== orderedVertices.length - 1) {
      const from: number[] = vertex;
      const to: number[] = orderedVertices[index + 1];
      angles.push(computeAngle(to[0] - from[0], to[1] - from[1]));
    }
  });
  return angles;
}

/**
 * Computes addition of two vectors. If they're of different sizes, the extra
 * dimensions are copied as-is at the trailing end of the result.
 * @param vec1: first vector in n dimensions
 * @param vec2: second vector in m dimensions
 */
export function addVectors(vec1: number[], vec2: number[]): number[] {
  let smallerVector: number[];
  let biggerVector: number[];
  let result: number[] = [];
  if (vec1.length < vec2.length) {
    smallerVector = vec1;
    biggerVector = vec2;
  } else if (vec2.length < vec1.length) {
    smallerVector = vec2;
    biggerVector = vec1;
  } else {
    for (let i = 0; i !== vec1.length; ++i) {
      result.push(vec1[i] + vec2[i]);
    }
    return result;
  }

  for (let i = 0; i !== smallerVector.length; ++i) {
    result.push(smallerVector[i] + biggerVector[i]);
  }

  result = [...result, ...biggerVector.slice(smallerVector.length, biggerVector.length)];
  return result;
}

/**
 * Computes euclidean distance between two vectors.
 * @param vec1: first vector in n dimensions
 * @param vec2: second vector in n dimensions
 */
export function getEuclideanDistance(vec1: number[], vec2: number[]): number {
  if (vec1.length !== vec2.length) {
    return -1;
  } // maybe resize? TODO
  const subtracted = vec1.map((i, n) => i - vec2[n]);
  const powered = subtracted.map(e => Math.pow(e, 2));
  const sum = powered.reduce((total, current) => total + current, 0);
  return Math.sqrt(sum);
}

/**
 * Computes the magnitude of a vector.
 * @param vec: the vector
 */
export function getMagnitude(vec: number[]): number {
  let sumOfSquares: number = 0;
  for (const n of vec) {
    sumOfSquares += n * n;
  }
  return Math.sqrt(sumOfSquares);
}

/**
 * Computes the dot product between two vectors.
 * @param vec1: first vector in n dimensions
 * @param vec2: second vector in n dimensions
 */
export function getDotProduct(vec1: number[], vec2: number[]): number {
  let result: number = 0;
  const lim: number = Math.min(vec1.length, vec2.length);
  if (vec1.length !== vec2.length) {
    logger.warn('[dotProduct] vectors have different sizes:', vec1.length, vec2.length);
    logger.warn('[dotProduct] taking min size', lim);
  }
  for (let i = 0; i < lim; i++) {
    result += vec1[i] * vec2[i];
  }
  return result;
}

/**
 * Finds the occurrence of an element in an array and returns the positions.
 * @param array: an array of type T
 * @param element: element to be looked for in the array
 * @return an array of position(s)
 */
export function findPositionsInArray<T>(array: T[], element: T): number[] {
  const result: number[] = [];
  array.forEach((value, position) => {
    if (value === element) {
      result.push(position);
    }
  });
  return result;
}

export function isGeneralUpperCase(lineGroup: Line[]): boolean {
  let generalUpperCase: boolean;
  const upperCaseScores: boolean[] = lineGroup.map((l: Line) => {
    if (l.toString().toUpperCase() === l.toString()) {
      return true;
    } else {
      return false;
    }
  });
  if (
    upperCaseScores.filter((s: boolean) => s === true).length >
    Math.floor(upperCaseScores.length / 2)
  ) {
    generalUpperCase = true;
  } else {
    generalUpperCase = false;
  }
  return generalUpperCase;
}
export function isGeneralTitleCase(lineGroup: Line[]): boolean {
  let generalTitleCase: boolean;
  const titleCaseScores: boolean[] = lineGroup.map((l: Line) => {
    if (toTitleCase(l.toString()) === l.toString()) {
      return true;
    } else {
      return false;
    }
  });
  if (
    titleCaseScores.filter((s: boolean) => s === true).length >
    Math.floor(titleCaseScores.length / 2)
  ) {
    generalTitleCase = true;
  } else {
    generalTitleCase = false;
  }
  return generalTitleCase;
}

/***
 * Finds the most common font among a list of fonts
 */
export function findMostCommonFont(fonts: Font[]): Font | undefined {
  const baskets: Font[][] = [];
  fonts.forEach((font: Font) => {
    let basketFound: boolean = false;
    baskets.forEach((basket: Font[]) => {
      if (basket.length > 0 && basket[0].isEqual(font)) {
        basket.push(font);
        basketFound = true;
      }
    });

    if (!basketFound) {
      baskets.push([font]);
    }
  });

  baskets.sort((a, b) => {
    return b.length - a.length;
  });

  if (baskets.length > 0 && baskets[0].length > 0) {
    return baskets[0][0];
  } else {
    return undefined;
  }
}

/**
 * returns the location of the executable locator command on the current system.
 * on linux/unix machines, this is 'which', on windows machines, it is 'where'.
 */
export function getExecLocationCommandOnSystem(): string {
  return os.platform() === 'win32' ? 'where' : 'which';
}

/**
 * returns the location of a command on a system.
 * @param firstChoice the first choice name of the executable to be located
 * @param secondChoice the second choice name of the executable to be located
 * @param thirdChoice the third choice name of the executable to be located
 */
export function getCommandLocationOnSystem(
  firstChoice: string,
  secondChoice: string = '',
  thirdChoice: string = '',
): string {
  const info = spawnSync(getExecLocationCommandOnSystem(), [firstChoice]);
  const result = info.status === 0 ? info.stdout.toString().split(os.EOL)[0] : null;
  if (result === null && secondChoice !== '') {
    return getCommandLocationOnSystem(secondChoice, thirdChoice);
  }
  return result;
}

/**
 * Returns the grouping of consecutive numbers in an array
 * @param theArray The input array of numbers
 */
export function groupConsecutiveNumbersInArray(theArray: number[]): number[][] {
  let result: number[][] = [];
  result = theArray
    .sort((a, b) => a - b)
    .reduce((r, n) => {
      const lastSubArray = r[r.length - 1];
      if (!lastSubArray || lastSubArray[lastSubArray.length - 1] !== n - 1) {
        r.push([]);
      }
      r[r.length - 1].push(n);
      return r;
    }, []);
  return result;
}

export function parseXmlToObject(xml: string, options: OptionsV2 = null): Promise<object> {
  const promise = new Promise<object>((resolveObject, rejectObject) => {
    const xmlStringSerialized = new DOMParser().parseFromString(xml, 'text/xml');
    parseString(xmlStringSerialized, options, (error, dataObject) => {
      if (error) {
        rejectObject(error);
      }
      resolveObject(dataObject);
    });
  });
  return promise;
}
