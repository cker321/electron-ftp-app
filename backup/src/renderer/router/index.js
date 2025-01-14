import Vue from 'vue'
import Router from 'vue-router'

import basicLayout from '@/layout/basicLayout'
import connection from '@/components/connection/connection'
import folder from '@/components/folder/index'

import { Loading } from 'element-ui';
const loading = {
  service: () => Loading.service({
    lock: true,
    text: 'Loading...',
    spinner: 'el-icon-loading',
    background: 'rgba(0, 0, 0, 0.7)'
  }),
  close: () => {
    const loadingInstance = Loading.service();
    loadingInstance.close();
  }
};

Vue.use(Router)

const router = new Router({
  routes: [
    {
      path: '/',
      redirect: '/connection'
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
    },
    {
      path: '/folder',
      name: 'folder',
      component: folder
    }
  ]
})

router.beforeEach((to, from, next) => {
  loading.service();
  next();
})

router.afterEach(() => {
  loading.close();
})

export default router;
