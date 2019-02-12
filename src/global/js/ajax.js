import axios from 'axios';
import { Loading } from 'element-ui';
import { Message } from 'element-ui';
// import layer from 'vue-layer-mobile'
// import loading from '@g/js/loading'
import qs from 'qs'
const prefix = process.env.NODE_ENV === 'production' ? 'http://localhost:3009' : 'http://localhost:3009'

// let token = sessionStorage.getItem('lbbToken')
axios.interceptors.request.use(function (config) {
  // token && (config.headers['token'] = token)
  // if (config.method === 'post') {
  //   let data = qs.parse(config.data)
  //   config.data = qs.stringify({
  //     ...data
  //   })
  // } else if (config.method === 'get') {
  //   config.params = {
  //     ...config.params
  //   }
  // }
  return config
}, function (error) {
  return Promise.reject(error)
})

export default {
  install(Vue, options) {
    Vue.prototype.$post = post
    Vue.prototype.$get = get
  }
}

/**
 * eg. this.$post('api', {**}, true)
 * @param api 接口名
 * @param params  json参数
 * @param load  是否启用loading动画，默认false
 * @returns {Promise}
 */

export const post = function (api, params, load) {
  let isLoad = load ? load : false
  let PromiseHttp = new Promise(function (resolve, reject) {
    axios.default.withCredentials = true;
    if (api.indexOf('fileUpload') > -1) {
      axios.defaults.headers['Content-Type']  = undefined
    } else {
      axios.defaults.headers['Content-Type']  = 'application/json;charset=UTF-8'
    }
    axios.post(`${prefix}/${api}`, params).then(function (res) {
      if (isLoad) loading.end()
      if (res.data.code !== '0000000') {
        reject(res.data);
        Message.error('请求出错哦！' + res.data);
      } else {
        resolve(res.data)
      }
    }).catch(function (err) {
      // Message.error('请求出错哦！' + err);
      reject(err)
    })
  })
  return PromiseHttp
}

export const get = function (api, params, load) {
  let isLoad = load ? load : false
  if (isLoad) loading.state()
  let PromiseHttp = new Promise(function (resolve, reject) {
    axios.default.withCredentials = true
    axios.defaults.headers['Content-Type']  = 'application/json';
    axios.get(`${prefix}/${api}`, {params: params}).then(function (res) {
      if (isLoad) loading.end()
      if (res.data.status === '0000000') {
        reject(res.data);
          Message.error('请求出错哦！' + err);
      } else {
        // res.data.token && (sessionStorage.setItem('lbbToken', res.data.token))
        resolve(res.data)
      }
    }).catch(function (err) {
      console.log(err)
    })
  })
  return PromiseHttp
}
