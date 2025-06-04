import { createApp } from 'vue';
import App from './App.vue';
import router from './router';
import 'leaflet/dist/leaflet.css';
import { createPinia } from 'pinia';
import { fetchExchangeRate } from './services/utils/currencyConverter';

fetchExchangeRate();
const app = createApp(App);
app.use(createPinia());
app.use(router);
app.mount('#app');
