import Vue from 'vue';
import App from './App.vue';
import router from './router';
import store from './vuex/store';
import '@mdi/font/css/materialdesignicons.css'; // Ensure you are using css-loader
import 'material-design-icons-iconfont/dist/material-design-icons.css';
import '@fortawesome/fontawesome-free/css/all.css';
import vuetify from '@/plugins/vuetify.js';

Vue.config.productionTip = false;

new Vue({
  vuetify,
  router,
  store,
  render: h => h(App),
}).$mount('#app');
