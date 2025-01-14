<style lang="less">
    .vue-treeselect {
        margin-left: 10px;
    }

    .el-upload-dragger {
        width: 100%
    }
    .upload-demo{
        padding-left: 10px;
    }
    .el-upload{
        width: 100%;
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
            <el-form ref="defaultForm" :model="defaultForm" label-width="80">
                <el-form-item label="上传文件：">
                    <el-upload
                        class="upload-demo"
                        drag
                        action="''"
                        :before-upload="handleBeforeUpload"
                        :file-list="fileList">
                        <i class="el-icon-upload"></i>
                        <div class="el-upload__text">将文件拖到此处，或<em>点击上传</em></div>
                    </el-upload>
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
    export default {
        name: 'addFile',
        props: {
            host: {
                type: String,
                default: ''
            },
            port: {
                type: String,
                default: ''
            },
            currentPath: {
                type: String,
                default: ''
            },
            tableData: {
                type: Array,
                default () {
                    return []
                }
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
                loadingText: '正在上传，请稍等，已上传：0%，速度：0M/S',
                loadingPercentage: 0
            }
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
                let filePath = [];
                this.fileList.forEach(item => {
                    filePath.push({
                        path: item.path,
                        name: item.name
                    })
                })
                this.loading = true;

                this.loadingText = '正在上传，请稍等，已上传：0%，速度：0M/S';

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
                        this.websocket.close();
                        this.$emit('uploadSuccess')
                    } else {
                        this.loadingPercentage = parseInt(data.data);
                        this.loadingText = `正在上传，请稍等，已上传：${data.data}%，速度：${data.speed}M/S`
                    }
                };
            },
            // 判断是否为相同文件
            isSameFile (filename, fileSize) {
                return this.tableData.findIndex(item => {
                    return item.name === filename && item.size === fileSize
                }) !== -1;
            }
        }
    }
</script>
