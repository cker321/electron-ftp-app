<template>
  <div class="add-folder">
    <el-dialog
      v-model="dialogVisible"
      title="新建文件夹"
      width="500px"
      :before-close="handleClose">
      <el-form
        ref="formRef"
        :model="form"
        :rules="rules"
        label-width="120px">
        <el-form-item label="文件夹名称" prop="name">
          <el-input v-model="form.name" placeholder="请输入文件夹名称" />
        </el-form-item>
      </el-form>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="handleClose">取消</el-button>
          <el-button type="primary" @click="handleSubmit">确定</el-button>
        </span>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive } from 'vue'
import { ElMessage, FormInstance } from 'element-plus'

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
const formRef = ref<FormInstance>()

const form = reactive({
  name: ''
})

const rules = {
  name: [
    { required: true, message: '请输入文件夹名称', trigger: 'blur' },
    { pattern: /^[^\\/:*?"<>|]+$/, message: '文件夹名称不能包含特殊字符', trigger: 'blur' }
  ]
}

const handleSubmit = async () => {
  if (!formRef.value) return

  try {
    await formRef.value.validate()
    const res = await window.$ajax.post('/mkdir', {
      host: props.host,
      port: props.port,
      currentPath: props.currentPath,
      name: form.name
    })

    if (res.data.code === 0) {
      ElMessage.success('创建成功')
      emit('uploadSuccess')
      dialogVisible.value = false
      form.name = ''
    } else {
      ElMessage.error(res.data.msg || '创建失败')
    }
  } catch (error) {
    console.error('Create folder error:', error)
    ElMessage.error('创建失败')
  }
}

const handleClose = () => {
  dialogVisible.value = false
  form.name = ''
}

const showDialog = () => {
  dialogVisible.value = true
}

defineExpose({
  showDialog
})
</script>

<style scoped lang="less">
.add-folder {
  .dialog-footer {
    text-align: right;
  }
}
</style>
