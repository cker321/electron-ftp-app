<template>
    <div class="folder" v-loading="loading">
        <div class="host">
            <el-tag type="success" closable @close="logOut">Connected to：{{ host }}</el-tag>
        </div>
        <div class="currentPath">
            <el-button type="text" disabled>Root</el-button>
            <span class="chevron">
                <i class="fa fa-chevron-right" style="font-size: 12px; padding: 0 5px"></i>
            </span>
            <span v-for="(item, key) in pathArray" :key="key">
                <el-button 
                    type="text"
                    :disabled="item === 'dev' || item === ''"
                    @click="changePathFull(key)">{{ item }}</el-button>
                <span class="chevron" v-if="key !== pathArray.length - 1">
                    <i class="fa fa-chevron-right" style="font-size: 12px; padding: 0 5px"></i>
                </span>
            </span>
        </div>
        <div class="toolBar">
            <el-button 
                type="text" 
                style="margin-right: 10px;" 
                :icon="ArrowUp"
                @click="back"
                :disabled="pathArray.length <= 3">
                Backward
            </el-button>
            <el-button 
                type="text" 
                style="margin-right: 10px;" 
                :icon="Folder"
                @click="addFolder">
                New Folder
            </el-button>
            <el-button 
                type="text" 
                :icon="Upload"
                @click="addFile">
                Update New File
            </el-button>
        </div>
        <el-table
            :data="tableData"
            max-height="500"
            :style="{ width: '100%', height: tableHeight }">
            <el-table-column prop="name" label="文件夹 / 名">
                <template #default="{ row }">
                    <el-button 
                        style="width: 100%; text-align: left"
                        type="text"
                        @click="changePath(row.name)"
                        v-if="row.type !== 'd'" 
                        disabled>
                        <i class="fa fa-file"></i>&nbsp;{{ row.name }}
                    </el-button>
                    <el-button
                        v-else
                        style="width: 100%; text-align: left"
                        type="text"
                        @click="changePath(row.name)">
                        <i class="fa fa-folder"></i>&nbsp;{{ row.name }}
                    </el-button>
                </template>
            </el-table-column>
            <el-table-column prop="size" width="100" label="大小">
                <template #default="{ row }">{{ getFileSize(row) }}</template>
            </el-table-column>
            <el-table-column prop="date" width="200" label="修改时间" />
            <el-table-column label="操作" width="150">
                <template #default="{ row }">
                    <el-button
                        type="text"
                        size="small"
                        @click="row.type === 'd' ? rmdir(row.name) : rmfile(row.name)">
                        删除
                    </el-button>
                </template>
            </el-table-column>
        </el-table>
        <ComAddFile ref="addFileRef"
                 :host="host"
                 :port="port"
                 :isLogin="isLogin"
                 :currentPath="pathArray.join('/')"
                 :tableData="tableData"
                 dialogVisible="dialogVisible"
                 @uploadSuccess="handleUploadSuccess"></ComAddFile>
        <ComAddFolder ref="addFolderRef"
                   dialogVisible="dialogVisible"
                   @uploadSuccess="handleUploadSuccess"></ComAddFolder>
    </div>
</template>

