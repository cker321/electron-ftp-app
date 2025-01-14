import { ipcRenderer } from '@electron/remote'

export default {
  install(Vue) {
    Vue.config.globalProperties.$get = (type, data) => {
      return new Promise((resolve, reject) => {
        ipcRenderer.send(type, data)
        ipcRenderer.once(type + 'Back', (event, data) => {
          resolve(data)
        })
      })
    }
  }
}
