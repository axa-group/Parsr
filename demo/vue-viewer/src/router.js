import Vue from 'vue';
import Router from 'vue-router';
import Upload from './views/Upload.vue';
import Home from './views/Home';
import Viewer from './views/Viewer.vue';

Vue.use(Router);

export default new Router({
	mode: 'history',
	base: process.env.BASE_URL,
	routes: [
		{
			path: '/',
			name: 'home',
			component: Home,
		},
		{
			path: '/upload',
			name: 'upload',
			component: Upload,
		},
		{
			path: '/viewer',
			name: 'viewer',
			component: Viewer,
		},
		{
			path: '*',
			redirect: { name: 'home' },
		},
	],
});
