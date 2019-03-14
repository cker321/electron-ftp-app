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
        <div class="main-content">
            <div v-show="!folderData.length" class="logo">
                <i class="el-icon-upload"></i>
            </div>
            <el-form v-show="!folderData.length" ref="form" :model="form" label-position="top" label-width="80px">
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
            <folder v-show="folderData.length"
                :host="form.host"
                :isLogin="isLogin"
                :defaultData="folderData"
                :currentPath="currentPath"
                @logout="folderData = []"></folder>
        </div>
    </div>
</template>

<script>
    const {ipcRenderer} = require('electron');
    import folder from '../folder/index'

    export default {
        name: 'connection',
        data () {
            return  {
                form: {
                    host: '192.168.10.29',
                    user: 'jfedu1',
                    password: '123456',
                    port: 21,
                    parser: 'utf-8'
                },
                folderData: [],
                currentPath: '',
                isLogin: false,
                // 窗口未最大化
                normalState: true
            }
        },
        components: {
            folder
        },
        mounted () {
            this.updateProgram();
            this.updateConfirm();
        },
        methods: {
            sendConnect () {
                this.$get('startFtp',  this.form)
                    .then(res => {
                        this.folderData = res.data;
                        this.currentPath = res.currentPath;
                        this.isLogin = true;
                    })
            },
            minimize () {
                ipcRenderer.send('minimize');
            },
            close () {
                this.$confirm('确认退出本应用吗？', '退出程序', {
                    type: 'warning',
                })
                    .then(_ => {
                        ipcRenderer.send('close')
                        done();
                    })
            },
            maximize () {
                ipcRenderer.send('maximize');
                this.normalState = !this.normalState;
            },
            updateProgram () {
                ipcRenderer.send('update')
            },
            updateConfirm () {
                ipcRenderer.on('message',(event,{message,data}) => {
                    if (message === 'isUpdateNow') {
                        if (confirm('是否现在更新？')) {
                            ipcRenderer.send('updateNow');
                        }
                    }
                });
            }
        }
    }
</script>

<style scoped lang="less">
    .connection{
        display: flex;
        position: fixed;
        flex-direction: column;
        text-align: center;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        background-color: #FFF;
        .logo{
            font-size: 40px;
            padding: 10px 0 10px;
        }
        .main-content{
            flex: 1;
            padding: 30px;
        }
        .title-bar{
            height: 30px;
            line-height: 30px;
            background-color: rgba(0,0,0,.5);
            color: rgba(255,255,255,0.9);
            -webkit-app-region:drag;
            .window-button{
                position: absolute;
                right: 0;
                top: 0;
                display: flex;
                -webkit-app-region:no-drag;
                span {
                    flex: 1;
                    padding: 0 10px;
                    cursor: pointer;
                    &:hover{
                        background-color: rgba(255,255,255,.5);
                    }
                    &.close:hover{
                        background-color: rgba(255,0,0,0.6);
                    }
                }
            }
        }
    }
</style>
<style>
    .connection .el-form--label-top .el-form-item__label{
        padding: 0;
    }
    .tr{
        text-align: right;
    }
</style>
