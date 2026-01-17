<template>
  <div class="file-management">
    <el-card>
      <template #header>
        <div class="card-header">
          <div class="search-area">
            <el-input
              v-model="searchKeyword"
              placeholder="搜索文件名"
              clearable
              style="width: 200px"
              @clear="loadFiles"
              @keyup.enter="loadFiles"
            >
              <template #prefix>
                <el-icon><Search /></el-icon>
              </template>
            </el-input>
            <el-button type="primary" @click="loadFiles">搜索</el-button>
          </div>
        </div>
      </template>
      
      <el-table v-loading="loading" :data="files" stripe>
        <el-table-column prop="id" label="ID" width="80" />
        <el-table-column prop="originalName" label="文件名" min-width="200">
          <template #default="{ row }">
            <div class="file-name">
              <el-icon><Document /></el-icon>
              <span>{{ row.originalName }}</span>
            </div>
          </template>
        </el-table-column>
        <el-table-column prop="extension" label="扩展名" width="100" />
        <el-table-column prop="fileSizeFormatted" label="大小" width="120" />
        <el-table-column prop="folderName" label="所在文件夹" width="150" />
        <el-table-column prop="uploaderName" label="上传者" width="100" />
        <el-table-column prop="createTime" label="上传时间" width="180">
          <template #default="{ row }">
            {{ formatDate(row.createTime) }}
          </template>
        </el-table-column>
        <el-table-column label="操作" width="180" fixed="right">
          <template #default="{ row }">
            <el-button type="primary" link @click="openRenameDialog(row)">
              重命名
            </el-button>
            <el-button type="primary" link @click="openMoveDialog(row)">
              移动
            </el-button>
            <el-popconfirm
              title="确定要删除该文件吗？"
              @confirm="handleDelete(row.id)"
            >
              <template #reference>
                <el-button type="danger" link>删除</el-button>
              </template>
            </el-popconfirm>
          </template>
        </el-table-column>
      </el-table>
      
      <div class="pagination">
        <el-pagination
          v-model:current-page="pagination.page"
          v-model:page-size="pagination.size"
          :total="pagination.total"
          :page-sizes="[10, 20, 50]"
          layout="total, sizes, prev, pager, next"
          @size-change="loadFiles"
          @current-change="loadFiles"
        />
      </div>
    </el-card>
    
    <!-- 重命名对话框 -->
    <el-dialog v-model="renameDialogVisible" title="重命名文件" width="500px">
      <el-form ref="renameFormRef" :model="renameForm" :rules="renameRules" label-width="80px">
        <el-form-item label="新文件名" prop="newName">
          <el-input v-model="renameForm.newName" placeholder="请输入新文件名" />
        </el-form-item>
      </el-form>
      
      <template #footer>
        <el-button @click="renameDialogVisible = false">取消</el-button>
        <el-button type="primary" :loading="submitting" @click="handleRename">
          确定
        </el-button>
      </template>
    </el-dialog>
    
    <!-- 移动对话框 -->
    <el-dialog v-model="moveDialogVisible" title="移动文件" width="500px">
      <el-form ref="moveFormRef" :model="moveForm" :rules="moveRules" label-width="100px">
        <el-form-item label="目标文件夹" prop="newFolderId">
          <el-tree-select
            v-model="moveForm.newFolderId"
            :data="folderTree"
            :props="{ value: 'id', label: 'name', children: 'children' }"
            placeholder="选择目标文件夹"
            check-strictly
            style="width: 100%"
          />
        </el-form-item>
      </el-form>
      
      <template #footer>
        <el-button @click="moveDialogVisible = false">取消</el-button>
        <el-button type="primary" :loading="submitting" @click="handleMove">
          确定
        </el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { Search, Document } from '@element-plus/icons-vue'
import { ElMessage, type FormInstance, type FormRules } from 'element-plus'
import type { FileInfo, Folder } from '@/types'
import { getFiles, updateFile, deleteFile } from '@/api/adminFile'
import { getFolderTree } from '@/api/adminFolder'

const loading = ref(false)
const files = ref<FileInfo[]>([])
const searchKeyword = ref('')
const folderTree = ref<Folder[]>([])

const pagination = reactive({
  page: 1,
  size: 10,
  total: 0
})

const submitting = ref(false)

// 重命名
const renameDialogVisible = ref(false)
const renameFormRef = ref<FormInstance>()
const selectedFile = ref<FileInfo | null>(null)
const renameForm = reactive({
  newName: ''
})
const renameRules: FormRules = {
  newName: [
    { required: true, message: '请输入新文件名', trigger: 'blur' }
  ]
}

// 移动
const moveDialogVisible = ref(false)
const moveFormRef = ref<FormInstance>()
const moveForm = reactive({
  newFolderId: null as number | null
})
const moveRules: FormRules = {
  newFolderId: [
    { required: true, message: '请选择目标文件夹', trigger: 'change' }
  ]
}

const loadFiles = async () => {
  loading.value = true
  try {
    const response = await getFiles({
      page: pagination.page,
      size: pagination.size,
      keyword: searchKeyword.value || undefined
    })
    const data = response.data.data
    files.value = data.records
    pagination.total = data.total
  } catch {
    // Error handled by interceptor
  } finally {
    loading.value = false
  }
}

const loadFolderTree = async () => {
  try {
    const response = await getFolderTree()
    folderTree.value = response.data.data
  } catch {
    // Error handled by interceptor
  }
}

const openRenameDialog = (file: FileInfo) => {
  selectedFile.value = file
  renameForm.newName = file.originalName
  renameDialogVisible.value = true
}

const handleRename = async () => {
  if (!renameFormRef.value || !selectedFile.value) return
  
  await renameFormRef.value.validate(async (valid) => {
    if (!valid) return
    
    submitting.value = true
    try {
      await updateFile(selectedFile.value!.id, { newName: renameForm.newName })
      ElMessage.success('重命名成功')
      renameDialogVisible.value = false
      loadFiles()
    } catch {
      // Error handled by interceptor
    } finally {
      submitting.value = false
    }
  })
}

const openMoveDialog = (file: FileInfo) => {
  selectedFile.value = file
  moveForm.newFolderId = null
  moveDialogVisible.value = true
}

const handleMove = async () => {
  if (!moveFormRef.value || !selectedFile.value) return
  
  await moveFormRef.value.validate(async (valid) => {
    if (!valid) return
    
    submitting.value = true
    try {
      await updateFile(selectedFile.value!.id, { newFolderId: moveForm.newFolderId! })
      ElMessage.success('移动成功')
      moveDialogVisible.value = false
      loadFiles()
    } catch {
      // Error handled by interceptor
    } finally {
      submitting.value = false
    }
  })
}

const handleDelete = async (id: number) => {
  try {
    await deleteFile(id)
    ElMessage.success('删除成功')
    loadFiles()
  } catch {
    // Error handled by interceptor
  }
}

const formatDate = (dateStr: string) => {
  return new Date(dateStr).toLocaleString('zh-CN')
}

onMounted(() => {
  loadFiles()
  loadFolderTree()
})
</script>

<style scoped>
.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.search-area {
  display: flex;
  gap: 12px;
}

.file-name {
  display: flex;
  align-items: center;
  gap: 8px;
}

.pagination {
  margin-top: 20px;
  display: flex;
  justify-content: flex-end;
}
</style>
