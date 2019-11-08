import axios from 'axios';

const apiClient = axios.create({
  baseURL: process.env.VUE_APP_API
    ? process.env.VUE_APP_API + '/api/v1'
    : 'http://localhost:3001/api/v1',
  withCredentials: false,
  headers: {},
  timeout: 10000,
});

export default {
  search(obj, predicate) {
    let result = [];
    for (let p in obj) {
      // iterate on every property
      // tip: here is a good idea to check for hasOwnProperty
      if (typeof obj[p] == 'object') {
        // if its object - lets search inside it
        result = result.concat(this.search(obj[p], predicate));
      } else if (predicate(p, obj[p])) result.push(obj); // check condition
    }
    return result;
  },
  normalizeWordsSpace(document) {
    var lines = this.search(document, function(key, value) {
      return key === 'type' && value === 'line';
    });
    lines.forEach(line => {
      line.content.forEach((word, index) => {
        if (index + 1 < line.content.length) {
          var nextWord = line.content[index + 1];
          if (nextWord.box.l - 3 <= word.box.l + word.box.w) {
            word.fakeSpace = true;
          }
        }
      });
    });
    return document;
  },
  getThumbnail(docID, page) {
    return apiClient.get('/thumbnail/' + docID + '/' + (page - 1), {
      responseType: 'blob',
    });
  },
  getDocument(docID) {
    return apiClient.get('/json/' + docID);
  },
  getDocumentText(docID) {
    return apiClient.get('/text/' + docID);
  },
  getDocumentMarkdown(docID) {
    return apiClient.get('/markdown/' + docID);
  },
  getDocumentCsvs(docID) {
    return apiClient.get('/csv/' + docID);
  },
  getDocumentCsv(url) {
    return apiClient.get(url.replace('/api/v1', ''));
  },
  postDocument(file, configuration) {
    const formData = new FormData();
    formData.append('file', file, file.name);
    formData.append('config', configuration);
    return apiClient.post('/document', formData);
  },
  getDocumentStatus(docID) {
    return apiClient.get('/queue/' + docID);
  },
  getDefaultConfiguration() {
    return apiClient.get('/default-config?specs=true');
  },
};
