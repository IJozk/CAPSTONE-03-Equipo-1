import { createApp } from 'vue';
import { createPinia } from 'pinia';
import router from './router';
import App from './App.vue';
import './assets/styles/main.css'; // Importar Tailwind CSS

const app = createApp(App);
const pinia = createPinia();

// Instalar plugins
app.use(pinia);
app.use(router);

// Montar aplicación
app.mount('#app');
