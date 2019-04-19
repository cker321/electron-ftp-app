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
        <div class="main-content"
             v-loading="loading"
             element-loading-text="ftp登陆中，请稍等">
            <div v-show="!isLogin" class="logo">
                <i class="el-icon-upload"></i>
                |
                <img class="gray" src="./facebigdata.png" width="36" alt="">
            </div>
            <el-form v-show="!isLogin"
                     ref="form"
                     :model="form"
                     :rules="[]"
                     label-position="top"
                     label-width="80px">
                <el-row :gutter="20">
                    <el-col :span="6">
                        <el-form-item label="请输入IP"
                                      prop="host"
                                      :rules="{required: true, message: 'IP不能为空', trigger: 'blur'}">
                            <el-input v-model="form.host" placeholder="请输入IP"></el-input>
                        </el-form-item>
                    </el-col>
                    <el-col :span="6">
                        <el-form-item label="请输入用户名"
                                      prop="user"
                                      :rules="{required: true, message: '用户名不能为空', trigger: 'blur'}">
                            <el-input v-model="form.user" placeholder="请输入用户名"></el-input>
                        </el-form-item>
                    </el-col>
                    <el-col :span="6">
                        <el-form-item label="请输入密码"
                                      prop="password"
                                      :rules="{required: true, message: '密码不能为空', trigger: 'blur'}">
                            <el-input v-model="form.password" placeholder="请输入密码"></el-input>
                        </el-form-item>
                    </el-col>
                    <el-col :span="6">
                        <el-form-item label="请输入端口"
                                      prop="port"
                                      :rules="{required: true, message: '端口不能为空', trigger: 'blur'}">
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
            <folder v-show="isLogin"
                    ref="folder"
                    :host="host"
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
                <el-button type="primary" @click="loginToCloudWalk()" v-loading="faceLoading">确 定</el-button>
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
                    host: '',
                    user: '',
                    password: '',
                    port: '',
                    parser: 'utf-8'
                },
                platform: {
                    face_host: '',
                    face_user: '',
                    face_password: ''
                },
                folderData: [],
                currentPath: '',
                isLogin: false,
                // 窗口未最大化
                normalState: true,

                // 登录火眼弹窗
                dialogVisible: false,

                loading: false,
                faceLoading: false,

                host: '',

                // 自动跳转目录全路径
                changePathFull: '/dev/shm'
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
            async sendConnect() {
                this.$refs.form.validate(async (valid) => {
                    if (valid) {
                        this.loading = true;
                        await this.$get('startFtp', this.form)
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
                    }
                });
            },
            // 登录火眼
            async loginToCloudWalk(alreadyMD5 = false) {
                debugger
                this.$refs.platform.validate(async (valid) => {
                    if (valid) {
                        let host = this.platform.face_host.split(':')[0];
                        this.faceLoading = true;
                        await this.$_post(`http://${host}:10002/facebigdata/auth/login`, {
                            password: alreadyMD5 ? this.platform.face_password : md5(this.platform.face_password),
                            username: "admin"
                        })
                            .then(res => {
                                this.faceLoading = false;
                                this.host = this.platform.face_host;
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
                        ipcRenderer.send('close');
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
            // 从火眼url跳转到此APP
            async getUserInfo() {
                ipcRenderer.send('userInfoGet');
                ipcRenderer.on('userInfoSend', async (event, {message, data}) => {
                    if (message === 'infoUpdated') {
                        this.convertParams(data)
                        // 登录ftp
                        await this.sendConnect();
                        // 登录火眼
                        await this.loginToCloudWalk(true);
                        // 跳转到默认目录
                        await this.$refs.folder.autoChangePathFull(this.changePathFull);
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
                // 火眼登录参数
                this.platform.face_host = searchParams.get('faceHost')
                this.platform.face_user = searchParams.get('faceUser')
                this.platform.face_password = searchParams.get('facePassword');
                // 跳转目录
                this.changePathFull = searchParams.get('changePathFull');
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
    .connection .el-form--label-top .el-form-item__label {
        padding: 0;
    }

    .tr {
        text-align: right;
    }
</style>
