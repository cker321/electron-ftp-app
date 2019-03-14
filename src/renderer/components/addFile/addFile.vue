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
</style>

<template>
    <el-dialog :visible.sync="dialogVisible"
               width="50%"
               :modal-append-to-body="false"
               v-loading="loading"
               element-loading-text="正在上传，请稍等"
               element-loading-background="rgba(0, 0, 0, 0.8)"
               :modal-close="false"
               :close-on-click-modal="false"
               :show-close="false">
        <div slot="title">
            <i class="el-icon-upload"></i>上传文件
        </div>
        <div class="body">
            <el-form ref="defaultForm" :model="defaultForm" :rules="rules" label-width="80" action>
                <el-form-item label="上传文件：">
                    <el-upload
                            class="upload-demo"
                            drag
                            action="http://localhost:3009/fileUpload"
                            :before-upload="handleBeforeUpload"
                            :file-list="fileList"
                            multiple>
                        <i class="el-icon-upload"></i>
                        <div class="el-upload__text">将文件拖到此处，或<em>点击上传</em></div>
                        <div class="el-upload__tip" slot="tip">只能上传avi/mp4文件，且不超过500M</div>
                    </el-upload>
                </el-form-item>
                <el-form-item label="选择单位：" prop="value">
                    <treeselect v-model="value" :options="options"/>
                </el-form-item>
            </el-form>
        </div>
        <span slot="footer" class="dialog-footer">
            <el-button @click="handleClose">取 消</el-button>
            <el-button type="primary" @click="handleOk" :disabled="loading">确 定</el-button>
        </span>
    </el-dialog>
</template>

<script>
    import Treeselect from '@riophae/vue-treeselect'
    import '@riophae/vue-treeselect/dist/vue-treeselect.css'

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
            isLogin: {
                type: Boolean,
                default: false
            }
        },
        data() {
            return {
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
                }
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
                this.fileList.push(file)
                return false;
            },
            handleOk() {
                if (!this.fileObj) {
                    this.$message.error('请选取视频文件！');
                    return false;
                }
                if (!this.value) {
                    this.$message.error('请选择所属单位！');
                    return false;
                }
                let formData = new FormData();
                this.fileList.forEach(item => {
                    formData.append('file', item);
                })
                this.loading = true;
                this.$post('fileUpload', formData)
                    .then(res => {
                        this.hideDialog();
                        this.fileList = [];
                        this.$message.success('上传成功！');
                        res.fileNames.forEach(item => {
                            this.videoAdd(item);
                        })
                    })
                    .catch(err => {
                        this.$message.success(err);
                        this.loading = false;
                    })
            },
            // 调用火眼接口
            videoAdd(fileName) {
                let formData = new FormData();
                let params = {
                    orgId: this.value,
                    userId: '1000',
                    remark: 'ftp工具上传',
                    path: `/dev/shm/offlinevideo/${fileName}`,
                }
                Object.keys(params).map(key => {
                    formData.append(key, params[key]);
                });
                this.$_post(`http://${this.host}:10002/facebigdata/device/video/add`, formData)
                    .then(res => {
                        this.$message.success(res.message)
                        this.loading = false;
                        this.$emit('uploadSuccess')
                    })
                    .catch(err => {
                        this.$message.error(err.message)
                        this.loading = false;
                    })
            },
            getOrgList() {
                this.$_post(`http://${this.host}:10002/facebigdata/org/list`, {})
                    .then(res => {
                        this.initTree(res.data);
                    })
            },
            // 将一维的扁平数组转换为多层级对象数组
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
