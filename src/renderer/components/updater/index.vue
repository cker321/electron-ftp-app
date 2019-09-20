<template>
    <div class="updater">
        <el-button round
                   icon="el-icon-refresh"
                   @click="updateProgram">
            {{buttonText}}
        </el-button>
    </div>
</template>
<script>
    const {ipcRenderer} = require('electron');

    export default {
        name: 'updater',
        data () {
            return {
                updateStatus: false,
                buttonText: '检查更新'
            }
        },
        computed: {
        },
        mounted () {
            this.updateConfirm();
        },
        methods: {
            // 更新app
            updateProgram() {
                ipcRenderer.send('update');
            },
            updateConfirm() {
                ipcRenderer.on('message', (event, {message, data}) => {
                    this.updateStatus = message;
                    console.log(message);
                    console.log(data);
                    switch (message) {
                        case 'isUpdateNow':
                            confirm('是否现在更新？') && ipcRenderer.send('updateNow');
                            break;
                        case 'error':
                            this.buttonText = '更新出错!';
                            break;
                        case 'checking-for-update':
                            this.buttonText = '检查更新中...'
                            break;
                    }
                });
            },
        }
    }
</script>
<style>
.updater{
    left: 0;
    right: 0;
    bottom: 0;
    padding: 10px;
    position: absolute;
    font-size: 12px !important;
}
</style>
