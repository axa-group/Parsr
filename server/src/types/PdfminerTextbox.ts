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

import { PdfminerTextline } from './PdfminerTextline';

export class PdfminerTextbox {
	public _attr: {
		id: string;
		bbox: string;
	};
	public textline: PdfminerTextline[];

	constructor(textbox: PdfminerTextbox) {
		this._attr = textbox._attr;
		this.textline = textbox.textline;
	}
}
