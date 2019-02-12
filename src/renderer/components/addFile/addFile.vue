<style scoped>

</style>

<template>
    <el-dialog
            :visible.sync="dialogVisible"
            width="50%"
            :modal-append-to-body="false"
            v-loading="loading"
            element-loading-text="正在上传，请稍等"
            element-loading-background="rgba(0, 0, 0, 0.8)"
            :before-close="handleClose">
        <div slot="title">
            <i class="el-icon-upload"></i>上传文件
        </div>
        <div class="body">
            <Form ref="defaultForm" :model="defaultForm" :label-width="80" action>
                <el-upload
                        class="upload-demo"
                        drag
                        action="http://localhost:3009/fileUpload"
                        :before-upload="handleBeforeUpload"
                        :file-list="fileList"
                        multiple >
                    <i class="el-icon-upload"></i>
                    <div class="el-upload__text">将文件拖到此处，或<em>点击上传</em></div>
                    <div class="el-upload__tip" slot="tip">只能上传avi/mp4文件，且不超过500M</div>
                </el-upload>
            </Form>
        </div>
        <span slot="footer" class="dialog-footer">
            <el-button @click="dialogVisible = false">取 消</el-button>
            <el-button type="primary" @click="handleOk" :disabled="loading">确 定</el-button>
        </span>
    </el-dialog>
</template>

<script>
    export default {
        name: 'addFile',
        props: {},
        data () {
            return {
                dialogVisible: false,
                fileObj: null,
                defaultForm: {},
                fileList: [],
                loading: false
            }
        },
        methods: {
            handleClose(done) {
                this.$confirm('确认关闭？')
                    .then(_ => {
                        done();
                    })
                    .catch(_ => {});
            },
            showDialog () {
                this.dialogVisible = true;
            },
            hideDialog() {
                this.dialogVisible = false;
            },
            handleBeforeUpload (file, key, fileList) {
                this.fileObj = file;
                this.fileList.push(file)
                return false;
            },
            handleOk () {
                if (!this.fileObj) {
                    this.$message.error('请选取视频文件！');
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
                        this.loading = false;
                        this.$emit('uploadSuccess')
                    })
                    .catch(err => {
                        this.$message.success(err);
                        this.loading = false;
                    })
            }
        }
    }
</script>
