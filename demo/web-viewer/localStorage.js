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

const fs = require('fs');

// local storage FTW
let LOCAL_STORAGE = {};
let STORAGE_NAME = '';

let from = name => {
	STORAGE_NAME = name;
	if (fs.existsSync(name)) {
		JSON.parse(fs.readFileSync(name));
	}
	return LOCAL_STORAGE;
};

let DATA = {
	from: from,
	storage: LOCAL_STORAGE,
	autoSave: false,
	autoSaveCadence: 10000,
};

let save = () => {
	if (STORAGE_NAME) {
		fs.writeFile(STORAGE_NAME, JSON.stringify(LOCAL_STORAGE), 'utf8', err => {
			if (err) {
				console.log('STORAGE ERROR : ', err);
			}
		});
	}
};

let cadenceSave = () => {
	if (DATA.autoSave) {
		save();
	}
	setTimeout(cadenceSave, DATA.autoSaveCadence);
};

DATA.save = save;

module.exports = DATA;
