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

import setFont from './setFont';

const ignoredOps = [];

const availableOperators = [
  setFont,
  ...ignoredOps.map(key => ({ key, value: (_args) => null })),
];

export function isAvailable(operatorName: string): boolean {
  return availableOperators.map(op => op.key).includes(operatorName);
}

export function getOperator(operatorName: string): (...args) => any {
  return availableOperators.find(op => op.key === operatorName).value;
}
