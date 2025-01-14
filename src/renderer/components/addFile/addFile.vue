<template>
  <div class="add-file">
    <el-dialog
      v-model="dialogVisible"
      title="上传文件"
      width="500px"
      :before-close="handleClose">
      <el-upload
        class="upload-demo"
        drag
        action="/upload"
        :headers="headers"
        :data="uploadData"
        :on-success="handleSuccess"
        :on-error="handleError"
        multiple>
        <el-icon class="el-icon--upload"><upload-filled /></el-icon>
        <div class="el-upload__text">
          拖拽文件到此处或 <em>点击上传</em>
        </div>
        <template #tip>
          <div class="el-upload__tip">
            支持多文件上传
          </div>
        </template>
      </el-upload>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { ElMessage } from 'element-plus'
import { UploadFilled } from '@element-plus/icons-vue'

interface Props {
  host?: string
  port?: string
  currentPath?: string
}

const props = withDefaults(defineProps<Props>(), {
  host: '',
  port: '',
  currentPath: ''
})

const emit = defineEmits(['uploadSuccess'])

const dialogVisible = ref(false)

const headers = {
  'X-Requested-With': 'XMLHttpRequest'
}

const uploadData = {
  host: props.host,
  port: props.port,
  currentPath: props.currentPath
}

const handleSuccess = (response: any) => {
  if (response.code === 0) {
    ElMessage.success('上传成功')
    emit('uploadSuccess')
  } else {
    ElMessage.error(response.msg || '上传失败')
  }
  dialogVisible.value = false
}

const handleError = () => {
  ElMessage.error('上传失败')
  dialogVisible.value = false
}

const handleClose = () => {
  dialogVisible.value = false
}

const showDialog = () => {
  dialogVisible.value = true
}

defineExpose({
  showDialog
})
</script>

<style scoped lang="less">
.add-file {
  .upload-demo {
    text-align: center;
  }
}
</style>
