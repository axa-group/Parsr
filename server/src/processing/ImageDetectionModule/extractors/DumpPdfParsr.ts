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

import * as fs from 'fs';
import * as CommandExecuter from '../../../utils/CommandExecuter';

export function getFileMetadata(pdfFilePath: string): Promise<any> {
  return new Promise(resolve => {
    CommandExecuter.dumpPdf(pdfFilePath)
      .then(xmlOutputPath => {
        resolve(fs.readFileSync(xmlOutputPath, 'utf8'));
      })
      .catch(() => {
        resolve();
      });
  });
}

export function extractPageNodeIds(data: string) {
  const rootPageObjId = data.match('<key>Pages</key>\r?\n<value><ref id="(\\d+)" /></value>')[1];
  const rootPagesNode = getNode(rootPageObjId, data);
  const pageNodes = getPageNodes(rootPagesNode, data);
  return getElementIds(pageNodes);
}

export function getImageRefId(imageRefId: string, nodeData: string, data: string): string {
  const figuresId = imageRefId.split('.');
  let refId = null;
  figuresId.forEach((figId, index) => {
    const regepx = '<key>' + figId + '</key>\r?\n<value><ref id="(\\d+)" /></value>';
    const imgObj = nodeData.match(new RegExp(regepx, 'g'));
    if (refId == null && imgObj != null && imgObj.length === 1) {
      refId = imgObj[0].match(new RegExp(regepx))[1];
    }
    if (index + 1 < figuresId.length) {
      // imageRefId can be like --> Fig1.Fig2.Fig2.Im0
      // then we need to find resource id of node with id = refId (if it exists)
      // and recursively call again this method
      let childNode = getNode(refId, data);
      const resourceNodeId = getResourceId(childNode);
      if (resourceNodeId) {
        childNode = getNode(resourceNodeId, data);
      }
      refId = getImageRefId(figuresId[index + 1], childNode, data);
    } else if (refId == null) {
      // There are cases where no node ref exists like <key>figId</key> because
      // ref id is contained inside XObject node
      const xObjectId = getXObjectId(nodeData);
      if (xObjectId) {
        refId = getImageRefId(figuresId[index], getNode(xObjectId, data), data);
      }
    }
  });
  return refId;
}

export function getNode(id: string, data: string): string {
  const regepx = '<object id="' + id + '">(.*?)</object>';
  return data.match(new RegExp(regepx, 's'))[1];
}

export function getPageNodes(nodeData: string, data: string): string {
  const countRegexp = '<key>Count</key>\r?\n<value><number>(\\d+)</number></value>';
  const count = nodeData.match(new RegExp(countRegexp, 's'))[1];
  const listRegepx = '<key>Kids</key>\r?\n<value><list size="\\d+">(.*?)</list></value>';
  const nodeList = nodeData.match(new RegExp(listRegepx, 's'))[1];
  if (parseInt(count, 10) === getElementIds(nodeList).length) {
    return nodeList;
  }
  return getElementIds(nodeList)
    .map(nodeId => getNode(nodeId, data))
    .map(node => getPageNodes(node, data))
    .join('');
}

export function getElementIds(data: string): string[] {
  const regepx = '<ref id="(\\d+)" />';
  return data.match(new RegExp(regepx, 'g')).map(matching => matching.match(new RegExp(regepx))[1]);
}

export function getResourceId(data: string): string {
  const regepx = '<key>Resources</key>\r?\n<value><ref id="(\\d+)" /></value>';
  const resource = data.match(new RegExp(regepx));
  return resource != null ? resource[1] : null;
}

export function getXObjectId(data: string): string {
  const regepx = '<key>XObject</key>\r?\n<value><ref id="(\\d+)" /></value>';
  const resource = data.match(new RegExp(regepx));
  return resource != null ? resource[1] : null;
}
