<template>
    <div class="connection" id="connection">
        <div class="logo">
            <i class="el-icon-upload"></i>
        </div>
        <el-form ref="form" :model="form" label-position="top" label-width="80px">
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
        <folder :defaultData="folderData"
                :currentPath="currentPath"
                v-show="folderData.length"></folder>
    </div>
</template>

<script>
    import folder from '../folder/index'
    export default {
        name: 'connection',
        data () {
            return  {
                form: {
                    host: '192.168.10.29',
                    user: 'jfedu1',
                    password: '123456',
                    port: 21
                },
                folderData: [],
                currentPath: ''
            }
        },
        components: {
            folder
        },
        methods: {
            sendConnect () {
                this.$get('startFtp',  this.form)
                    .then(res => {
                        console.log(res.data)
                        this.folderData = res.data;
                        this.currentPath = res.currentPath;
                        // 跳转到folder
                        // this.$router.push({
                        //     name: 'folder'
                        // })
                    })
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
        padding: 30px;
        background-color: #FFF;
        .logo{
            font-size: 40px;
            padding: 20px 0 40px;
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
