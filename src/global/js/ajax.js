import axios from 'axios'
import { ElMessage } from 'element-plus'

// 创建 axios 实例
const ajax = axios.create({
  baseURL: 'http://localhost:3000',
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json'
  }
})

// 请求拦截器
ajax.interceptors.request.use(
  config => {
    return config
  },
  error => {
    console.error('Request error:', error)
    return Promise.reject(error)
  }
)

// 响应拦截器
ajax.interceptors.response.use(
  response => {
    return response
  },
  error => {
    console.error('Response error:', error)
    ElMessage.error(error.message || '请求失败')
    return Promise.reject(error)
  }
)

export default {
  install: (app) => {
    app.config.globalProperties.$ajax = ajax
    window.$ajax = ajax
  }
}
