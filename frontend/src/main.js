import { createApp } from 'vue'
import App from './App.vue'
import './registerServiceWorker'
import router from './router'
import store from './store'

// FontAwesome Import
import '@fortawesome/fontawesome-free/js/all.min';

// Importing the Bootstrap
import 'bootstrap/dist/css/bootstrap.min.css'
import 'bootstrap/dist/js/bootstrap.bundle.min'

createApp(App)
    .use(store)
    .use(router)
    .mount('#app')
