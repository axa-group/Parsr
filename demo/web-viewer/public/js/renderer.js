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

class Renderer {
	constructor(target) {
		this.target = document.querySelector(target);
		this.properties = [];
	}

	loadPdf(filename) {
		return fetch('/json/' + encodeURIComponent(filename))
			.then(response => {
				if (!response.ok) {
					throw new Error(`${response.status}`);
				} else {
					return response;
				}
			})
			.then(response => response.json());
	}

	textToString(text) {
		if (!text.content) {
			return '';
		}
		if (typeof text.content === 'string') {
			return text.content;
		}
		return text.content.reduce((a, b, index, arr) => {
			return { content: this.textToString(a) + ' ' + this.textToString(b) };
		}, '').content;
	}

	rescale() {
		const maxPossibleWidth = 1000;
		let maxWidth = 0;

		for (let page of document.querySelectorAll('.page')) {
			maxWidth = Math.max(page.offsetWidth, maxWidth);
		}

		const bodyWidth = document.querySelector('body').offsetWidth;

		if (bodyWidth < maxWidth || maxWidth > maxPossibleWidth) {
			let scale = Math.min(bodyWidth / maxWidth, maxPossibleWidth / maxWidth);
			document.querySelector('#render').style.transform = `scale(${scale}) translate(-50%)`;
			this.target.style.height = this.currentHeight * scale + 'pt';
		} else {
			document.querySelector('#render').style.transform = `scale(1) translate(-50%)`;
			this.target.style.height = this.currentHeight + 'pt';
		}
	}

	render(pdf) {
		this.pdf = pdf;
		this.styleDico = {};
		this.currentHeight = 0;
		this.metadata = [];
		console.log('pdf', pdf);
		//console.log('Fonts', this.pdf.fonts);
		// this.createStyleDico(this.pdf.fontCatalog);

		pdf.metadata.forEach(m => {
			this.metadata[m.id] = m;
		});

		for (let i = 0; i < this.pdf.pages.length; ++i) {
			console.log('rendering page', i + 1);

			let page = this.pdf.pages[i];

			let pageDiv = document.createElement('div');
			pageDiv.classList.add('page');
			pageDiv.style.height = page.box.h + 'pt';
			pageDiv.style.width = page.box.w + 'pt';
			pageDiv.title = `Page ${i + 1} / ${this.pdf.pages.length}`;
			this.target.appendChild(pageDiv);
			this.renderPage(page, pageDiv, this.pdf.fonts);
			this.currentHeight += page.box.h;
		}

		this.target.style.height = this.currentHeight + 'pt';

		this.rescale();
	}

	addFont(fontname, filename) {
		let newStyle = document.createElement('style');
		newStyle.appendChild(
			document.createTextNode(
				`@font-face {\
                font-family: '${fontname}';\
                src: url('/mutool-extraction/${filename}');\
            }`,
			)
		);
		document.head.appendChild(newStyle);
	}

	// TODO Handle other format than TrueType
	createStyleDico(fontCatalog) {
		for (let i = 0; i < fontCatalog.length; ++i) {
			this.addFont(fontCatalog[i].family, fontCatalog[i].family + '.ttf');
			let font = fontCatalog[i];
			this.styleDico[font.fontspec] = {
				font: `${font.style} ${font.weight} ${font.size}px ${font.family}`,
				// color: font.color
			};
		}
	}

	renderPage(page, target, fonts) {
		if (page.locale) {
			let div = document.createElement('div');
			div.innerText = page.localeCode;
			div.style.position = 'absolute';
			div.style.top = '0px';
			div.style.right = '-50px';
			div.className = 'locale-box';
			target.appendChild(div);
		}
		if (page.tables) {
			for (let i = 0; i < page.tables.length; i++) {
				let table = page.tables[i];
				let div = document.createElement('div');
				div.style.position = 'absolute';
				div.style.top = table.top + 'pt';
				div.style.left = table.left + 'pt';
				div.style.width = table.width + 'pt';
				div.style.height = table.height + 'pt';
				div.className = 'table-box';
				target.appendChild(div);
			}
		}

		for (let i = 0; i < page.elements.length; i++) {
			this.renderElement(page.elements[i], target, 0, 0, 0, 1, fonts);
		}
	}

