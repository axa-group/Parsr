/**
 * Copyright 2019 AXA
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

import axios, { AxiosResponse } from 'axios';
import { JsonExporter } from '../../output/json/JsonExporter';
import { Document, JsonExport } from '../../types/DocumentRepresentation';
import { json2document } from '../../utils/json2document';
import { Module } from '../Module';
import * as defaultConfig from './defaultConfig.json';

interface Options {
	url?: string;
	granularity?: string;
}

const defaultOptions = (defaultConfig as any) as Options;

export class RemoteModule extends Module<Options> {
	public static moduleName = 'remote';

	constructor(options: Options) {
		super(options, defaultOptions);
	}

	public main(doc: Document): Promise<Document> {
		const jsonExporter = new JsonExporter(doc, this.options.granularity);
		const json: JsonExport = jsonExporter.getJson();

		return axios({
			method: 'POST',
			url: this.options.url,
			data: json,
			timeout: 0x7ffffff,
		}).then((response: AxiosResponse<JsonExport>) => {
			return json2document(response.data);
		});
	}
}
