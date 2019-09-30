<template>
    <div class="connection" id="connection">
        <!--<div class="title-bar">离线视频上传工具-->
            <!--<div class="window-button">-->
                <!--<span @click="minimize">-->
                    <!--<i class="el-icon-minus"></i>-->
                <!--</span>-->
                <!--<span @click="maximize">-->
                    <!--<i class="fa fa-window-maximize" v-show="normalState"></i>-->
                    <!--<i class="fa fa-window-restore" v-show="!normalState"></i>-->
                <!--</span>-->
                <!--<span @click="close" class="close">-->
                    <!--<i class="el-icon-close"></i>-->
                <!--</span>-->
                <!--&lt;!&ndash;el-icon-close&ndash;&gt;-->
            <!--</div>-->
        <!--</div>-->
        <!--登录ftp-->
        <div class="main-content"
             v-loading="loading"
             element-loading-text="connect to ftp server，plz wait...">
            <div v-show="!isLogin" class="logo">
                <img class="gray" src="./application.png" width="50" alt="">
            </div>
            <el-form v-show="!isLogin"
                     ref="form"
                     :model="form"
                     :rules="{}"
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
                        <!--<el-button type="primary" plain @click="updateProgram">updateProgram</el-button>-->
                    </el-form-item>
                </el-row>
            </el-form>
            <folder v-show="isLogin"
                    ref="folder"
                    :host="form.host"
                    :port="port"
                    :isLogin="isLogin"
                    :defaultData="folderData"
                    :currentPath="currentPath"
                    @logout="folderData = []; isLogin = false"></folder>
        </div>
    </div>
</template>

<script>
    const {ipcRenderer} = require('electron');
    import folder from '@/components/folder';
    import form from '../../config/serverInfo.js';
    export default {
        name: 'connection',
        data() {
            return {
                form: {
                    ...form
                },
                folderData: [],
                currentPath: '',
                isLogin: false,
                // 窗口未最大化
                normalState: true,
                loading: false,
                host: '',
                port: '',
                closed: false
            }
        },
        components: {
            folder
        },
        mounted() {
            this.getUserInfo();
            this.close();
        },
        methods: {
            // 登录ftp
            async sendConnect() {
                return new Promise((resolve, reject) => {
                    this.$refs.form.validate(async (valid) => {
                        if (valid) {
                            this.loading = true;
                            await this.$get('startFtp', this.form)
                              .then(res => {
                                  this.loading = false;
                                  if (res.code === '0000000') {
                                      this.isLogin = true;
                                      this.folderData = res.data;
                                      this.currentPath = res.currentPath;
                                      resolve('ok')
                                  } else {
                                      this.$message.error(res.msg + '请检查登录项是否填写正确！')
                                      resolve('err')
                                  }
                              })
                        }
                    });
                })
            },
            // 关闭
            close() {
                return;
                window.onbeforeunload = (e) => {
                    if (this.closed) {
                        return;
                    }
                    e.returnValue = false;
                    this.$confirm('确认退出本应用吗？', '退出程序', {
                        type: 'warning',
                    })
                      .then(_ => {
                          this.closed = true;
                          ipcRenderer.send('close');
                      })
                };
            },
            // 从外部url跳转到此APP
            async getUserInfo() {
                ipcRenderer.send('userInfoGet');
                ipcRenderer.on('userInfoSend', async (event, {message, data}) => {
                    if (message === 'infoUpdated') {
                        this.convertParams(data)
                        // 登录ftp
                        await this.sendConnect();
                        // 打开上传窗口
                        this.$refs.folder.addFile();
                    }
                });
            },
            // 转换
            convertParams (params) {
                let searchParams = new URLSearchParams(params);
                // ftp登录参数
                this.form.host = searchParams.get('host');
                this.form.user = searchParams.get('username');
                this.form.password = searchParams.get('password');
                this.form.port = searchParams.get('port');
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
            padding: 10px 0 10px;
            line-height: 40px;
            .gray {
                /*-webkit-filter: grayscale(100%);*/
                /*filter: grayscale(100%);*/
                vertical-align: middle;
            }

            .el-icon-upload {
                vertical-align: middle;
                color: #409eff;
                color: rgb(64, 175, 253);
            }
        }

        .main-content {
            position: relative;
            flex: 1;
            padding: 30px;
        }

        .title-bar {
            height: 30px;
            line-height: 30px;
            background-color: rgba(0, 0, 0, .5);
            color: rgba(255, 255, 255, 0.9);
            /*配置此区域拖动*/
            -webkit-app-region: drag;
            .window-button {
                position: absolute;
                right: 0;
                top: 0;
                display: flex;
                -webkit-app-region: no-drag;
                span {
                    flex: 1;
                    padding: 0 10px;
                    cursor: pointer;
                    &:hover {
                        background-color: rgba(255, 255, 255, .5);
                    }
                    &.close:hover {
                        background-color: rgba(255, 0, 0, 0.6);
                    }
                }
            }
        }
    }
</style>
<style>
    /*.el-form-item__label{*/
        /*color: #c0dcf0;*/
    /*}*/
    /*.el-form-item.is-success .el-input__inner, .el-form-item.is-success .el-input__inner:focus, .el-form-item.is-success .el-textarea__inner, .el-form-item.is-success .el-textarea__inner:focus{*/
        /*border-color: #0070c0*/
    /*}*/
    /*.el-input__inner{*/
        /*background: #04142b!important;*/
        /*color: #618aba;*/
        /*border: 1px solid #0070c0;*/
    /*}*/
    .connection .el-form--label-top .el-form-item__label {
        padding: 0;
    }

    .tr {
        text-align: right;
    }
    .el-dialog__wrapper{
        overflow: hidden;
    }
</style>
