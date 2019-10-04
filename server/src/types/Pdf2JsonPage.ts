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

import { Pdf2JsonFont } from './Pdf2JsonFont';
import { Pdf2JsonText } from './Pdf2JsonText';

export class Pdf2JsonPage {
	public fonts: Pdf2JsonFont[];
	public number: number;
	public pages: number;
	public height: number;
	public width: number;
	public text: Pdf2JsonText[];

	constructor(page: Pdf2JsonPage) {
		this.fonts = page.fonts;
		this.number = page.number;
		this.pages = page.pages;
		this.height = page.height;
		this.width = page.width;
		this.text = page.text;
	}
}