	renderElement(element, parent, leftRef, topRef, depth, ratio, fonts) {
		let e = element;
		e.metadata = e.metadata.map(id => this.metadata[id]);

		if (typeof e.box === 'undefined') {
			for (let i = 0; i < e.content.length; i++) {
				this.renderElement(
					e.content[i],
					parent,
					parseFloat(parent.style.left) + leftRef,
					parseFloat(parent.style.top) + topRef,
					depth + 1,
					fonts
				);
			}

			return;
		}

		// FIXME Remove me once Abbyy told us what's going on with the table ratios.
		//        if (e.type === 'table') {
		//            let ratio = 1;
		//            let W = e.content[0].box.w;
		//
		//            if (e.box.w < W) {
		//                ratio = e.box.w / W;
		//            }
		//
		//            e.box.w *= ratio;
		//            e.box.h *= ratio;
		//
		//            let topAcc = 0;
		//            for (let i = 0; i < e.content.length; i++) {
		//                let row = e.content[i];
		//                row.box.w *= ratio;
		//                row.box.h *= ratio;
		//                row.box.t -= topAcc;
		//
		//                topAcc += row.box.h;
		//
		//                let leftAcc = 0;
		//                for (let i = 0; i < row.content.length; i++) {
		//                    let cell = row.content[i];
		//                    cell.box.t = row.box.t;
		//                    cell.box.w *= ratio;
		//                    cell.box.h *= ratio;
		//                    cell.box.l -= leftAcc;
		//
		//                    leftAcc += cell.box.w;
		//                }
		//            }
		//        }

		// Wrap character in wrapper div
		if (e.type === 'character') {
			let wrapper = document.createElement('div');

			wrapper.style.position = 'absolute';
			wrapper.style.left = e.box.l - leftRef + 'pt';
			leftRef = e.box.l;
			wrapper.style.top = 0;
			wrapper.style.width = e.box.w + 'pt';
			wrapper.style.height = '100%';
			wrapper.style.zIndex = 100 + depth;
			wrapper.classList.add(`wrapper-${e.type}`);
			wrapper.innerText = e.content;
			e.content = '';

			parent.appendChild(wrapper);
			parent = wrapper;
		}

		let div = document.createElement('div');

		div.style.position = 'absolute';
		div.style.left = e.box.l - leftRef + 'pt';
		div.style.top = e.box.t - topRef + 'pt';
		div.style.width = e.box.w + 'pt';
		div.style.height = e.box.h + 'pt';
		div.style.zIndex = 100 + depth;

		if (e.type !== 'character' && e.font) {			
			let font = fonts.filter(font => font.id === e.font)[0];			
			if(font) {
				if(font.scaling) {
					//ABBYY	
					div.style.fontSize = (font.size * (font.scaling/1000)) + 'em';
				} else if (font.name === "undefined") {
					//tesseract	
					div.style.fontSize = e.box.h * 0.85 + 'pt';
				} else {
					//pdf2json		
					let adjustedFontSize = parseInt(font.size) * 0.95;
					div.style.fontSize = adjustedFontSize + 'px';
				}							
			}			
		}

		div.classList.add(`element-${e.type}`);

		div.setAttribute('data-id', e.id);
		div.setAttribute('data-box-l', e.box.l);
		div.setAttribute('data-box-t', e.box.t);
		div.setAttribute('data-box-w', e.box.w);
		div.setAttribute('data-box-h', e.box.h);

		if (e.colspan) {
			div.setAttribute('data-colspan', e.colspan);
		}

		if (e.rowspan) {
			div.setAttribute('data-rowspan', e.rowspan);
		}

		if (
			typeof e.properties !== 'undefined' &&
			typeof e.properties.order !== 'undefined'
		) {
			//div.style.backgroundColor = `rgb(${240-e.properties.order/4}, ${240-e.properties.order/2}, 255)`;
		}

		if (typeof e.content === 'string') {
			let textWrapper = document.createElement('span');
			textWrapper.innerText = e.content;
			div.appendChild(textWrapper);
			div.setAttribute('data-text', e.content);
			div.title =
				(JSON.stringify(e.content).length > 40 ? '...' : e.content) +
				'\n\n' +
				(e.properties ? JSON.stringify(e.properties) : 'no properties') +
				'\n\n' +
				(e.metadata && e.metadata.length > 0 ? JSON.stringify(e.metadata) : 'no metadata');
			if (e.metadata && e.metadata.length > 0) {
				div.style.backgroundColor = "red";
			}
		} else if (Array.isArray(e.content)) {
			for (let i = 0; i < e.content.length; i++) {
				this.renderElement(
					e.content[i],
					div,
					parseFloat(div.style.left) + leftRef,
					parseFloat(div.style.top) + topRef,
					depth + 1,
					ratio,
					fonts
				);
			}
		} else {
			console.warn('Attribute content of', e, 'should not be empty');
		}

		parent.appendChild(div);

		// let ner = renderNer(e.content, e.properties);

		// div.innerText = ner.replace(/\n/g, '<br>');
		// div.style.font = this.styleDico[e.font].font;
		// div.style.color = this.styleDico[e.font].color;

		// div.className = 'textItem ' + Array.from(e.properties, ([k, v]) => k).map((t) => 'tag-' + t).join(' ');
	}
}

if (!String.prototype.splice) {
	/**
	 * {JSDoc}
	 *
	 * The splice() method changes the content of a string by removing a range of
	 * characters and/or adding new characters.
	 *
	 * @this {String}
	 * @param {number} start Index at which to start changing the string.
	 * @param {number} delCount An integer indicating the number of old chars to remove.
	 * @param {string} newSubStr The String that is spliced in.
	 * @return {string} A new string with the spliced substring.
	 */
	String.prototype.splice = function(start, delCount, newSubStr) {
		return this.slice(0, start) + newSubStr + this.slice(start + Math.abs(delCount));
	};
}

function renderNer(text, properties) {
	let indexMax = -1;
	let cumul = 0;
	for (let i = 0; i < properties.length; ++i) {
		if (properties[i][0].indexOf('label') == 0) {
			let data = properties[i][1];
			//["duration", "time"].indexOf(data.dim) != -1
			if (
				['number', 'phone-number', 'url', 'temperature'].indexOf(data.dim) == -1 &&
				data.start > indexMax
			) {
				let template =
					"<span class='nerDimension ner" +
					data.dim +
					"' title='" +
					data.dim +
					"'>" +
					data.body +
					'</span>';

				text = text.splice(cumul + data.start, cumul + data.end - data.start, template);

				cumul += template.length;
				indexMax = data.end + cumul;
			}
		}
	}

	return text;
}
