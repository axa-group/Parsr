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

fetch('/json')
	.then(response => response.json())
	.then(files => updateFolder(files));

let renderer = new Renderer('#render');

let file = undefined;
const spinnerTag = document.querySelector('#rendering-spinner');
const folderTag = document.querySelector('#folder');

if (document.location.search) {
	file = document.location.search.substring(1).match(/file=([^&]*)/)[1];
	spinnerTag.classList.add('is-active');
	folderTag.style.display = 'none';

	renderer
		.loadPdf(file)
		.then(pdf => {
			renderer.render(pdf);
			spinnerTag.classList.remove('is-active');
		})
		.catch(err => {
			folderTag.style.display = 'block';
			spinnerTag.classList.remove('is-active');
			console.error(err);
		});
}

window.addEventListener('resize', () => {
	renderer.rescale();
});

function updateFolder(files) {
	let folder = folderTag;
	let str = '';
	str += '<h3>Folder</h3>';
	str += '<p>';
	str += files
		.map(fileName => {
			return `<a href="viewer.html?file=${fileName}">${fileName}</a><br>`;
		})
		.join('\n');
	str += '</p>';
	folder.innerHTML = str;
}
