<template>
    <div class="folder"
         v-loading="loading">
        <div class="host">
            <el-tag type="success" closable @close="logOut">Connected to：{{host}}</el-tag>
        </div>
        <div class="currentPath">
            <el-button type="text" disabled>Root</el-button>
            <span class="chevron">
                    <i class="fa fa-chevron-right" style="font-size: 12px; padding: 0 5px"></i>
            </span>
            {{newCurrentPath}}
            <span v-for="(item, key) in newCurrentPath">
                <el-button type="text"
                           :disabled="item === 'dev' || item === ''"
                           @click="changePathFull(key)">{{item}}</el-button>
                <span class="chevron" v-if="key !== 0">
                    <i class="fa fa-chevron-right" style="font-size: 12px; padding: 0 5px"></i>
                </span>
            </span>
        </div>
        <div class="toolBar">
            <el-button type="text" style="margin-right: 10px;" icon="fa fa-toggle-up" @click="back"
                       :disabled="newCurrentPath.length <= 3"> Backward
            </el-button>
            <el-button type="text" style="margin-right: 10px;" icon="fa fa-folder" @click="addFolder"> New Folder</el-button>
            <el-button type="text" icon="fa fa-cloud-upload" @click="addFile"> Update New File</el-button>
        </div>
        <el-table
                :data="tableData"
                max-height="500"
                :style="{width: '100%', height: tableHeight}">
            <el-table-column prop="name" label="文件夹 / 名">
                <template slot-scope="props">
                    <el-button style="width: 100%; text-align: left"
                               type="text"
                               @click="changePath(props.row.name)"
                               v-if="props.row.type !== 'd'" disabled><i class="fa fa-file"></i>&nbsp;{{props.row.name}}
                    </el-button>
                    <el-button
                            v-else
                            style="width: 100%; text-align: left"
                            type="text"
                            @click="changePath(props.row.name)"><i class="fa fa-folder"></i>&nbsp;{{props.row.name}}
                    </el-button>
                </template>
            </el-table-column>
            <el-table-column
                    prop="size"
                    width="100"
                    label="大小">
                <template slot-scope="props">
                    {{getFileSize(props.row)}}
                </template>
            </el-table-column>
            <el-table-column
                    prop="date"
                    width="200"
                    label="修改日期">
                <template slot-scope="props">
                    {{new Date((new Date(props.row.date)).getTime() + 8 * 3600 * 1000).toLocaleString()}}
                </template>
            </el-table-column>
            <el-table-column
                    width="200"
                    label="操作">
                <template slot-scope="props">
                    <!--<el-button v-if="props.row.type === 'd'" @click="rmdir(props.row.name)" type="text">删除目录</el-button>-->
                    <!--<el-button v-else @click="rmfile(props.row.name)" type="text">删除文件</el-button>-->
                    <el-button v-if="props.row.type !== 'd'" @click="rmfile(props.row.name)" type="text">删除文件</el-button>
                    <span v-else>-</span>
                </template>
            </el-table-column>
        </el-table>
        <addFile ref="addFile"
                 :host="host"
                 :port="port"
                 :isLogin="isLogin"
                 :currentPath="newCurrentPath && newCurrentPath.join('/')"
                 :tableData="tableData"
                 dialogVisible="dialogVisible"
                 @uploadSuccess="handleUploadSuccess"></addFile>
        <addFolder ref="addFolder"
                   dialogVisible="dialogVisible"
                   @uploadSuccess="handleUploadSuccess"></addFolder>
    </div>
</template>

