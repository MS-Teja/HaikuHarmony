import { createRouter, createWebHistory } from 'vue-router';
import Home from '../views/Home.vue';
import Submit from '../views/Submit.vue';
import Login from '../views/Login.vue';
import SearchResults from '../views/SearchResults.vue';
import HallOfFame from '../views/HallOfFame.vue';
import HaikuView from '../views/HaikuView.vue';
import UserAccount from '../views/UserAccount.vue';
import About from '../views/About.vue';

const routes = [
  { path: '/', name: 'home', component: Home },
  { path: '/submit', component: Submit },
  { path: '/login', component: Login },
  { path: '/search', name: 'SearchResults', component: SearchResults },
  { path: '/hall-of-fame', component: HallOfFame },
  { path: '/haiku/:id', name: 'HaikuView', component: HaikuView },
  { path: '/user/:userId', component: UserAccount },
  { path: '/about', component: About },
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

export default router;