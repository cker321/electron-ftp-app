import { defineStore } from 'pinia'

interface State {
  isLogin: boolean
  currentPath: string
  host: string
  port: string
}

export const useMainStore = defineStore('main', {
  state: (): State => ({
    isLogin: false,
    currentPath: '',
    host: '',
    port: ''
  }),
  
  actions: {
    setLoginStatus(status: boolean) {
      this.isLogin = status
    },
    
    setCurrentPath(path: string) {
      this.currentPath = path
    },
    
    setHost(host: string) {
      this.host = host
    },
    
    setPort(port: string) {
      this.port = port
    },
    
    reset() {
      this.isLogin = false
      this.currentPath = ''
      this.host = ''
      this.port = ''
    }
  }
})
