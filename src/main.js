import { createApp } from 'vue';
import { createPinia } from 'pinia';
import App from './App.vue';
import router from './router';
import VueLazyload from 'vue-lazyload';
import { createHead } from '@vueuse/head';

import ProfileImage from './components/ProfileImage.vue';

import { library } from '@fortawesome/fontawesome-svg-core'

import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome'

import { faUserSecret } from '@fortawesome/free-solid-svg-icons'

library.add(faUserSecret)

const app = createApp(App);

const head = createHead();
app.use(head);

const pinia = createPinia();
app.use(pinia);

app.use(router);

app.use(VueLazyload, {
    preLoad: 1.3,
    error: '/path/to/error-image.jpg',
    loading: '/path/to/loading-image.jpg',
    attempt: 1
  });

app.component('font-awesome-icon', FontAwesomeIcon)

app.component('ProfileImage', ProfileImage);

app.mount('#app');

import { useUserStore } from './stores/user';
const userStore = useUserStore();
userStore.init();