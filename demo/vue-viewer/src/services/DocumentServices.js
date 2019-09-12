import axios from 'axios';
//import NProgress from 'nprogress'

const apiClient = axios.create({
	//baseURL: 'https://images.pexels.com',
	baseURL: 'http://localhost:3001/api/v1',
	withCredentials: false,
	headers: {
		//crossdomain: true,
		//Accept: 'application/json',
		//'Access-Control-Allow-Origin': 'http://localhost:8080',
		//'Content-type': 'image/png',
		//responseType: 'blob',
	},
	timeout: 10000,
});

export default {
	getThumbnail(docID, page) {
		return apiClient.get('/thumbnail/' + docID + '/' + (page - 1), {
			responseType: 'blob',
		});
	},
	getDocument(docID) {
		return apiClient.get('/json/' + docID);
	},
	postDocument(file, configuration) {
		const formData = new FormData();
		formData.append('file', file, file.name);
		formData.append('config', configuration);
		console.log(formData);
		return apiClient.post('/document', formData);
	},
	getDocumentStatus(docID) {
		return apiClient.get('/queue/' + docID);
	},
};
