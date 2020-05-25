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

import logger from './Logger';

export default class CacheLayer {
  public static set(key: string, value: string) {
    logger.info(`Saving response for key: "${key}"`);
    this.simpleMemCache.set(key, value);
  }

  public static get(key: string): string {
    logger.info(`Returning cached data for key: "${key}"`);
    return this.simpleMemCache.get(key);
  }

  public static has(key: string): boolean {
    return this.simpleMemCache.has(key);
  }

  private static simpleMemCache: Map<string, string> = new Map();
}
