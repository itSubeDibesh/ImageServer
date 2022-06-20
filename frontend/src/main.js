import { createApp } from 'vue'
import App from './App.vue'
import './registerServiceWorker'
import router from './router'
import store from './store'

import VueSweetalert2 from 'vue-sweetalert2';
import 'sweetalert2/dist/sweetalert2.min.css';

// Lightbox

import 'lightbox2/dist/css/lightbox.min.css';
import 'lightbox2/dist/js/lightbox.min.js';

// FontAwesome Import
import '@fortawesome/fontawesome-free/js/all.min';

// Importing the Bootstrap
import 'bootstrap/dist/css/bootstrap.min.css'
import 'bootstrap/dist/js/bootstrap.bundle.min'

createApp(App)
    .use(store)
    .use(VueSweetalert2)
    .use(router)
    .mount('#app')
