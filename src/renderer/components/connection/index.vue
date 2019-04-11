<template>
    <div class="connection" id="connection">
        <div class="title-bar">批量上传工具
            <div class="window-button">
                <span @click="minimize">
                    <i class="el-icon-minus"></i>
                </span>
                <span @click="maximize">
                    <i class="fa fa-window-maximize" v-show="normalState"></i>
                    <i class="fa fa-window-restore" v-show="!normalState"></i>
                </span>
                <span @click="close" class="close">
                    <i class="el-icon-close"></i>
                </span>
                <!--el-icon-close-->
            </div>
        </div>
        <!--登录ftp-->
        <div class="main-content" v-loading="loading">
            <div v-show="!isLogin" class="logo">
                <i class="el-icon-upload"></i>
                |
                <img class="gray" src="./facebigdata.png" width="36" alt="">
            </div>
            <el-form v-show="!isLogin" ref="form" :model="form" label-position="top" label-width="80px">
                <el-row :gutter="20">
                    <el-col :span="6">
                        <el-form-item label="请输入IP">
                            <el-input v-model="form.host" placeholder="请输入IP"></el-input>
                        </el-form-item>
                    </el-col>
                    <el-col :span="6">
                        <el-form-item label="请输入用户名">
                            <el-input v-model="form.user" placeholder="请输入用户名"></el-input>
                        </el-form-item>
                    </el-col>
                    <el-col :span="6">
                        <el-form-item label="请输入密码">
                            <el-input v-model="form.password" placeholder="请输入密码"></el-input>
                        </el-form-item>
                    </el-col>
                    <el-col :span="6">
                        <el-form-item label="请输入端口">
                            <el-input v-model="form.port" placeholder="请输入端口"></el-input>
                        </el-form-item>
                    </el-col>
                </el-row>
                <el-row class="tr">
                    <el-form-item>
                        <el-button type="primary" plain @click="sendConnect">连接</el-button>
                    </el-form-item>
                </el-row>
            </el-form>
            <folder v-show=" isLogin"
                    :host="platform.face_host"
                    :isLogin="isLogin"
                    :defaultData="folderData"
                    :currentPath="currentPath"
                    @logout="folderData = []; isLogin = false"></folder>
        </div>
        <!--登录到火眼-->
        <el-dialog center
                   title="登录火眼"
                   width="70%"
                   :visible.sync="dialogVisible"
                   :modal-append-to-body="false"
                   :show-close="false">
            <el-form ref="platform"
                     :model="platform"
                     :rules="[]">
                <el-row :gutter="20">
                    <el-col :span="8">
                        <el-form-item label="火眼地址"
                                      prop="face_host"
                                      :rules="{required: true, message: '地址不能为空', trigger: 'blur'}">
                            <el-input v-model="platform.face_host" placeholder="请输入火眼地址"></el-input>
                        </el-form-item>
                    </el-col>
                    <el-col :span="8">
                        <el-form-item label="请输入用户名"
                                      prop="face_user"
                                      :rules="{required: true, message: '用户名不能为空', trigger: 'blur'}">
                            <el-input v-model="platform.face_user" placeholder="请输入用户名"></el-input>
                        </el-form-item>
                    </el-col>
                    <el-col :span="8">
                        <el-form-item label="请输入密码"
                                      prop="face_password"
                                      :rules="{required: true, message: '密码不能为空', trigger: 'blur'}">
                            <el-input v-model="platform.face_password" placeholder="请输入密码" type="password"></el-input>
                        </el-form-item>
                    </el-col>
                </el-row>
            </el-form>
            <span slot="footer" class="dialog-footer">
                <el-button @click="resetCloudwalk();dialogVisible = false;" v-loading="faceLoading">取 消</el-button>
                <el-button type="primary" @click="loginToCloudWalk" v-loading="faceLoading">确 定</el-button>
            </span>
        </el-dialog>
    </div>
