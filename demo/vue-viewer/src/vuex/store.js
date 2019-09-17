import Vue from 'vue';
import Vuex from 'vuex';
import DocumentService from '@/services/DocumentServices.js';

Vue.use(Vuex);

export default new Vuex.Store({
	state: {
		selectedPage: 1,
		zoom: 1.0,
		uuid: '75c4bcb6d51e4e60a3f0682f858ffe',
		inputFileName: null,
		document: null,
		inspectorFilters: {},
		selectedElement: null,
		defaultConfig: {
			version: 0.5,
			extractor: {
				pdf: 'pdf2json',
				img: 'tesseract',
				language: ['eng', 'fra'],
			},
			cleaner: [
				'out-of-page-removal',
				[
					'whitespace-removal',
					{
						minWidth: {
							value: 0,
							range: { min: 0, max: 100 },
						},
					},
				],
				[
					'redundancy-detection',
					{
						percentageOfRedundancy: { value: 0.5, range: { min: 0.0, max: 1.0 } },
						minimumPages: { value: 6 },
					},
				],
				[
					'table-detection',
					{
						pages: { value: 'all' },
						flavor: {
							value: 'lattice',
							range: ['lattice', 'stream'],
						},
					},
				],
				[
					'header-footer-detection',
					{
						maxMarginPercentage: {
							value: 15,
							range: {
								min: 0,
								max: 100,
							},
						},
						ignorePages: { value: [] },
					},
				],
				[
					'reading-order-detection',
					{
						minVerticalGapWidth: {
							value: 5,
							range: {
								min: 0,
								max: 100,
							},
						},
						minColumnWidthInPagePercent: {
							value: 5,
							range: {
								min: 0,
								max: 100,
							},
						},
					},
				],
				'link-detection',
				[
					'words-to-line',
					{
						lineHeightUncertainty: {
							value: 0.2,
							range: {
								min: 0.0,
								max: 1.0,
							},
						},
						topUncertainty: {
							value: 0.4,
							range: {
								min: 0.0,
								max: 1.0,
							},
						},
						maximumSpaceBetweenWords: {
							value: 100,
							range: {
								min: 0,
								max: 100,
							},
						},
						mergeTableElements: { value: false, range: [true, false] },
					},
				],
				[
					'lines-to-paragraph',
					{
						addNewline: { value: true, range: [true, false] },
						alignUncertainty: {
							value: 3,
							range: {
								min: 0,
								max: 100,
							},
						},
						checkFont: { value: false, range: [true, false] },
						maxInterline: {
							value: 0.3,
							range: {
								min: 0.0,
								max: 1.0,
							},
						},
						lineLengthUncertainty: {
							value: 0.25,
							range: {
								min: 0.0,
								max: 1.0,
							},
						},
					},
				],
				[
					'page-number-detection',
					{
						maxMarginPercentage: {
							value: 15,
							range: {
								min: 0,
								max: 100,
							},
						},
						ignorePages: { value: [] },
					},
				],
				'heading-detection',
				'hierarchy-detection',
			],
			output: {
				granularity: 'word',
				includeMarginals: false,
				formats: {
					json: true,
					text: true,
					csv: true,
					markdown: true,
					pdf: false,
				},
			},
		},
	},
	mutations: {
		setElementSelected(state, element) {
			state.selectedElement = element !== state.selectedElement ? element : null;
		},
		setInspectorFilters(state, filters) {
			state.inspectorFilters = filters;
		},
		setSelectedPage(state, page) {
			state.selectedPage = page;
		},
		zoomIn(state) {
			state.zoom = Number((state.zoom + 0.2).toFixed(2));
		},
		zoomOut(state) {
			state.zoom = Number((state.zoom - 0.2).toFixed(2));
		},
		fitZoom(state, zoom) {
			state.zoom = zoom;
		},
		setInputFileName(state, name) {
			state.inputFileName = name;
		},
		updateConfig(state, configItem) {
			if (configItem.selected) {
				state.defaultConfig.cleaner.push(configItem.item);
			} else {
				state.defaultConfig.cleaner = state.defaultConfig.cleaner.filter(
					el => el !== configItem.item,
				);
			}
		},
		SET_DOCUMENT(state, document) {
			state.document = document;
		},
		SET_DOCUMENT_ID(state, id) {
			state.uuid = id;
		},
	},
	actions: {
		fetchThumbnail({ commit }, { page }) {
			console.log(commit);
			return DocumentService.getThumbnail(this.state.uuid, page);
		},
		fetchDocument({ commit }) {
			return DocumentService.getDocument(this.state.uuid).then(response => {
				commit('SET_DOCUMENT', response.data);
				return response.data;
			});
		},
		postDocument({ commit }, { file, configuration }) {
			return DocumentService.postDocument(file, configuration).then(response => {
				commit('SET_DOCUMENT_ID', response.data);
				commit('SET_DOCUMENT', null);
				commit('setInputFileName', file.name);
				commit('setElementSelected', null);
				return response.data;
			});
		},
		getDocumentStatus() {
			//console.log(commit);
			return DocumentService.getDocumentStatus(this.state.uuid).then(response => {
				return response.data;
			});
		},
	},
	getters: {
		documentPages(state) {
			return state.document ? state.document.pages.length : 0;
		},
		wordFont: state => fontId => {
			return state.document.fonts.filter(font => font.id === fontId).shift();
		},
	},
});
