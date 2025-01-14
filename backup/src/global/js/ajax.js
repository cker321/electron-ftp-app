import axios from 'axios'
import { Loading, Message } from 'element-ui'
import qs from 'qs'

const prefix = process.env.NODE_ENV === 'production' ? 'http://localhost:3009' : 'http://localhost:3009'

const loadingInstance = {
  instance: null,
  count: 0
}

const loading = {
  start() {
    if (loadingInstance.count === 0) {
      loadingInstance.instance = Loading.service({
        lock: true,
        text: 'Loading...',
        spinner: 'el-icon-loading',
        background: 'rgba(0, 0, 0, 0.7)'
      })
    }
    loadingInstance.count++
  },
  close() {
    if (loadingInstance.count > 0) {
      loadingInstance.count--
    }
    if (loadingInstance.count === 0 && loadingInstance.instance) {
      loadingInstance.instance.close()
      loadingInstance.instance = null
    }
  }
}

// 请求拦截器
axios.interceptors.request.use(
  config => config,
  error => Promise.reject(error)
)

// 响应拦截器
axios.interceptors.response.use(
  response => response,
  error => {
    Message.error('Network Error: ' + (error.message || 'Unknown error'))
    return Promise.reject(error)
  }
)

// 定义 Vue 插件
const ajaxPlugin = {
  install(Vue) {
    Vue.prototype.$post = post
    Vue.prototype.$_post = _post
    Vue.prototype.$get = get
  }
}

export default ajaxPlugin

/**
 * POST请求
 * @param {string} api - 接口名
 * @param {object} params - 请求参数
 * @param {boolean} [load=false] - 是否显示loading
 * @returns {Promise}
 */
export const post = function(api, params, load = false) {
  if (load) loading.start()

  return new Promise((resolve, reject) => {
    const config = {
      timeout: 0,
      headers: {
        'Content-Type': api.includes('fileUpload') ? undefined : 'application/json;charset=UTF-8'
      }
    }

    axios.post(`${prefix}/${api}`, params, config)
      .then(res => {
        if (load) loading.close()
        
        if (res.data.code !== '0000000') {
          const error = new Error(res.data.msg || 'Request failed')
          error.response = res.data
          reject(error)
        } else {
          resolve(res.data)
        }
      })
      .catch(err => {
        if (load) loading.close()
        reject(err)
      })
  })
}

/**
 * 带认证的POST请求
 * @param {string} api - 接口URL
 * @param {object} params - 请求参数
 * @param {boolean} [load=false] - 是否显示loading
 * @returns {Promise}
 */
export const _post = function(api, params, load = false) {
  if (load) loading.start()

  return new Promise((resolve, reject) => {
    const config = {
      withCredentials: true,
      headers: {
        'Content-Type': api.includes('device/video/add') ? undefined : 'application/json;charset=UTF-8',
        'X-Authorization': 'Bearer ' + (sessionStorage.getItem('cloudwalk-token') || '')
      }
    }

    axios.post(api, params, config)
      .then(res => {
        if (load) loading.close()
        
        if (res.data.code !== '00000000') {
          const error = new Error(res.data.msg || 'Request failed')
          error.response = res.data
          reject(error)
        } else {
          resolve(res.data)
        }
      })
      .catch(err => {
        if (load) loading.close()
        reject(err)
      })
  })
}

/**
 * GET请求
 * @param {string} api - 接口名
 * @param {object} params - 请求参数
 * @param {boolean} [load=false] - 是否显示loading
 * @returns {Promise}
 */
export const get = function(api, params, load = false) {
  if (load) loading.start()

  return new Promise((resolve, reject) => {
    const config = {
      params,
      paramsSerializer: params => qs.stringify(params, { arrayFormat: 'repeat' })
    }

    axios.get(`${prefix}/${api}`, config)
      .then(res => {
        if (load) loading.close()
        
        if (res.data.code !== '0000000') {
          const error = new Error(res.data.msg || 'Request failed')
          error.response = res.data
          reject(error)
        } else {
          resolve(res.data)
        }
      })
      .catch(err => {
        if (load) loading.close()
        reject(err)
      })
  })
}
