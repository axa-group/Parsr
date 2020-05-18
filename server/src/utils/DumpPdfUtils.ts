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

import { createReadStream } from 'fs';
import * as XmlStream from 'xml-stream';

export type DumpPdfLink = {
  nodeId: string;
  anchor: {
    type: 'URI' | 'GoTo';
    target: string;
  };
  box: {
    left: number;
    top: number;
    width: number;
    height: number;
  };
};

export type DumpPdfLinksResponse = {
  pageNumber: number;
  links: DumpPdfLink[];
};

type DumpPdfLinkingNode = {
  nodeId: string;
  children: string[];
};

export function extractLinks(xmlPath: string): Promise<DumpPdfLinksResponse[]> {
  return new Promise((resolve, reject) => {
    const xmlStream = new XmlStream(createReadStream(xmlPath, { encoding: 'utf8' }));

    let pagesInfo = [];
    const nodesToDeepSearch = [];
    const annots = [];
    const linkNodes = [];
    const pagesWithAnnots = {};

    xmlStream.collect('key');
    xmlStream.collect('value');
    xmlStream.collect('list > ref');
    xmlStream.collect('list > number');

    xmlStream.on('endElement: object', node => {
      let foundNodeType = false;

      if (nodesToDeepSearch.includes(node.$.id)) {
        if (hasNestedKeys(node, ['list', 'ref'])) {
          nodesToDeepSearch.push(...node.list.ref.map(r => r.$.id));
        }
      }

      if (nodeIs(node, 'Type', 'Pages')) {
        foundNodeType = true;
        if (hasNestedKeys(node, ['dict', 'key']) && hasNestedKeys(node, ['dict', 'value'])) {
          const pageKids = node.dict.value[node.dict.key.findIndex(k => k === 'Kids')];
          if (pageKids && hasNestedKeys(pageKids, ['list', 'ref'])) {
            pagesInfo.push(...pageKids.list.ref.map(r => r.$.id));
          }
        }
      }

      if (nodeIs(node, 'Type', 'Page')) {
        foundNodeType = true;
        if (hasNestedKeys(node, ['dict', 'key']) && hasNestedKeys(node, ['dict', 'value'])) {
          const annotPage = node.dict.value[node.dict.key.findIndex(k => k === 'Annots')];
          if (!pagesWithAnnots[node.$.id]) {
            pagesWithAnnots[node.$.id] = [];
          }
          if (annotPage && hasNestedKeys(annotPage, ['list', 'ref'])) {
            pagesWithAnnots[node.$.id].push(...annotPage.list.ref.map(r => r.$.id));
          } else if (annotPage && hasNestedKeys(annotPage, ['ref', '$', 'id'])) {
            pagesWithAnnots[node.$.id].push(annotPage.ref.$.id);
            nodesToDeepSearch.push(annotPage.ref.$.id);
          }
        }
      }

      if (nodeIs(node, 'Type', 'Annot') || nodeIs(node, 'Subtype', 'Link')) {
        foundNodeType = true;
        if (hasNestedKeys(node, ['dict', 'key']) && hasNestedKeys(node, ['dict', 'value'])) {
          const a = node.dict.value[node.dict.key.findIndex(k => k === 'A')];
          if (hasNestedKeys(a, ['ref', '$', 'id']) && !hasNestedKeys(a, ['dict'])) {
            nodesToDeepSearch.push(a.ref.$.id);
          } else {
            annots.push(node);
          }
        }
      }

      // 'Action' type nodes have targetURLs, but don't include bbox data, so they are ignored.
      if (nodeIs(node, 'Type', 'Action')) {
        foundNodeType = true;
      }

      if (
        nodesToDeepSearch.includes(node.$.id) &&
        !foundNodeType &&
        !hasNestedKeys(node, ['dict', 'value'])
      ) {
        linkNodes.push(node);
      }
    });

    xmlStream.on('error', message => {
      reject(message);
    });

    xmlStream.on('end', () => {
      pagesInfo = pagesInfo.filter(p => Object.keys(pagesWithAnnots).includes(p));
      const links: DumpPdfLink[] = annots.map(xmlNodeToLink).filter(l => !!l);
      const linksData = Object.keys(pagesWithAnnots)
        .map(nodeId => {
          return {
            pageNumber: pagesInfo.findIndex(p => p === nodeId),
            links: pagesWithAnnots[nodeId]
              .map(matchLinks(links, linkNodes.map(xmlToLinkingNode)))
              .reduce((acc, array) => acc.concat(...array), []),
          };
        })
        .filter(p => p.links.length > 0);

      resolve(linksData);
    });
  });
}

