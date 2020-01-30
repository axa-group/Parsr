import { BoundingBox, Paragraph, Word } from './../../types/DocumentRepresentation';

export const threshold = 0.4;

export function TOCDetected(p: Paragraph): boolean {
  return Object.values(detectionMethods).some(method => method(p));
}

const detectionMethods = {
  /*
    searches for text finishing in numbers in the right 10% width area of the BBox
  */
  endsWithNumber: (p: Paragraph): boolean => {
    const w = p.width * 0.1;
    const intersectionBox = new BoundingBox(p.right - w, p.top, w, p.height);
    const wordsInsideIntersection =
      p.getWords()
        .filter(word => BoundingBox.getOverlap(word.box, intersectionBox).box1OverlapProportion > 0)
        .filter(word => !isSeparator(word));

    return wordsInsideIntersection.filter(isNumber).length > Math.floor(wordsInsideIntersection.length * 0.5);
  },
  hasPageNKeyword: (p: Paragraph): boolean => {
    return new RegExp(/^pag.* (\d+) (.+)/gi).test(p.toString());
  },
};

// TODO maybe handle this in a different way
const tocKeywords = [
  'contents',
  'index',
  'table of contents',
  'contenidos',
  'indice',
  'índice',
  'tabla de contenidos',
];

function isNumber(word: Word): boolean {
  const decimalNumbers = new RegExp(/[0-9]+$/);
  const romanNumbers = new RegExp(/^[ivxlcdm]+$/i);
  const w = word.toString();
  return decimalNumbers.test(w) || romanNumbers.test(w);
}

function isSeparator(word: Word): boolean {
  const separators = new RegExp(/^[-. ]+$/);
  return separators.test(word.toString().trim());
}

export function hasKeyword(pageParagraphs: Paragraph[]): boolean {
  const rawText = pageParagraphs.map(p => p.toString()).join(' ');
  return tocKeywords.some(k => rawText.toLowerCase().includes(k.toLowerCase()));
}
