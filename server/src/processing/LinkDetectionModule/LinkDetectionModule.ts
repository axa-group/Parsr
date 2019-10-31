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

import { Document, Page, Word } from '../../types/DocumentRepresentation';
import logger from '../../utils/Logger';
import { Module } from '../Module';

// TODO Test on other types of links (actionGoToR, actionLaunch, etc.)
//      Maybe HTML isn't the right format to use.
//      Putting all of this as metadata/property may be a better solution.
/**
 * Stability: Experimental
 * Convert PDF links to HTML links
 */

export class LinkDetectionModule extends Module {
  public static moduleName = 'link-detection';

  public main(doc: Document): Document {
    // actionURI(http://www.axa.com):www.axa.com
    const actionUriRegex = /(.*)actionURI\((.*)\):(.*)/;
    // actionGoTo:7,In Real Life
    const actionGoToRegex = /(.*)actionGoTo:(\d+),(.*)/;
    // Ref: http://www.cs.cmu.edu/~lemur/doxygen/lemur-3.1/html/Link_8h.html
    const actionRegex = /(.*)(actionGoToR|actionLaunch|actionNamed|actionMovie|actionUnknown)(.*)/;

    doc.pages.forEach((page: Page) => {
      page.getElementsOfType<Word>(Word, true).forEach(word => {
        if (typeof word.content !== 'string') {
          this.matchLinksInCharacters(word);
          return;
        }
        let match = [];
        // tslint:disable-next-line:no-conditional-assignment
        if ((match = word.content.match(actionUriRegex))) {
          // word.content = `${match[1]}<a href="${match[2]}">${match[3]}</a>`;
          word.content = match[3];
          word.properties.link = `${match[1]}<a href="${match[2]}">${match[3]}</a>`;
          // tslint:disable-next-line:no-conditional-assignment
        } else if ((match = word.content.match(actionGoToRegex))) {
          word.content = match[3];
          word.properties.link = match[1] + match[3];
          // tslint:disable-next-line:no-conditional-assignment
        } else if ((match = word.content.match(actionRegex))) {
          logger.debug('Unknown action: %s', word.content);
        }
      });
    });

    return doc;
  }

  private matchLinksInCharacters(word: Word) {
    const linkRegexp = /\b((http|https):\/\/?)[^\s()<>]+(?:\([\w\d]+\)|([^[:punct:]\s]|\/?))/;
    const mailRegexp = /^(("[\w-\s]+")|([\w-]+(?:\.[\w-]+)*)|("[\w-\s]+")([\w-]+(?:\.[\w-]+)*))(@((?:[\w-]+\.)*\w[\w-]{0,66})\.([a-z]{2,6}(?:\.[a-z]{2})?)$)|(@\[?((25[0-5]\.|2[0-4][0-9]\.|1[0-9]{2}\.|[0-9]{1,2}\.))((25[0-5]|2[0-4][0-9]|1[0-9]{2}|[0-9]{1,2})\.){2}(25[0-5]|2[0-4][0-9]|1[0-9]{2}|[0-9]{1,2})\]?$)/;
    if (word.toString().match(linkRegexp)) {
      word.properties.link = `<a href="${word.toString()}">${word.toString()}</a>`;
    } else if (word.toString().match(mailRegexp)) {
      word.properties.link = `<a href="mailto:${word.toString()}">${word.toString()}</a>`;
    }
  }
}