/*
  this looks that a particular nested structure defined in @param keys exists on @param node.
  ex:
    hasNestedKeys({ foo: { bar: { baz: 10 } } }, ['foo', 'bar', 'baz']) === true, structure "node.foo.bar.baz" is valid
    hasNestedKeys({ foo: { bar: { baz: 10 } } }, ['foo', 'baz']) === false, structure "node.foo.baz" is not valid
*/
function hasNestedKeys(node: any, keys: string[]): boolean {
  let search = Object.assign({}, node);
  return keys.every(k => {
    if ({}.hasOwnProperty.call(search, k)) {
      search = search[k];
      return true;
    }
    return false;
  });
}

function nodeIs(node: any, type: string, value: string): boolean {
  if (hasNestedKeys(node, ['dict', 'key']) && hasNestedKeys(node, ['dict', 'value'])) {
    const objType = node.dict.value[node.dict.key.findIndex(k => k === type)];
    if (objType && hasNestedKeys(objType, ['literal']) && objType.literal === value) {
      return true;
    }
  }
  return false;
}

function xmlNodeToLink(node: any): DumpPdfLink {
  const rect = node.dict.value[node.dict.key.findIndex(k => k === 'Rect')];
  if (!rect || !hasNestedKeys(rect, ['list', 'number'])) {
    return null;
  }
  const [x1, y1, x2, y2] = node.dict.value[
    node.dict.key.findIndex(k => k === 'Rect')
  ].list.number.map(x => parseInt(x, 10));
  const annotInfo = node.dict.value[node.dict.key.findIndex(k => k === 'A')];
  if (annotInfo) {
    if (hasNestedKeys(annotInfo, ['dict', 'key']) && hasNestedKeys(annotInfo, ['dict', 'value'])) {
      const type = annotInfo.dict.value[annotInfo.dict.key.findIndex(k => k === 'S')].literal;
      const target =
        annotInfo.dict.value[
          annotInfo.dict.key.findIndex(k => k === (type === 'URI' ? 'URI' : 'D'))
        ];
      if (!target || !hasNestedKeys(target, ['string', '$text'])) {
        return null;
      }
      return {
        nodeId: node.$.id,
        anchor: {
          target: target.string.$text,
          type,
        },
        box: {
          height: y2 - y1,
          left: x1,
          top: y2,
          width: x2 - x1,
        },
      };
    }
  } else {
    const dest = node.dict.value[node.dict.key.findIndex(k => k === 'Dest')];
    if (dest && dest.literal) {
      return {
        nodeId: node.$.id,
        anchor: {
          target: dest.literal,
          type: 'GoTo',
        },
        box: {
          height: y2 - y1,
          left: x1,
          top: y2,
          width: x2 - x1,
        },
      };
    }
  }
  return null;
}

function xmlToLinkingNode(node: any): DumpPdfLinkingNode {
  return {
    nodeId: node.$.id,
    children: node.list.ref.map(r => r.$.id),
  };
}

function matchLinks(
  links: DumpPdfLink[],
  linkingNodes: DumpPdfLinkingNode[],
): (nodeId) => DumpPdfLink[] {
  return (nodeId: string): DumpPdfLink[] => {
    const linkingNode = linkingNodes.find(n => n.nodeId === nodeId);
    if (linkingNode) {
      return links.filter(l => linkingNode.children.includes(l.nodeId));
    }
    return links.filter(l => l.nodeId === nodeId);
  };
}
