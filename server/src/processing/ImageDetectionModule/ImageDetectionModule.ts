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
import * as filetype from 'file-type';
import * as fs from 'fs';
import { Document, Image } from '../../types/DocumentRepresentation';
import * as utils from '../../utils';
import * as CommandExecuter from '../../utils/CommandExecuter';
import logger from '../../utils/Logger';
import { Module } from '../Module';

export class ImageDetectionModule extends Module {
  public static moduleName = 'image-detection';
  private extractorDetectedImages: number = 0;
  private linkedDumpPdfImages: number = 0;
  private missedDumpPdfImages: number = 0;
  private mutoolMissedImages: number = 0;

  public async main(doc: Document): Promise<Document> {
    const fileType: { ext: string; mime: string } = filetype(fs.readFileSync(doc.inputFile));
    if (fileType === null || fileType.ext !== 'pdf') {
      logger.warn(
        `Warning: Input file ${doc.inputFile} is not a PDF (${utils.prettifyObject(fileType)}); \
        not using meta info for image detection..`,
      );
      return doc;
    }

    if (!doc.assetsFolder) {
      logger.warn('MuPDF not installed !! Skip image detection.');
      return doc;
    }
    this.extractorDetectedImages = this.totalDocumentImages(doc);
    if (this.extractorDetectedImages === 0) {
      logger.info('No images detected !! Skip image detection.');
      return doc;
    }

    const dumpPdfData = await this.getFileMetadata(doc.inputFile);
    if (dumpPdfData != null) {
      const assets: string[] = fs.readdirSync(doc.assetsFolder);
      const pageIds = this.extractPageNodeIds(dumpPdfData);
      doc.pages.forEach((page, index) => {
        const images = page.getElementsOfType(Image, true);
        images.forEach(img => (img.enabled = true));
        if (images.length > 0) {
          this.linkImages(images, pageIds[index], dumpPdfData, index);
          this.linkXObjectWithExtensions(images, assets, index, pageIds[index]);
        }
      });
      logger.info(
        'Images Detected ' +
          this.extractorDetectedImages +
          ' Reconstructed ' +
          (this.linkedDumpPdfImages - this.mutoolMissedImages - this.missedDumpPdfImages) +
          ' Mutool missed ' +
          this.mutoolMissedImages +
          ' DumpPDF missed ' +
          this.missedDumpPdfImages,
      );
    }

    return doc;
  }

  private linkXObjectWithExtensions(
    images: Image[],
    assets: string[],
    pageIndex: number,
    pageNodeId: string,
  ) {
    images
      .filter(img => !!img.xObjId)
      .forEach(img => {
        const asset = assets.filter(filename => {
          return filename.startsWith('img-' + img.xObjId.padStart(4, '0'));
        });
        if (asset.length === 1) {
          img.xObjExt = asset[0].split('.').pop();
        } else {
          this.mutoolMissedImages++;
          logger.warn(
            'Page ' +
              (pageIndex + 1).toString() +
              ' (nodeId ' +
              pageNodeId +
              ') image ' +
              img.refId +
              ' no extension found for file ' +
              img.xObjId,
          );
        }
      });
  }

  private linkImages(images: Image[], pageNodeId: string, data: string, pageIndex: number) {
    let rootNode = this.getNode(pageNodeId, data);
    const resourcesNodeId = this.getResourceId(rootNode);
    if (resourcesNodeId != null) {
      pageNodeId = resourcesNodeId;
      rootNode = this.getNode(resourcesNodeId, data);
    }
    images.forEach(img => {
      const imgRefId = this.getImageRefId(img.refId, rootNode, data);
      if (imgRefId != null) {
        img.xObjId = imgRefId;
        this.linkedDumpPdfImages = this.linkedDumpPdfImages + 1;
      } else {
        this.missedDumpPdfImages = this.missedDumpPdfImages + 1;
        logger.warn(
          'Page ' + (pageIndex + 1).toString() + ' Xml node missed for image Id ' + img.refId,
        );
      }
    });
  }

  private getImageRefId(imageRefId: string, nodeData: string, data: string): string {
    const figuresId = imageRefId.split('.');
    let refId = null;
    figuresId.forEach((figId, index) => {
      const regepx = '<key>' + figId + '</key>\n<value><ref id="(\\d+)" /></value>';
      const imgObj = nodeData.match(new RegExp(regepx, 'g'));
      if (refId == null && imgObj != null && imgObj.length === 1) {
        refId = imgObj[0].match(new RegExp(regepx))[1];
      }
      if (index + 1 < figuresId.length) {
        // imageRefId can be like --> Fig1.Fig2.Fig2.Im0
        // then we need to find resource id of node with id = refId (if it exists)
        // and recursively call again this method
        let childNode = this.getNode(refId, data);
        const resourceNodeId = this.getResourceId(childNode);
        if (resourceNodeId) {
          childNode = this.getNode(resourceNodeId, data);
        }
        refId = this.getImageRefId(figuresId[index + 1], childNode, data);
      } else if (refId == null) {
        // There are cases where no node ref exists like <key>figId</key> bec
        const xObjectId = this.getXObjectId(nodeData);
        if (xObjectId) {
          refId = this.getImageRefId(figuresId[index], this.getNode(xObjectId, data), data);
        }
      }
    });
    return refId;
  }

  private extractPageNodeIds(data: string) {
    const rootPageObjId = data.match('<key>Pages</key>\n<value><ref id="(\\d+)" /></value>')[1];
    const rootPagesNode = this.getNode(rootPageObjId, data);
    const pageNodes = this.getPageNodes(rootPagesNode, data);
    return this.getElementIds(pageNodes);
  }

  private getNode(id: string, data: string): string {
    const regepx = '<object id="' + id + '">(.*?)</object>';
    return data.match(new RegExp(regepx, 's'))[1];
  }

  private getPageNodes(nodeData: string, data: string): string {
    const countRegexp = '<key>Count</key>\n<value><number>(\\d+)</number></value>';
    const count = nodeData.match(new RegExp(countRegexp, 's'))[1];
    const listRegepx = '<key>Kids</key>\n<value><list size="\\d+">(.*?)</list></value>';
    const nodeList = nodeData.match(new RegExp(listRegepx, 's'))[1];
    if (parseInt(count, 10) === this.getElementIds(nodeList).length) {
      return nodeList;
    } else {
      return this.getElementIds(nodeList)
        .map(nodeId => this.getNode(nodeId, data))
        .map(node => this.getPageNodes(node, data))
        .join('');
    }
  }

  private getElementIds(data: string): string[] {
    const regepx = '<ref id="(\\d+)" />';
    return data
      .match(new RegExp(regepx, 'g'))
      .map(matching => matching.match(new RegExp(regepx))[1]);
  }

  private getResourceId(data: string): string {
    const regepx = '<key>Resources</key>\n<value><ref id="(\\d+)" /></value>';
    const resource = data.match(new RegExp(regepx));
    return resource != null ? resource[1] : null;
  }

  private getXObjectId(data: string): string {
    const regepx = '<key>XObject</key>\n<value><ref id="(\\d+)" /></value>';
    const resource = data.match(new RegExp(regepx));
    return resource != null ? resource[1] : null;
  }

  private getFileMetadata(pdfFilePath: string): Promise<any> {
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

  private totalDocumentImages(doc: Document): number {
    return doc.getElementsOfType(Image, true).length;
  }
}
