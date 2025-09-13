import { auth } from "../firebase.js";
import { createRouter, createWebHistory } from 'vue-router'

import Home from '../views/Home.vue'
import Login from '../views/Login.vue'
import Register from '../views/Register.vue'
import Account from '../views/Account.vue'
import About from '../views/About.vue'
import Services from '../views/Services.vue'
import StoriesList from "../views/StoryList.vue";
import StoryDetail from "../components/StoryDetail.vue";
import ResourceList from '../views/ResourceList.vue'
import ResourceDetail from '../components/ResourceDetail.vue'
import AdminDashboard from '../views/AdminDashboard.vue'
import AdminResources from '../views/AdminResources.vue'
// import Support from '../views/Support.vue'
// import Wellbeing from '../views/Wellbeing.vue'


// import AdminAnalytics from '../views/AdminAnalytics.vue'
// import AdminAccount from '../views/AdminAccount.vue'

const routes = [
  { path: '/', component: Home },
  // { path: '/login', component: Login }, // Login now handled by modal
  { path: '/register', component: Register },
  { path: '/about', component: About },
  { path: '/services', component: Services },
  { path: '/stories', name: 'stories', component: StoriesList },
  { path: '/stories/:id', name: 'storyDetail', component: StoryDetail, props: true },
  { path: '/resources', name: 'resources', component: ResourceList },
  { path: '/resources/:id', name: 'resourceDetail', component: ResourceDetail, props: true },
  // { path: '/support', component: Support },
  // { path: '/wellbeing', component: Wellbeing },
  { path: '/account', component: Account },
  
  // Admin routes
  { path: '/admin', name: 'adminDashboard', component: AdminDashboard, meta: { requiresAuth: true, requiresAdmin: true } },
  { path: '/admin/resources', name: 'adminResources', component: AdminResources, meta: { requiresAuth: true, requiresAdmin: true } }
]


const router = createRouter({
  history: createWebHistory(),
  routes,
  // 每次跳转默认到页面顶部
  scrollBehavior(to, from, savedPosition) {
    if (savedPosition) {
      return savedPosition;
    } else {
      return { left: 0, top: 0 };
    }
  }
})

router.beforeEach((to, from, next) => {
  const currentUser = auth.currentUser;
  
  // Check if route requires authentication
  if (to.meta.requiresAuth && !currentUser) {
    // Redirect to home page and trigger login modal
    next("/");
    // Trigger login modal after navigation
    setTimeout(() => {
      window.dispatchEvent(new Event('open-login'));
    }, 100);
    return;
  }
  
  // Check if route requires admin role
  if (to.meta.requiresAdmin) {
    const userData = JSON.parse(localStorage.getItem("currentUser") || "{}");
    if (userData.role !== "admin") {
      next("/account"); // Redirect to account page if not admin
      return;
    }
  }
  
  // Legacy check for account page - now handled by component itself with modal
  // if (to.path === "/account" && !currentUser) {
  //   next("/login");
  //   return;
  // }
  
  next();
});

export default router
