import Vue from 'vue';
import App from './App.vue';
import router from './router';
import store from './vuex/store';
import Vuetify from 'vuetify'; // Import Vuetify to your project
import 'vuetify/dist/vuetify.min.css';

Vue.config.productionTip = false;
Vue.use(Vuetify);

new Vue({
	router,
	store,
	render: h => h(App),
}).$mount('#app');
