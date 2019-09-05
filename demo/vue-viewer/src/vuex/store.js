import Vue from 'vue';
import Vuex from 'vuex';
import DocumentService from '@/services/DocumentServices.js';

Vue.use(Vuex);

export default new Vuex.Store({
	state: {
		selectedPage: 1,
		zoom: 1.0,
		uuid: '75c4bcb6d51e4e60a3f0682f858ffe',
		document: null,
		inspectorFilters: {},
		customConfig: {
			cleaner: [
				'out-of-page-removal',
				'whitespace-removal',
				'redundancy-detection',
				'reading-order-detection',
				'link-detection',
				'words-to-line',
				'lines-to-paragraph',
				'heading-detection',
				'header-footer-detection',
				'hierarchy-detection',
			],
		},
	},
	mutations: {
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
				console.log(commit);
				commit('SET_DOCUMENT_ID', response.data);
				commit('SET_DOCUMENT', null);
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
