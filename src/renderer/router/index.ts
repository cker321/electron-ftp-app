import { createRouter, createWebHashHistory } from 'vue-router'

const router = createRouter({
  history: createWebHashHistory(),
  routes: [
    {
      path: '/',
      name: 'connection',
      component: () => import('../components/connection/connection.vue')
    },
    {
      path: '/folder',
      name: 'folder',
      component: () => import('../components/folder/index.vue')
    }
  ]
})

export default router
