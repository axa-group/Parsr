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

import { readdirSync } from 'fs';
import { Document, Image } from '../../../types/DocumentRepresentation';
import logger from '../../../utils/Logger';
import * as DumpPdf from './DumpPdfParsr';
import { ImageExtractor } from './ImageExtractor';

export class PdfminerImageExtractor extends ImageExtractor {
  private linkedDumpPdfImages: number = 0;
  private missedDumpPdfImages: number = 0;
  private mutoolMissedImages: number = 0;
  private extractorDetectedImages: number = 0;

  public run(doc: Document): Promise<void> {
    if (!doc.assetsFolder) {
      logger.warn('MuPDF not installed !! Skip image detection.');
      return Promise.resolve();
    }

    this.extractorDetectedImages = this.totalDocumentImages(doc);
    if (this.extractorDetectedImages === 0) {
      logger.info('No images detected !! Skip image extraction.');
      return Promise.resolve();
    }

    return this.extractImages(doc);
  }

  private async extractImages(doc: Document): Promise<void> {
    const dumpPdfData = await DumpPdf.getFileMetadata(doc.inputFile);
    if (dumpPdfData != null) {
      const assets: string[] = readdirSync(doc.assetsFolder);
      const pageIds = DumpPdf.extractPageNodeIds(dumpPdfData);
      const srcFile: string = doc.assetsFolder;
      doc.pages.forEach((page, index) => {
        const images = page.getElementsOfType(Image, true);
        images.forEach(img => (img.enabled = true));
        if (images.length > 0) {
          this.linkImages(images, pageIds[index], dumpPdfData, index);
          this.linkXObjectWithExtensions(images, assets, index, pageIds[index]);
          this.linkSrcImages(images, assets, srcFile);
        }
      });

      logger.info(
        `Images Detected ${this.extractorDetectedImages} Reconstructed ${this.linkedDumpPdfImages -
          this.mutoolMissedImages -
          this.missedDumpPdfImages} Mutool missed ${this.mutoolMissedImages} DumpPDF missed ${
          this.missedDumpPdfImages
        }`,
      );
    }
  }

  private linkImages(images: Image[], pageNodeId: string, data: string, pageIndex: number) {
    let rootNode = DumpPdf.getNode(pageNodeId, data);
    const resourcesNodeId = DumpPdf.getResourceId(rootNode);
    if (resourcesNodeId != null) {
      pageNodeId = resourcesNodeId;
      rootNode = DumpPdf.getNode(resourcesNodeId, data);
    }
    images.forEach(img => {
      const imgRefId = DumpPdf.getImageRefId(img.refId, rootNode, data);
      if (imgRefId != null) {
        img.xObjId = imgRefId;
        this.linkedDumpPdfImages = this.linkedDumpPdfImages + 1;
      } else {
        this.missedDumpPdfImages = this.missedDumpPdfImages + 1;
        logger.warn(`Page ${pageIndex + 1} Xml node missed for image Id ${img.refId}`);
      }
    });
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
            `Page ${pageIndex + 1} (nodeId ${pageNodeId}) image ${
              img.refId
            } no extension found for file ${img.xObjId}`,
          );
        }
      });
  }

  private linkSrcImages(images: Image[], assets: string[], srcFile: string) {
    images
      .filter(img => !!img.xObjId)
      .forEach(img => {
        const asset = assets.filter(filename => {
          return filename.startsWith('img-' + img.xObjId.padStart(4, '0'));
        });
        if (asset.length === 1) {
          img.src = srcFile + '/' + asset[0];
        }
      });
  }

  private totalDocumentImages(doc: Document): number {
    return doc.getElementsOfType(Image, true).length;
  }
}
