import Vue from 'vue';
import Router from 'vue-router';
import Upload from './views/Upload.vue';
import Viewer from './views/Viewer.vue';
import ViewerText from './views/ViewerText.vue';
import ViewerMarkdown from './views/ViewerMarkdown.vue';
import ViewerCsv from './views/ViewerCsv.vue';

Vue.use(Router);

export default new Router({
  mode: 'history',
  base: process.env.BASE_URL,
  routes: [
    {
      path: '/',
      redirect: '/upload',
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
      path: '/viewerText',
      name: 'viewerText',
      component: ViewerText,
    },
    {
      path: '/viewerMarkdown',
      name: 'viewerMarkdown',
      component: ViewerMarkdown,
    },
    {
      path: '/viewerCsv',
      name: 'viewerCsv',
      component: ViewerCsv,
    },
    {
      path: '*',
      redirect: { name: 'upload' },
    },
  ],
});
