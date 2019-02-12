<style scoped>

</style>

<template>
    <el-dialog
            title="提示"
            :visible.sync="dialogVisible"
            width="50%"
            :modal-append-to-body="false"
            :before-close="handleClose">
        <span slot="title">新建文件夹
            <i class></i>
        </span>
        <div class="body">
            <el-input placeholder="请输入文件夹名称" v-model="defaultForm.newFolder"></el-input>
        </div>
        <span slot="footer" class="dialog-footer">
            <el-button @click="dialogVisible = false">取 消</el-button>
            <el-button type="primary" @click="handleOk">确 定</el-button>
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
                }
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
            handleOk () {
                if (this.defaultForm.newFolder === '') {
                    this.$message.success('请填写完整！');
                    return;
                }
                this.$get('newFolder', {newFolder: this.defaultForm.newFolder})
                    .then(res => {
                        this.hideDialog();
                        this.$message.success('上传成功！');
                        this.$emit('uploadSuccess')
                    })
            }
        }
    }
</script>
