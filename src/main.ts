import { createApp } from 'vue'
import App from './App.vue'
import ElementPlus from 'element-plus'
import 'element-plus/dist/index.css'
import router from './router'
import { createPinia } from 'pinia'
import ajax from '../global/js/ajax'

const app = createApp(App)

app.use(ElementPlus)
app.use(router)
app.use(createPinia())
app.use(ajax)

app.mount('#app')
