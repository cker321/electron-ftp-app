import Vue from 'vue'
import Router from 'vue-router'

import basicLayout from '@/layout/basicLayout'
import connection from '@/components/connection/connection'
import folder from '@/components/folder/index'

import { Loading } from 'element-ui';
let loading = null;
Vue.use(Router)

const router = new Router({
    routes: [
        {
            path: '/',
            redirect: '/home'
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
        },
    ]
})
// router.beforeEach((to, from, next) => {
//     loading = Loading.service({});
//     if (to.name === 'welcome') {
//         next()
//     } else {
//         if(sessionStorage.loginState) {
//             if (to.name) {
//                 next()
//             } else {
//                 loading.close();
//                 router.push({
//                     name: 'welcome'
//                 })
//             }
//         } else {
//             loading.close();
//             router.push({
//                 name: 'welcome',
//                 params: {
//                     showLogin: true
//                 }
//             })
//         }
//     }
// })

// router.afterEach((to, from) => {
// //     loading.close();
// // })
export default router;
