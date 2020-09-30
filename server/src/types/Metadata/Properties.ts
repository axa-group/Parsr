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

export interface Properties {
  titleScores?: {
    size: number;
    wordHeight: number;
    weight: number;
    color: number;
    name: number;
    italic: number;
    underline: number;
    capitalCase: number;
    titleCase: number;
  };
  writeMode?: string;
  isRedundant?: boolean;
  isHeader?: boolean;
  isFooter?: boolean;
  isPageNumber?: boolean;
  bulletList?: boolean;
  order?: number;
  // column right
  cr?: number;
  // column left
  cl?: number;
  targetURL?: string;
  splittedLink?: boolean;
  srcImage?: string;
}