<script setup lang="ts">
import { ref, computed, watch, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { ArrowUp, Folder, Upload } from '@element-plus/icons-vue'
import ComAddFile from '../addFile/addFile.vue'
import ComAddFolder from '../addFolder/addFolder.vue'

interface Props {
    defaultData?: any[]
    currentPath?: string
    host?: string
    port?: string
    isLogin?: boolean
}

const props = withDefaults(defineProps<Props>(), {
    defaultData: () => [],
    currentPath: '',
    host: '',
    port: '',
    isLogin: false
})

const emit = defineEmits(['logout'])

const loading = ref(false)
const tableData = ref(props.defaultData)
const pathArray = ref(props.currentPath.split('/').filter(Boolean))

const tableHeight = computed(() => {
    return window.innerHeight - 200 + 'px'
})

const getFileSize = (item: any) => {
    if (item.type === 'd') return '-'
    const size = parseInt(item.size)
    if (size < 1024) return size + 'B'
    if (size < 1024 * 1024) return (size / 1024).toFixed(2) + 'KB'
    if (size < 1024 * 1024 * 1024) return (size / 1024 / 1024).toFixed(2) + 'MB'
    return (size / 1024 / 1024 / 1024).toFixed(2) + 'GB'
}

watch(() => props.defaultData, (val) => {
    tableData.value = val
})

watch(() => props.currentPath, (val) => {
    if (val) {
        pathArray.value = val.split('/').filter(Boolean)
    }
})

const logOut = async () => {
    try {
        await ElMessageBox.confirm('确认退出登录吗？', '提示', {
            confirmButtonText: '确定',
            cancelButtonText: '取消',
            type: 'warning'
        })
        
        loading.value = true
        const res = await window.$ajax.post('/disconnect')
        if (res.data.code === 0) {
            emit('logout')
            ElMessage.success('已退出登录')
        } else {
            ElMessage.error(res.data.msg || '退出失败')
        }
    } catch (error) {
        if (error !== 'cancel') {
            console.error('Logout error:', error)
            ElMessage.error('退出失败')
        }
    } finally {
        loading.value = false
    }
}

const addFileRef = ref()
const addFolderRef = ref()
const addFile = () => {
    addFileRef.value.showDialog();
}

const addFolder = () => {
    addFolderRef.value.showDialog();
}

const back = () => {
    if (pathArray.value.length <= 3) return
    pathArray.value.pop()
    changePathFull(pathArray.value.length - 1)
}

const changePath = async (path: string) => {
    try {
        loading.value = true
        const currentPathStr = '/' + pathArray.value.join('/') + '/' + path
        const res = await window.$ajax.post('/ls', { path: currentPathStr })
        if (res.data.code === 0) {
            tableData.value = res.data.data
            pathArray.value.push(path)
        } else {
            ElMessage.error(res.data.msg || '获取目录失败')
        }
    } catch (error) {
        console.error('Change path error:', error)
        ElMessage.error('获取目录失败')
    } finally {
        loading.value = false
    }
}

const rmdir = async (path: string) => {
    try {
        await ElMessageBox.confirm('确认删除该文件夹吗？', '提示', {
            confirmButtonText: '确定',
            cancelButtonText: '取消',
            type: 'warning'
        })
        
        loading.value = true
        const currentPathStr = '/' + pathArray.value.join('/') + '/' + path
        const res = await window.$ajax.post('/rmdir', { path: currentPathStr })
        if (res.data.code === 0) {
            ElMessage.success('删除成功')
            tableData.value = res.data.data
        } else {
            ElMessage.error(res.data.msg || '删除失败')
        }
    } catch (error) {
        if (error !== 'cancel') {
            console.error('Remove directory error:', error)
            ElMessage.error('删除失败')
        }
    } finally {
        loading.value = false
    }
}

const rmfile = async (path: string) => {
    try {
        await ElMessageBox.confirm('确认删除该文件吗？', '提示', {
            confirmButtonText: '确定',
            cancelButtonText: '取消',
            type: 'warning'
        })
        
        loading.value = true
        const currentPathStr = '/' + pathArray.value.join('/') + '/' + path
        const res = await window.$ajax.post('/rmfile', { path: currentPathStr })
        if (res.data.code === 0) {
            ElMessage.success('删除成功')
            tableData.value = res.data.data
        } else {
            ElMessage.error(res.data.msg || '删除失败')
        }
    } catch (error) {
        if (error !== 'cancel') {
            console.error('Remove file error:', error)
            ElMessage.error('删除失败')
        }
    } finally {
        loading.value = false
    }
}

const changePathFull = async (key: number) => {
    try {
        if (key < 0 || key >= pathArray.value.length) return
        
        loading.value = true
        const newPath = '/' + pathArray.value.slice(0, key + 1).join('/')
        const res = await window.$ajax.post('/ls', { path: newPath })
        if (res.data.code === 0) {
            tableData.value = res.data.data
            pathArray.value = pathArray.value.slice(0, key + 1)
        } else {
            ElMessage.error(res.data.msg || '获取目录失败')
        }
    } catch (error) {
        console.error('Change path full error:', error)
        ElMessage.error('获取目录失败')
    } finally {
        loading.value = false
    }
}

const handleUploadSuccess = () => {
    changePathFull(pathArray.value.length - 1)
}

onMounted(() => {
    window.addEventListener('resize', () => {
        tableHeight.value = window.innerHeight - 200 + 'px'
    })
})
</script>

<style scoped lang="less">
.folder {
    width: 100%;
    height: 100%;
    padding: 20px;
    box-sizing: border-box;

    .host {
        margin-bottom: 20px;
    }

    .currentPath {
        margin-bottom: 20px;
        display: flex;
        align-items: center;
        flex-wrap: wrap;
    }

    .toolBar {
        margin-bottom: 20px;
    }

    .chevron {
        color: #909399;
    }

    :deep(.el-table) {
        .cell {
            .el-button {
                padding: 0;
            }
        }
    }
}
</style>
