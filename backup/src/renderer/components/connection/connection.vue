<template>
    <div class="connection" id="connection">
        <div class="main-content"
             v-loading="loading"
             element-loading-text="connect to ftp server，plz wait...">
            <div v-show="!isLogin" class="logo">
                <img class="gray" src="./application.png" width="50" alt="">
            </div>
            <el-form v-show="!isLogin"
                     ref="form"
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
                    ref="folder"
                    :host="form.host"
                    :port="form.port"
                    :isLogin="isLogin"
                    :defaultData="folderData"
                    :currentPath="currentPath"
                    @logout="folderData = []; isLogin = false"></folder>
        </div>
    </div>
</template>

<script>
const { ipcRenderer } = require('electron');
import folder from '@/components/folder';
import form from '../../config/serverInfo.js';

export default {
    name: 'cloudwalk-ftp-app',
    components: {
        folder
    },
    data() {
        return {
            form: {
                host: '',
                user: '',
                password: '',
                port: ''
            },
            folderData: [],
            currentPath: '',
            isLogin: false,
            loading: false,
            host: '',
            port: '',
            closed: false,
            rules: {
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
        }
    },
    mounted() {
        this.getUserInfo();
        this.initCloseHandler();
    },
    methods: {
        async sendConnect() {
            try {
                const valid = await new Promise(resolve => {
                    this.$refs.form.validate(valid => resolve(valid));
                });

                if (!valid) return;

                this.loading = true;
                const res = await this.$get('startFtp', this.form);
                this.loading = false;

                if (res.code === '0000000') {
                    this.isLogin = true;
                    this.folderData = res.data;
                    this.currentPath = res.currentPath;
                    return 'ok';
                } else {
                    this.$message.error(res.msg + '请检查登录项是否填写正确！');
                    return 'err';
                }
            } catch (error) {
                this.loading = false;
                this.$message.error('连接失败：' + error.message);
                return 'err';
            }
        },
        initCloseHandler() {
            window.onbeforeunload = (e) => {
                if (this.closed) return;
                
                e.preventDefault();
                e.returnValue = '';

                this.$confirm('确认退出本应用吗？', '退出程序', {
                    type: 'warning',
                }).then(() => {
                    this.closed = true;
                    ipcRenderer.send('close');
                }).catch(() => {
                    // User canceled
                });
            };
        },
        async getUserInfo() {
            ipcRenderer.send('userInfoGet');
            ipcRenderer.on('userInfoSend', async (event, {message, data}) => {
                if (message === 'infoUpdated') {
                    this.convertParams(data);
                    try {
                        await this.sendConnect();
                        this.$refs.folder.addFile();
                    } catch (error) {
                        this.$message.error('自动登录失败：' + error.message);
                    }
                }
            });
        },
        convertParams(params) {
            const searchParams = new URLSearchParams(params);
            this.form.host = searchParams.get('host') || this.form.host;
            this.form.user = searchParams.get('username') || this.form.user;
            this.form.password = searchParams.get('password') || this.form.password;
            this.form.port = searchParams.get('port') || this.form.port;
        }
    }
}
</script>

<style scoped lang="less">
.connection {
    display: flex;
    position: fixed;
    flex-direction: column;
    text-align: center;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background-color: #fff;

    .logo {
        font-size: 40px;
        padding: 10px 0;
        line-height: 40px;

        .gray {
            vertical-align: middle;
        }
    }

    .main-content {
        padding: 20px;
        flex: 1;
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
    }

    .tr {
        text-align: right;
    }
}
</style>
