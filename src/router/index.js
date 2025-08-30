import { auth } from "../firebase.js";
import { createRouter, createWebHistory } from 'vue-router'

import Home from '../views/Home.vue'
import Login from '../views/Login.vue'
import Register from '../views/Register.vue'
import Account from '../views/Account.vue'
// import About from '../views/About.vue'
// import Services from '../views/Services.vue'
// import Resources from '../views/Resources.vue'
// import Support from '../views/Support.vue'
// import Wellbeing from '../views/Wellbeing.vue'


// import AdminDashboard from '../views/AdminDashboard.vue'
// import AdminResources from '../views/AdminResources.vue'
// import AdminAnalytics from '../views/AdminAnalytics.vue'
// import AdminAccount from '../views/AdminAccount.vue'

const routes = [
  { path: '/', component: Home },
  { path: '/login', component: Login },
  { path: '/register', component: Register },
  // { path: '/about', component: About },
  // { path: '/services', component: Services },
  // { path: '/resources', component: Resources },
  // { path: '/support', component: Support },
  // { path: '/wellbeing', component: Wellbeing },
  { path: '/account', component: Account },
  //   { path: '/admin', component: AdminDashboard },
  
  // // admin
  // { path: '/admin', component: AdminDashboard },
  // { path: '/admin/resources', component: AdminResources },
  // { path: '/admin/analytics', component: AdminAnalytics },
  // { path: '/admin/account', component: AdminAccount }
]


const router = createRouter({
  history: createWebHistory(),
  routes,
})

router.beforeEach((to, from, next) => {
  const currentUser = auth.currentUser;
  if (to.path === "/account" && !currentUser) {
    next("/login");
  } else {
    next();
  }
});

export default router
