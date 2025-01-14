import { createRouter, createWebHistory, RouteRecordRaw } from 'vue-router'
import basicLayout from '../layout/basicLayout/index.vue'
import connection from '@/components/connection/connection.vue'
import Login from '../views/Login.vue'
import Home from '../views/Home.vue'
import { ElLoading } from 'element-plus'

const loading = {
  service: () => ElLoading.service({
    lock: true,
    text: 'Loading...',
    spinner: 'el-icon-loading',
    background: 'rgba(0, 0, 0, 0.7)'
  }),
  close: () => {
    const loadingInstance = ElLoading.service();
    loadingInstance.close();
  }
};

const routes: Array<RouteRecordRaw> = [
  {
    path: '/',
    redirect: '/connection'
  },
  {
    path: '/login',
    name: 'Login',
    component: Login
  },
  {
    path: '/home',
    name: 'Home',
    component: Home
  },
  {
    path: '/home',
    name: 'home',
    component: basicLayout
  },
  {
    path: '/connection',
    name: 'connection',
    component: connection
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

// 路由守卫
router.beforeEach((to, from, next) => {
  // 如果是登录页面，直接放行
  if (to.path === '/login') {
    next()
    return
  }
  
  // 从 localStorage 获取登录状态
  const isLoggedIn = localStorage.getItem('isLoggedIn')
  
  // 如果未登录，重定向到登录页
  if (!isLoggedIn) {
    next('/login')
    return
  }
  
  loading.service();
  next();
})

router.afterEach(() => {
  loading.close();
})

export default router
