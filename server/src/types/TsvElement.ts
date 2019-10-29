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

// tslint:disable: variable-name

export class TsvElement {
	public level: number;
	public page_num: number;
	public block_num: number;
	public par_num: number;
	public line_num: number;
	public word_num: number;
	public left: number;
	public top: number;
	public width: number;
	public height: number;
	public conf: number;
	public text: string;

	constructor(obj: any) {
		this.level = parseFloat(obj.level);
		this.page_num = parseFloat(obj.page_num);
		this.block_num = parseFloat(obj.block_num);
		this.par_num = parseFloat(obj.par_num);
		this.line_num = parseFloat(obj.line_num);
		this.word_num = parseFloat(obj.word_num);
		this.left = parseFloat(obj.left);
		this.top = parseFloat(obj.top);
		this.width = parseFloat(obj.width);
		this.height = parseFloat(obj.height);
		this.conf = parseFloat(obj.conf);
		this.text = obj.text.toString();
	}
}