</template>

<script>
    const {ipcRenderer} = require('electron');
    import folder from '../folder/index';
    import md5 from 'js-md5';

    export default {
        name: 'connection',
        data() {
            return {
                form: {
                    host: '192.168.10.29',
                    user: 'jfedu1',
                    password: '123456',
                    port: 21,
                    parser: 'utf-8'
                },
                platform: {
                    face_host: '192.168.10.29',
                    face_user: 'admin',
                    face_password: 'cloudwalk_eye'
                },
                folderData: [],
                currentPath: '',
                isLogin: false,
                // 窗口未最大化
                normalState: true,

                // 登录火眼弹窗
                dialogVisible: false,

                loading: false,
                faceLoading: false
            }
        },
        components: {
            folder
        },
        mounted() {
            this.updateProgram();
            this.updateConfirm();
            this.getUserInfo();
        },
        methods: {
            // 登录ftp
            sendConnect() {
                this.loading = true;
                this.$get('startFtp', this.form)
                    .then(res => {
                        this.loading = false;
                        if (res.code === '0000000') {
                            this.folderData = res.data;
                            this.currentPath = res.currentPath;
                            // 登录火眼界面
                            this.dialogVisible = true;
                        } else {
                            this.$message.error(res.msg + '请检查登录项是否填写正确！')
                        }
                    })
            },
            // 登录火眼
            loginToCloudWalk() {
                this.$refs.platform.validate(valid => {
                    if (valid) {
                        let host = this.platform.face_host.split(':')[0];
                        this.faceLoading = true;
                        this.$_post(`http://${host}:10002/facebigdata/auth/login`, {
                            password: md5(this.platform.face_password),
                            username: "admin"
                        })
                            .then(res => {
                                this.faceLoading = false;
                                sessionStorage.setItem('cloudwalk-token', res.data.token);
                                this.isLogin = true;
                                this.dialogVisible = false;
                                this.$nextTick(() => {
                                    this.resetCloudwalk();
                                })
                            })
                            .catch(err => {
                                this.faceLoading = false;
                                this.$message.error('登录火眼失败，' + err.message);
                            })
                    }
                })

            },
            // resetFields
            resetCloudwalk() {
                this.$refs.platform.resetFields();
            },
            // 最小化
            minimize() {
                ipcRenderer.send('minimize');
            },
            // 关闭
            close() {
                this.$confirm('确认退出本应用吗？', '退出程序', {
                    type: 'warning',
                })
                    .then(_ => {
                        ipcRenderer.send('close')
                        done();
                    })
            },
            // 最大化
            maximize() {
                ipcRenderer.send('maximize');
                this.normalState = !this.normalState;
            },
            // 更新app
            updateProgram() {
                ipcRenderer.send('update')
            },
            updateConfirm() {
                ipcRenderer.on('message', (event, {message, data}) => {
                    if (message === 'isUpdateNow') {
                        if (confirm('是否现在更新？')) {
                            ipcRenderer.send('updateNow');
                        }
                    }
                });
            },
            // getUserInfo
            getUserInfo() {
                ipcRenderer.send('userInfoGet');
                ipcRenderer.on('userInfoSend', (event, {message, data}) => {
                    if (message === 'infoUpdated') {
                        console.log(event)
                        console.log(message)
                        console.log(data)
                        this.convertParams(data)
                    }
                });
            },
            // 转换
            convertParams (params) {
                let searchParams = new URLSearchParams(params);
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
        background-color: #FFF;

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
            }
        }

        .main-content {
            flex: 1;
            padding: 30px;
        }

        .title-bar {
            height: 30px;
            line-height: 30px;
            background-color: rgba(0, 0, 0, .5);
            color: rgba(255, 255, 255, 0.9);
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
    .connection .el-form--label-top .el-form-item__label {
        padding: 0;
    }

    .tr {
        text-align: right;
    }
</style>
