import { createRouter, createWebHistory } from 'vue-router'

import Home from '@/views/Home.vue'
import About from '@/views/About.vue'
import Services from '@/views/Services.vue'
import Resources from '@/views/Resources.vue'
import Support from '@/views/Support.vue'
import Wellbeing from '@/views/Wellbeing.vue'
import Login from '@/views/Login.vue'
import Account from '@/views/Account.vue'

import AdminDashboard from '@/views/AdminDashboard.vue'
import AdminResources from '@/views/AdminResources.vue'
import AdminAnalytics from '@/views/AdminAnalytics.vue'
import AdminAccount from '@/views/AdminAccount.vue'


const routes = [
    //user
  { path: '/', component: Home },
  { path: '/about', component: About },
  { path: '/services', component: Services },
  { path: '/resources', component: Resources },
  { path: '/support', component: Support },
  { path: '/wellbeing', component: Wellbeing },
  { path: '/login', component: Login },
  { path: '/account', component: Account },
    { path: '/admin', component: AdminDashboard },
  
    
  // admin
  { path: '/admin', component: AdminDashboard },
  { path: '/admin/resources', component: AdminResources },
  { path: '/admin/analytics', component: AdminAnalytics },
  { path: '/admin/account', component: AdminAccount }
]


const router = createRouter({
  history: createWebHistory(),
  routes,
})

export default router
