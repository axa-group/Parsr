import Vue from 'vue';
import Vuex from 'vuex';
import DocumentService from '@/services/DocumentServices.js';

Vue.use(Vuex);

const flattenElement = element => {
  var flattend = [];
  !(function flat(element) {
    flattend.push(element);
    if (element.content) {
      element.content.forEach(function(el) {
        flattend.push(el);
        if (Array.isArray(el.content)) {
          flat(el);
        }
      });
    }
  })(element);
  return flattend;
};

let allWordsCache = null;
let allPageWordsCache = null;
export default new Vuex.Store({
  state: {
    pagination: {
      limit: 10, //items per page
      offset: 0, // starting index
    },
    fontUsageRatioCache: {},
    selectedPage: 1,
    zoom: 1.0,
    uuid: null,
    inputFileName: null,
    document: null,
    inspectorFilters: {},
    expansionPanels: {
      // 0: panel opened, undefined: panel closed
      pageInspector: 0,
      elementSelector: 0,
      elementInspector: 0,
      wordHierarchy: 0,
    },
    selectedElement: null,
    selectedParentElement: null,
    outputs: {
      markdown: {
        code: null,
        loading: false,
      },
      text: {
        code: null,
        loading: false,
      },
      csv: {
        urls: null,
        loading: false,
        csvs: [],
      },
    },
    loadingConfig: false,
    defaultConfig: {
      extractor: {},
      cleaner: [],
      output: {},
    },
  },
  mutations: {
    resetPagination(state) {
      Vue.set(state.pagination, 'offset', 0);
    },
    setCsvdownLoading(state, loading) {
      state.outputs.csv.loading = loading;
    },
    setMarkdownLoading(state, loading) {
      state.outputs.markdown.loading = loading;
    },
    setTextLoading(state, loading) {
      state.outputs.text.loading = loading;
    },
    setParentElementSelected(state, element) {
      state.selectedParentElement = element !== state.selectedParentElement ? element : null;
    },
    setElementSelected(state, element) {
      state.selectedElement = element !== state.selectedElement ? element : null;
      state.selectedParentElement = null;
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
    SET_DOCUMENT(state, document) {
      state.document = document;
    },
    SET_DOCUMENT_TEXT(state, textCode) {
      state.outputs.text.code = textCode;
    },
    SET_DOCUMENT_MARKDOWN(state, markDownCode) {
      state.outputs.markdown.code = markDownCode;
    },
    SET_DOCUMENT_CSV_LIST(state, csvUrls) {
      state.outputs.csv.urls = csvUrls;
      if (!csvUrls) {
        state.outputs.csv.csvs = [];
      }
    },
    SET_DOCUMENT_CSV_ITEM(state, { index, csv }) {
      state.outputs.csv.csvs.splice(index, 0, csv);
      if (state.outputs.csv.csvs.length === state.outputs.csv.urls.length) {
        state.outputs.csv.loading = false;
      }
    },
    SET_DOCUMENT_ID(state, id) {
      state.uuid = id;
    },
    switchExpansionPanel(state, { panel, value }) {
      Vue.set(state.expansionPanels, panel, value);
    },
    SET_DEFAULT_CONFIG(state, config) {
      Vue.set(state, 'defaultConfig', config);
    },
    LOADING(state, value) {
      Vue.set(state, 'loadingConfig', value);
    },
    calculateFontUsageRatio(state, fontId) {
      if (state.fontUsageRatioCache[fontId]) {
        return;
      }
      if (!allWordsCache) {
        allWordsCache = state.document.pages
          .map(page => page.elements)
          .reduce((prev, curr) => prev.concat(curr), [])
          .map(flattenElement)
          .reduce((prev, curr) => prev.concat(curr), [])
          .filter(element => element.type == 'word');
      }

      if (!allPageWordsCache) {
        allPageWordsCache = state.document.pages
          .filter(page => page.pageNumber === state.selectedPage)
          .map(page => page.elements)
          .reduce((prev, curr) => prev.concat(curr), [])
          .map(flattenElement)
          .reduce((prev, curr) => prev.concat(curr), [])
          .filter(element => element.type == 'word');
      }

      const wordsWithFont = allWordsCache.filter(w => w.font == fontId);
      const pageWordsWithFont = allPageWordsCache.filter(w => w.font == fontId);
      const usageRatio = {
        documentRatio:
          Number(wordsWithFont.length / allWordsCache.length).toFixed(3) +
          ' (' +
          wordsWithFont.length +
          '/' +
          allWordsCache.length +
          ')',
        pageRatio:
          Number(pageWordsWithFont.length / allPageWordsCache.length).toFixed(3) +
          ' (' +
          pageWordsWithFont.length +
          '/' +
          allPageWordsCache.length +
          ')',
      };
      Vue.set(state.fontUsageRatioCache, fontId, usageRatio);
    },
  },
  actions: {
    calculateFontUsageRatio({ commit }, fontId) {
      commit('calculateFontUsageRatio', fontId);
    },
    getDefaultConfiguration({ commit }) {
      commit('LOADING', true);
      return DocumentService.getDefaultConfiguration().then(({ data }) => {
        commit('SET_DEFAULT_CONFIG', data);
        commit('LOADING', false);
        return data;
      });
    },
    fetchThumbnail(_, { page }) {
      return DocumentService.getThumbnail(this.state.uuid, page);
    },
    fetchDocument({ commit }) {
      return DocumentService.getDocument(this.state.uuid).then(response => {
        commit('SET_DOCUMENT', DocumentService.normalizeWordsSpace(response.data));
        return response.data;
      });
    },
    fetchDocumentText({ commit }) {
      commit('setTextLoading', true);
      return DocumentService.getDocumentText(this.state.uuid).then(response => {
        commit('setTextLoading', false);
        commit('SET_DOCUMENT_TEXT', response.data);
        return response.data;
      });
    },
    fetchDocumentMarkdown({ commit }) {
      commit('setMarkdownLoading', true);
      return DocumentService.getDocumentMarkdown(this.state.uuid)
        .then(response => {
          commit('setMarkdownLoading', false);
          commit(
            'SET_DOCUMENT_MARKDOWN',
            DocumentService.normalizeImagesSrc(response.data, this.state.uuid),
          );
          return response.data;
        })
        .catch(error => {
          commit('setMarkdownLoading', false);
          throw error;
        });
    },
    fetchDocumentCsvList({ commit }) {
      commit('setCsvdownLoading', true);
      return DocumentService.getDocumentCsvs(this.state.uuid)
        .then(response => {
          commit('SET_DOCUMENT_CSV_LIST', response.data);
          if (Array.isArray(response.data) && response.data.length > 0) {
            for (const url in response.data) {
              DocumentService.getDocumentCsv(response.data[url]).then(response => {
                commit('SET_DOCUMENT_CSV_ITEM', { index: url, csv: response.data });
              });
            }
          } else {
            commit('setCsvdownLoading', false);
            return response.data;
          }
        })
        .catch(error => {
          commit('setCsvdownLoading', false);
          throw error;
        });
    },
    postDocument({ commit }, { file, configuration, credentials }) {
      return DocumentService.postDocument(file, configuration, credentials).then(response => {
        commit('SET_DOCUMENT_ID', response.data);
        commit('SET_DOCUMENT', null);
        commit('SET_DOCUMENT_TEXT', null);
        commit('SET_DOCUMENT_MARKDOWN', null);
        commit('SET_DOCUMENT_CSV_LIST', null);
        commit('setInputFileName', file.name);
        commit('setElementSelected', null);
        commit('setParentElementSelected', null);
        commit('setSelectedPage', 1);
        commit('resetPagination');
        return response.data;
      });
    },
    getDocumentStatus() {
      return DocumentService.getDocumentStatus(this.state.uuid).then(response => {
        return response.data;
      });
    },
  },
  getters: {
    baseAPIUrl() {
      return DocumentService.getAPIURL();
    },
    currentPageElements(state) {
      try {
        return state.document.pages[state.selectedPage - 1].elements;
      } catch (e) {
        return [];
      }
    },
    fonts(state) {
      return state.document ? state.document.fonts : [];
    },
    documentPages(state) {
      return state.document ? state.document.pages.length : 0;
    },
    wordFont: state => fontId => {
      return state.document.fonts.filter(font => font.id === fontId).shift();
    },
    pageInspectorSwitchState(state) {
      return state.expansionPanels.pageInspector;
    },
    elementSelectorSwitchState(state) {
      return state.expansionPanels.elementSelector;
    },
    elementInspectorSwitchState(state) {
      return state.expansionPanels.elementInspector;
    },
    wordHierarchySwitchState(state) {
      return state.expansionPanels.wordHierarchy;
    },
    fontInspectorSwitchState(state) {
      return state.expansionPanels.fontInspector;
    },
    fontUsageRatio(state) {
      return state.fontUsageRatioCache;
    },
    pageMarginsFilter(state) {
      return state.inspectorFilters.margins;
    },
  },
});
