<template>
  <div class="login-container">
    <el-form
      ref="loginForm"
      :model="loginForm"
      :rules="loginRules"
      class="login-form"
      auto-complete="on"
      label-position="left"
    >
      <div class="title-container">
        <h3 class="title">FTP File Transfer</h3>
      </div>

      <el-form-item prop="host">
        <el-input
          ref="host"
          v-model="loginForm.host"
          placeholder="Host"
          name="host"
          type="text"
          auto-complete="on"
        />
      </el-form-item>

      <el-form-item prop="port">
        <el-input
          ref="port"
          v-model="loginForm.port"
          placeholder="Port"
          name="port"
          type="text"
          auto-complete="on"
        />
      </el-form-item>

      <el-form-item prop="username">
        <el-input
          ref="username"
          v-model="loginForm.username"
          placeholder="Username"
          name="username"
          type="text"
          auto-complete="on"
        />
      </el-form-item>

      <el-form-item prop="password">
        <el-input
          ref="password"
          v-model="loginForm.password"
          placeholder="Password"
          name="password"
          type="password"
          auto-complete="on"
          @keyup.enter="handleLogin"
        />
      </el-form-item>

      <el-button
        :loading="loading"
        type="primary"
        style="width: 100%; margin-bottom: 30px"
        @click.prevent="handleLogin"
      >
        Login
      </el-button>
    </el-form>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive } from 'vue'
import { useRouter } from 'vue-router'
import { useStore } from '../store'
import { ElMessage } from 'element-plus'

const router = useRouter()
const store = useStore()

const loading = ref(false)
const loginForm = reactive({
  host: '',
  port: '',
  username: '',
  password: ''
})

const loginRules = {
  host: [{ required: true, message: 'Host is required', trigger: 'blur' }],
  port: [{ required: true, message: 'Port is required', trigger: 'blur' }],
  username: [{ required: true, message: 'Username is required', trigger: 'blur' }],
  password: [{ required: true, message: 'Password is required', trigger: 'blur' }]
}

const handleLogin = async () => {
  loading.value = true
  try {
    // 保存登录信息到 store
    store.setLoginInfo({
      host: loginForm.host,
      port: loginForm.port,
      username: loginForm.username,
      password: loginForm.password
    })
    
    // 设置登录状态
    localStorage.setItem('isLoggedIn', 'true')
    
    // 跳转到主页
    await router.push('/home')
    ElMessage.success('Login successful')
  } catch (error) {
    ElMessage.error('Login failed')
    console.error('Login error:', error)
  } finally {
    loading.value = false
  }
}
</script>

<style lang="less" scoped>
.login-container {
  min-height: 100vh;
  width: 100%;
  background-color: #2d3a4b;
  overflow: hidden;
  display: flex;
  align-items: center;
  justify-content: center;

  .login-form {
    position: relative;
    width: 520px;
    max-width: 100%;
    padding: 160px 35px 0;
    margin: 0 auto;
    overflow: hidden;
  }

  .title-container {
    position: relative;
    .title {
      font-size: 26px;
      color: #eee;
      margin: 0 auto 40px auto;
      text-align: center;
      font-weight: bold;
    }
  }

  :deep(.el-input) {
    display: inline-block;
    height: 47px;
    width: 85%;

    input {
      background: transparent;
      border: 0;
      -webkit-appearance: none;
      border-radius: 0;
      padding: 12px 5px 12px 15px;
      color: #eee;
      height: 47px;
      caret-color: #fff;

      &:-webkit-autofill {
        box-shadow: 0 0 0 1000px #283443 inset !important;
        -webkit-text-fill-color: #fff !important;
      }
    }
  }

  :deep(.el-form-item) {
    border: 1px solid rgba(255, 255, 255, 0.1);
    background: rgba(0, 0, 0, 0.1);
    border-radius: 5px;
    color: #454545;
  }
}
</style>
