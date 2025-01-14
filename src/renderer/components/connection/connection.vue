<template>
    <div class="connection" id="connection">
        <div class="main-content"
             v-loading="loading"
             element-loading-text="connect to ftp server，plz wait...">
            <div v-show="!isLogin" class="logo">
                <img class="gray" src="./application.png" width="50" alt="">
            </div>
            <el-form v-show="!isLogin"
                     ref="formRef"
                     :model="form"
                     :rules="rules"
                     label-position="top"
                     label-width="80px">
                <el-row :gutter="20">
                    <el-col :span="6">
                        <el-form-item label="Host"
                                      prop="host"
                                      :rules="{required: true, message: 'Please input host address', trigger: 'blur'}">
                            <el-input v-model="form.host" placeholder="Please input host address"></el-input>
                        </el-form-item>
                    </el-col>
                    <el-col :span="6">
                        <el-form-item label="User"
                                      prop="user"
                                      :rules="{required: true, message: 'Please input username', trigger: 'blur'}">
                            <el-input v-model="form.user" placeholder="Please input username"></el-input>
                        </el-form-item>
                    </el-col>
                    <el-col :span="6">
                        <el-form-item label="Password"
                                      prop="password"
                                      :rules="{required: true, message: 'Please input password', trigger: 'blur'}">
                            <el-input v-model="form.password" placeholder="Please input password" type="password"></el-input>
                        </el-form-item>
                    </el-col>
                    <el-col :span="6">
                        <el-form-item label="Port"
                                      prop="port"
                                      :rules="{required: true, message: 'Please input port number', trigger: 'blur'}">
                            <el-input v-model="form.port" placeholder="Please input port number"></el-input>
                        </el-form-item>
                    </el-col>
                </el-row>
                <el-row class="tr">
                    <el-form-item>
                        <el-button type="primary" plain @click="sendConnect">Connect</el-button>
                    </el-form-item>
                </el-row>
            </el-form>
            <folder v-show="isLogin"
                    ref="folderRef"
                    :host="form.host"
                    :port="form.port"
                    :isLogin="isLogin"
                    :defaultData="folderData"
                    :currentPath="currentPath"
                    @logout="handleLogout"></folder>
        </div>
    </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { ElMessage, FormInstance } from 'element-plus'
import { ipcRenderer } from 'electron'
import folder from '../folder/index.vue'
import defaultForm from '../../config/serverInfo.ts'

const formRef = ref<FormInstance>()
const folderRef = ref()

const form = reactive({
    ...defaultForm
})

const folderData = ref([])
const currentPath = ref('')
const isLogin = ref(false)
const loading = ref(false)
const closed = ref(false)

const rules = {
    host: [
        { required: true, message: 'Please input host address', trigger: 'blur' }
    ],
    user: [
        { required: true, message: 'Please input username', trigger: 'blur' }
    ],
    password: [
        { required: true, message: 'Please input password', trigger: 'blur' }
    ],
    port: [
        { required: true, message: 'Please input port number', trigger: 'blur' }
    ]
}

const handleLogout = () => {
    folderData.value = []
    isLogin.value = false
}

const sendConnect = async () => {
    if (!formRef.value) return
    
    try {
        await formRef.value.validate()
        loading.value = true
        
        const res = await window.$ajax.post('/connect', form)
        if (res.data.code === 0) {
            isLogin.value = true
            ElMessage.success('Connection successful')
            initCloseHandler()
        } else {
            ElMessage.error(res.data.msg || 'Connection failed')
        }
    } catch (error) {
        console.error('Connection error:', error)
        ElMessage.error('Connection failed')
    } finally {
        loading.value = false
    }
}

const initCloseHandler = () => {
    if (closed.value) return
    closed.value = true
    
    ipcRenderer.on('window-close', async () => {
        if (!isLogin.value) {
            ipcRenderer.send('closed')
            return
        }
        
        try {
            const res = await window.$ajax.post('/disconnect')
            if (res.data.code === 0) {
                ipcRenderer.send('closed')
            }
        } catch (error) {
            console.error('Disconnect error:', error)
            ipcRenderer.send('closed')
        }
    })
}

onMounted(() => {
    getUserInfo()
})

const getUserInfo = async () => {
    try {
        const res = await window.$ajax.get('/userInfo')
        if (res.data.code === 0 && res.data.data) {
            Object.assign(form, convertParams(res.data.data))
        }
    } catch (error) {
        console.error('Get user info error:', error)
    }
}

const convertParams = (params: any) => {
    const result = { ...params }
    if (result.port) {
        result.port = String(result.port)
    }
    return result
}
</script>

<style scoped lang="less">
.connection {
    width: 100%;
    height: 100%;
    display: flex;
    justify-content: center;
    align-items: center;
    background-color: #f5f5f5;

    .main-content {
        width: 100%;
        height: 100%;
        background-color: #fff;
        border-radius: 4px;
        padding: 20px;
        box-sizing: border-box;
    }

    .logo {
        text-align: center;
        margin-bottom: 20px;
    }

    .tr {
        text-align: right;
    }

    .gray {
        filter: grayscale(100%);
    }
}
</style>
