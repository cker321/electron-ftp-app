import { defineStore } from 'pinia'

interface LoginInfo {
  host: string
  port: string
  username: string
  password: string
}

export const useStore = defineStore('main', {
  state: () => ({
    loginInfo: {
      host: '',
      port: '',
      username: '',
      password: ''
    } as LoginInfo,
    currentPath: '/'
  }),
  
  actions: {
    setLoginInfo(info: LoginInfo) {
      this.loginInfo = info
    },
    
    setCurrentPath(path: string) {
      this.currentPath = path
    }
  }
})
