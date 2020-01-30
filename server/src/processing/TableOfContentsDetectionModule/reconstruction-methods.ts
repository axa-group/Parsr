import { BoundingBox, TableOfContentsItem } from './../../types/DocumentRepresentation';

export function reconstructTOCItem(text: string, bbox: BoundingBox): TableOfContentsItem {
  return Object.values(reconstructionMethods).map(method => method(text, bbox)).filter(r => !!r)[0];
}

const reconstructionMethods = {
  // Page <page number> <description>
  method_1: (text: string, bbox: BoundingBox): TableOfContentsItem => {
    const matches = new RegExp(/^page (\d+) (.+)/gi).exec(text);
    if (matches) {
      const [, pageNum, description] = matches;
      return new TableOfContentsItem(
        bbox,
        description.trim(),
        pageNum,
      );
    }
    return null;
  },
  // <section?> <description> <page number?>
  method_2: (text: string, bbox: BoundingBox): TableOfContentsItem => {
    const matches = new RegExp(/^([\d\.]*)(.*) ([\d\-]*)$/).exec(text);
    if (matches) {
      const [, section, description, pageNum] = matches;
      return new TableOfContentsItem(
        bbox,
        [section, description].filter(c => !!c).map(c => c.trim()).join(' '),
        pageNum,
        // TOC item level is based on the amount of dots in the section number
        section ? (section.match(/\./g) || []).length : 0,
      );
    }
    return null;
  },

  // if every other method fails, return a tocItem with full text as description
  default_method: (text: string, bbox: BoundingBox): TableOfContentsItem => {
    return new TableOfContentsItem(bbox, text);
  },
};