<script>
    import addFile from '../addFile/addFile'
    import addFolder from '../addFolder/addFolder'

    export default {
        name: 'folder',
        components: {
            addFile,
            addFolder
        },
        data() {
            return {
                tableData: [],
                newCurrentPath: '',
                dialogVisible: false,
                loading: false,
                loadingAnimate: false,
                windowHeight: window.outerHeight
            }
        },
        computed: {
            getFileSize(item) {
                return function (item) {
                    if (item.type === 'd') {
                        return '-'
                    }
                    // kb
                    let size = item.size / 1024;
                    size = (size >= (1000 * 1024) ? (size/1024/1024).toFixed(2) + 'GB' : size >= 500 ? (size / 1024).toFixed(2) + 'MB' : size.toFixed(2) + 'KB');
                    return size
                }
            },
            tableHeight () {
                return this.windowHeight - 170 + 'px'
            }
        },
        props: {
            defaultData: {
                type: Array,
                default() {
                    return []
                }
            },
            currentPath: {
                type: String,
                default: ''
            },
            host: {
                type: String,
                default: 'localhost'
            },
            port: {
                type: String,
                default: 'localhost'
            },
            isLogin: {
                type: Boolean,
                default: false
            }
        },
        watch: {
            defaultData(val) {
                this.tableData = val;
            },
            currentPath(val) {
                this.newCurrentPath = val;
                this.splitPath();
            }
        },
        methods: {
            logOut() {
                this.$confirm(`确认退出登录吗？`, '确认退出', {
                    type: 'warning'
                }).then(_ => {
                    this.$get('logout', {})
                        .then(res => {
                            if (res.code === '0000000') {
                                // this.$message.success('退出登录成功！')
                                this.$notify({
                                    message: '退出登录成功！',
                                    type: 'success',
                                    offset: 50
                                });
                                this.$router.push({
                                    name: 'connection'
                                })
                                this.$emit('logout');
                                this.newCurrentPath = [];
                            } else {
                                this.$notify.error({
                                    message: '退出失败',
                                    offset: 50
                                });
                            }
                        })
                })
            },
            addFile() {
                this.$refs.addFile.showDialog();
            },
            addFolder() {
                this.$refs.addFolder.showDialog();
            },
            back() {
                this.changePathFull(this.newCurrentPath.length - 2)
            },
            changePath(path) {
                this.loading = true;
                this.$get('changeDirectory', {path})
                    .then(res => {
                        this.newCurrentPath = res.currentPath;
                        this.tableData = res.data;
                        this.splitPath();
                        // 跳转到folder
                        this.loading = false;
                    })
                    .catch(() => {
                        this.loading = false;
                    })
            },
            rmdir(path) {
                this.$confirm(`确认删除${path}文件夹？`, '确认删除', {
                    type: 'warning'
                })
                    .then(_ => {
                        this.$get('removeDirectory', {deleteFolder: path})
                            .then(res => {
                                this.$notify({
                                    message: '删除成功',
                                    type: 'success',
                                    offset: 50
                                });
                                this.handleUploadSuccess();
                            })
                    });
            },
            rmfile(path) {
                this.$confirm(`确认删除${path}文件？`, '确认删除', {
                    type: 'warning'
                })
                    .then(_ => {
                        this.$get('deleteFile', {fileName: path})
                            .then(res => {
                                this.$notify({
                                    message: '删除成功',
                                    type: 'success',
                                    offset: 50
                                });
                                this.handleUploadSuccess();
                            })
                    });
            },
            splitPath() {
                this.newCurrentPath = this.newCurrentPath.split('/');
            },
            changePathFull(key) {
                this.loading = true;
                let fullPath = '';
                for (let i = 0; i <= key; i++) {
                    if (i == key) {
                        fullPath += this.newCurrentPath[i]
                    } else {
                        fullPath += this.newCurrentPath[i] + '/'
                    }
                }
                this.$get('changeDirectoryFull', {fullPath})
                    .then(res => {
                        this.loading = false;
                        this.newCurrentPath = fullPath;
                        this.tableData = res.data;
                        this.splitPath();
                    })
                    .catch(() => {
                        this.loading = false;
                    })
            },
            async autoChangePathFull (pathFull) {
                this.loadingAnimate = this.$loading({
                    lock: true,
                    text: '正在跳转到指定目录，请稍等'
                });
                await this.$get('changeDirectoryFull', {fullPath: pathFull})
                    .then(res => {
                        this.loading = false;
                        this.newCurrentPath = pathFull;
                        this.tableData = res.data;
                        this.splitPath();
                    })
                    .catch(() => {
                        this.loading = false;
                    })
                this.loadingAnimate.close();
            },
            handleUploadSuccess() {
                this.changePathFull(this.newCurrentPath.length - 1)
            }
        },
        mounted () {
            window.addEventListener('resize', () => {
                this.windowHeight = window.outerHeight
                // console.log(window.outerHeight)
            })
        }
    }
</script>
<style scoped lang="less">
    .folder {
        .fl {
            float: left;
        }
        .host {
            color: #ccc;
            padding-bottom: 10px;
            margin-bottom: 10px;
            position: absolute;
            left: 0;
            top: 0;
        }

        .currentPath {
            line-height: 25px;
            text-align: center;

            .el-button {
                margin-left: 0;
                padding: 0;
                font-weight: 500;
                font-size: 18px;
                font-family: Roboto, Helvetica Neue, sans-serif;
            }
        }

        .toolBar {
            padding: 10px 0;
        }
        position: relative;
        z-index: 10;
        left: 0;
        top: 0;
        right: 0;
        bottom: 0;
        background: #fff;
    }
</style>
