<style lang="less">
    .vue-treeselect {
        width: 550px;
        float: left;
        margin-left: 10px;
    }

    .el-upload-dragger {
        width: 550px;
    }

    .el-upload__tip {
        margin-top: -15px;
    }
    .el-upload-dragger .el-icon-upload{
        margin: 5px 0 5px;
    }
    .el-upload-dragger{
        height: 100px;
    }
    .el-upload-dragger .el-upload__text{
        line-height: 1;
    }
    .loadingModal{
        position: fixed;
        left: 0;
        top: 0;
        width: 100%;
        height: 100%;
        background: rgba(0, 0, 0, 0.8);
    }
</style>

<template>
    <el-dialog :visible.sync="dialogVisible"
               width="50%"
               :modal-append-to-body="false"
               v-loading="loading"
               :element-loading-text="loadingText"
               element-loading-background="rgba(0, 0, 0, 0.8)"
               :modal-close="false"
               :close-on-click-modal="false"
               :show-close="false">
        <div slot="title">
            <i class="el-icon-upload"></i>上传文件
        </div>
        <div class="body">
            <el-form ref="defaultForm" :model="defaultForm" :rules="rules" label-width="80">
                <el-form-item label="上传文件：">
                    <el-upload
                            class="upload-demo"
                            drag
                            :before-upload="handleBeforeUpload"
                            :file-list="fileList">
                        <i class="el-icon-upload"></i>
                        <div class="el-upload__text">将文件拖到此处，或<em>点击上传</em></div>
                    </el-upload>
                </el-form-item>
                <el-form-item label="选择单位：" prop="value">
                    <treeselect v-model="value" :options="options"/>
                </el-form-item>
            </el-form>
        </div>
        <span slot="footer" class="dialog-footer">
            <el-button @click="handleClose" :disabled="loading">取 消</el-button>
            <el-button type="primary" @click="handleOk" :disabled="loading">确 定</el-button>
        </span>
    </el-dialog>
</template>

<script>
    import Treeselect from '@riophae/vue-treeselect'
    import '@riophae/vue-treeselect/dist/vue-treeselect.css'
    const obj = {type: 6, cmd: 1};
    export default {
        name: 'addFile',
        components: {
            Treeselect
        },
        props: {
            host: {
                type: String,
                default: ''
            },
            port: {
                type: String,
                default: ''
            },
            isLogin: {
                type: Boolean,
                default: false
            },
            currentPath: {
                type: String,
                default: ''
            }
        },
        data() {
            return {
                websocket: null,
                dialogVisible: false,
                fileObj: null,
                defaultForm: {},
                fileList: [],
                loading: false,
                options: [],
                value: null,
                rules: {
                    value: [
                        { required: true, message: '选择单位', trigger: 'blur' }
                    ],
                },
                loadingText: '正在上传，请稍等，已上传：0%',
                loadingPercentage: 0
            }
        },
        watch: {
            isLogin(val) {
                val && this.getOrgList();
            }
        },
        mounted() {
            // this.getOrgList();
        },
        methods: {
            handleClose() {
                this.dialogVisible = false
                this.defaultForm = {}
                this.fileList =  []
                this.loading = false
                this.value = null
            },
            showDialog() {
                this.dialogVisible = true;
            },
            hideDialog() {
                this.dialogVisible = false;
            },
            handleBeforeUpload(file, key, fileList) {
                this.fileObj = file;
                this.fileList = [file];
                return false;
            },
            handleOk() {
                if (!this.fileObj) {
                    this.$notify.error({
                        message: '请选取视频文件',
                        offset: 50
                    });
                    return false;
                }
                if (!this.value) {
                    this.$notify.error({
                        message: '请选择所属单位！',
                        offset: 50
                    });
                    return false;
                }
                let filePath = [];
                this.fileList.forEach(item => {
                    filePath.push({
                        path: item.path,
                        name: item.name
                    })
                })

                this.loadingText = '正在上传，请稍等，已上传：0%';

                this.loading = true;

                this.websocket = new WebSocket('ws://localhost:1300');

                this.websocket.onopen = (evt) => {
                    if (evt.type === 'open') {
                        // 延迟发送
                        setTimeout(() => {
                            this.websocket.send(JSON.stringify({
                                path: filePath
                            }));
                        }, 500);
                    }
                };

                this.websocket.onmessage = (evt) => {
                    let data = JSON.parse(evt.data)
                    if (data.type === 'success') {
                        this.hideDialog();
                        this.loading = false;
                        this.$notify({
                            message: '上传成功！',
                            type: 'success',
                            offset: 50
                        });
                        data.fileName.forEach(item => {
                            this.videoAdd(item);
                        })
                        this.websocket.close();
                    } else {
                        this.loadingPercentage = parseInt(data.data);
                        this.loadingText = `正在上传，请稍等，已上传：${data.data}%`
                    }
                };

            },
            // 调用火眼接口
            videoAdd(fileName) {
                let formData = new FormData();
                let params = {
                    orgId: this.value,
                    userId: '1000',
                    remark: 'ftp工具上传',
                    path: `${this.currentPath}/${fileName}`,
                    engineTypes: [3]
                }
                Object.keys(params).map(key => {
                    formData.append(key, params[key]);
                });
                this.$_post(`http://${this.host}:11002/facebigdata/device/video/add`, formData)
                    .then(res => {
                        // this.$message.success(res.message)
                        this.$notify({
                            message: res.message,
                            type: 'success',
                            offset: 50
                        });
                        this.loading = false;
                        this.$emit('uploadSuccess')
                    })
                    .catch(err => {
                        this.$notify.error({
                            message: err.message,
                            offset: 50
                        });
                        this.loading = false;
                    })
            },
            // 获取单位
            getOrgList() {
                this.$_post(`http://${this.host}:11002/facebigdata/org/list`, {})
                    .then(res => {
                        this.initTree(res.data);
                    })
            },
            // 将数组转换为多层级对象数组
            initTree(data) {
                let temp = {};
                let tree = [];
                for (let i in data) {
                    temp[data[i].orgId] = data[i];
                    data[i].label = data[i].orgCname;
                    data[i].id = data[i].orgId;
                }
                for (let i in temp) {
                    if (temp[i].parentId) {
                        if (!temp[temp[i].parentId].children) {
                            temp[temp[i].parentId].children = [];
                        }
                        temp[temp[i].parentId].children.push(temp[i]);
                    } else {
                        tree.push(temp[i]);
                    }
                }
                this.options = tree
            }
        }
    }
</script>
<style lang="less">

</style>
