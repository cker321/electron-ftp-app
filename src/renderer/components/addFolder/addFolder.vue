<style scoped>

</style>

<template>
    <el-dialog
            title="提示"
            :visible.sync="dialogVisible"
            width="50%"
            :modal-append-to-body="false"
            :show-close="false">
        <span slot="title">新建文件夹
            <i class></i>
        </span>
        <div class="body">
            <el-input placeholder="请输入文件夹名称" v-model="defaultForm.newFolder"></el-input>
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
        props: {},
        data () {
            return {
                dialogVisible: false,
                defaultForm: {
                    newFolder: ''
                },
                loading: false
            }
        },
        methods: {
            handleClose(done) {
                this.defaultForm.newFolder = ''
                this.dialogVisible = false
            },
            showDialog () {
                this.dialogVisible = true;
            },
            hideDialog() {
                this.dialogVisible = false;
            },
            handleOk () {
                if (this.defaultForm.newFolder === '') {
                    this.$notify.error({message: '请填写完整！'});
                    return;
                }
                let reg = new RegExp("[^\x00-\xff]");
                if (reg.test(this.defaultForm.newFolder)) {
                    this.$notify.error({message: '文件夹名称，请勿输入中文字符串！'});
                     return;
                }
                this.loading = true;
                this.$get('newFolder', {newFolder: this.defaultForm.newFolder})
                    .then(res => {
                        this.loading = false;
                        if (res.code === '0000000') {
                            this.hideDialog();
                            this.$notify({
                                message: '上传成功！',
                                type: 'success'
                            });
                            this.$emit('uploadSuccess')
                            this.defaultForm.newFolder = '';
                        } else {
                            this.$notify.error({message: `上传失败，${res.msg}`});
                        }
                    })
            }
        }
    }
</script>
