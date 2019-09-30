<template>
    <div class="updater">
        <el-button round
                   type="info"
                   :disabled="loading"
                   @click="updateProgram"
                   :icon="loading ?'el-icon-loading' : 'el-icon-refresh'">
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
                loading: false,
                updateStatus: false,
                buttonText: 'Check For Update'
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
                    this.loading = true;
                    console.log(data);
                    console.log(message);
                    switch (message) {
                        case 'isUpdateNow':
                            confirm('Want to install new package now?') && ipcRenderer.send('updateNow');
                            this.buttonText = 'Downloaded';
                            this.loading = false;
                            break;
                        case 'error':
                            this.buttonText = 'No update';
                            this.loading = false;
                            break;
                        case 'checking-for-update':
                            this.buttonText = 'Checking update...';
                            break;
                        case 'downloadProgress':
                            this.buttonText = `downloaded: ${data.percent.toFixed(2)}% speed: ${(data.bytesPerSecond/ 1024).toFixed(2)} kb/s`;
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
