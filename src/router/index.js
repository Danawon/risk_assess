import { createRouter, createWebHistory } from 'vue-router'
import Monitor from '../components/monitor.vue'

const routes = [
  {
    path: '/',
    redirect: '/monitor'
  },
  {
    path: '/monitor',
    name: 'HeartRateMonitor',
    component: Monitor
  },
  {
    path: '/login',
    name: 'LoginPage',
    component: () => import('../components/login.vue')
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

const whiteList = ['/login']
router.beforeEach(async (to, from, next) => {
  if (whiteList.includes(to.path)) {
    next()
  } else {
    const token = sessionStorage.getItem('monitorToken')
    if (token && token.length) {
      next()
    } else {
      next('/login')
    }
  }
})

export default router 