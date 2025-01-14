import Vue from 'vue'
import App from './App'
import ElementUI from 'element-ui'
import 'element-ui/lib/theme-chalk/index.css'
import ajax from '../global/js/ajax'
import router from './router'

Vue.config.productionTip = false
Vue.use(ElementUI)
Vue.use(ajax)

new Vue({
  el: '#app',
  router,
  render: h => h(App)
})
