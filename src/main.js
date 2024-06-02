// main.js
import { createApp } from 'vue';
import App from './App.vue';
import router from './router';
import { store } from './store';
import vuetify from './plugins/vuetify';
import VueClipboard from 'vue-clipboard2';
import SETTINGS from '@/store/settings';

import '@/components/globals';
import 'roboto-fontface/css/roboto/roboto-fontface.css';
import '@mdi/font/css/materialdesignicons.css';
import '@/assets/css/main.scss';
import './registerServiceWorker';
import VueTimepicker from 'vue3-timepicker';
import 'vue3-timepicker/dist/VueTimepicker.css';

import { Buffer } from 'buffer';

// Ensure global Buffer is available
if (!window.Buffer) {
	window.Buffer = Buffer;
}
console.log('main------1');
const app = createApp(App);
console.log('main------2');
app.use(router);
console.log('main------3');
app.use(store);
console.log('main------4');
app.use(vuetify);

console.log('main------5');
app.use(VueClipboard);
console.log('main------6');
app.config.globalProperties.$settings = SETTINGS;
console.log('main------7');
app.use(VueTimepicker);

app.mount('#app');
