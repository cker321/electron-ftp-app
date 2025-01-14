<template>
  <div class="home-container">
    <div class="sidebar">
      <div class="header">
        <h2>FTP File Transfer</h2>
      </div>
      <div class="actions">
        <el-button type="primary" @click="showAddFileDialog">Upload File</el-button>
        <el-button type="success" @click="showAddFolderDialog">New Folder</el-button>
      </div>
      <div class="path-nav">
        <el-breadcrumb separator="/">
          <el-breadcrumb-item 
            v-for="(item, index) in pathSegments" 
            :key="index"
            @click="navigateToPath(index)"
          >
            {{ item || 'Root' }}
          </el-breadcrumb-item>
        </el-breadcrumb>
      </div>
    </div>

    <div class="content">
      <el-table :data="fileList" style="width: 100%">
        <el-table-column prop="name" label="Name" />
        <el-table-column prop="size" label="Size" />
        <el-table-column prop="modifyTime" label="Modify Time" />
        <el-table-column label="Actions" width="200">
          <template #default="scope">
            <el-button 
              size="small" 
              type="primary" 
              @click="downloadFile(scope.row)"
              v-if="!scope.row.isDirectory"
            >
              Download
            </el-button>
            <el-button 
              size="small" 
              type="danger" 
              @click="deleteFile(scope.row)"
            >
              Delete
            </el-button>
          </template>
        </el-table-column>
      </el-table>
    </div>

    <!-- Upload File Dialog -->
    <el-dialog v-model="addFileDialogVisible" title="Upload File" width="30%">
      <AddFile @close="addFileDialogVisible = false" @success="handleUploadSuccess" />
    </el-dialog>

    <!-- New Folder Dialog -->
    <el-dialog v-model="addFolderDialogVisible" title="New Folder" width="30%">
      <AddFolder @close="addFolderDialogVisible = false" @success="handleFolderSuccess" />
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useStore } from '../store'
import { ElMessage } from 'element-plus'
import AddFile from '../components/addFile.vue'
import AddFolder from '../components/addFolder.vue'

const store = useStore()
const addFileDialogVisible = ref(false)
const addFolderDialogVisible = ref(false)
const fileList = ref([])

// 计算当前路径的各个段
const pathSegments = computed(() => {
  return store.currentPath.split('/').filter(Boolean)
})

// 导航到指定路径
const navigateToPath = (index: number) => {
  const newPath = '/' + pathSegments.value.slice(0, index + 1).join('/')
  store.setCurrentPath(newPath)
  fetchFileList()
}

// 显示上传文件对话框
const showAddFileDialog = () => {
  addFileDialogVisible.value = true
}

// 显示新建文件夹对话框
const showAddFolderDialog = () => {
  addFolderDialogVisible.value = true
}

// 处理文件上传成功
const handleUploadSuccess = () => {
  addFileDialogVisible.value = false
  fetchFileList()
  ElMessage.success('File uploaded successfully')
}

// 处理新建文件夹成功
const handleFolderSuccess = () => {
  addFolderDialogVisible.value = false
  fetchFileList()
  ElMessage.success('Folder created successfully')
}

// 下载文件
const downloadFile = (file: any) => {
  // TODO: 实现文件下载逻辑
  ElMessage.success(`Downloading ${file.name}`)
}

// 删除文件
const deleteFile = (file: any) => {
  // TODO: 实现文件删除逻辑
  ElMessage.success(`Deleted ${file.name}`)
}

// 获取文件列表
const fetchFileList = () => {
  // TODO: 实现获取文件列表逻辑
  fileList.value = [
    {
      name: 'test.txt',
      size: '1KB',
      modifyTime: '2024-01-14 10:00:00',
      isDirectory: false
    },
    {
      name: 'docs',
      size: '-',
      modifyTime: '2024-01-14 09:00:00',
      isDirectory: true
    }
  ]
}

onMounted(() => {
  fetchFileList()
})
</script>

<style lang="less" scoped>
.home-container {
  height: 100vh;
  display: flex;
  flex-direction: column;

  .sidebar {
    padding: 20px;
    background-color: #f5f7fa;
    border-bottom: 1px solid #e6e6e6;

    .header {
      margin-bottom: 20px;
      h2 {
        margin: 0;
        color: #303133;
      }
    }

    .actions {
      margin-bottom: 20px;
      display: flex;
      gap: 10px;
    }

    .path-nav {
      margin-bottom: 20px;
    }
  }

  .content {
    flex: 1;
    padding: 20px;
    overflow: auto;
  }
}

:deep(.el-breadcrumb__item) {
  cursor: pointer;
  &:hover {
    color: #409eff;
  }
}
</style>
