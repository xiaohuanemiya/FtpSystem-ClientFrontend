<template>
  <div class="folder-management">
    <el-row :gutter="20">
      <!-- 左侧文件夹树 -->
      <el-col :span="8">
        <el-card class="tree-card">
          <template #header>
            <div class="card-header">
              <span>文件夹结构</span>
              <el-button type="primary" link @click="loadFolderTree">
                <el-icon><Refresh /></el-icon>
              </el-button>
            </div>
          </template>
          
          <el-tree
            v-if="folderTree.length > 0"
            :data="folderTree"
            :props="treeProps"
            node-key="id"
            highlight-current
            default-expand-all
            :expand-on-click-node="false"
            @node-click="handleNodeClick"
          >
            <template #default="{ data }">
              <span class="tree-node">
                <el-icon :color="data.allowSubfolder ? '#f0c000' : '#909399'">
                  <Folder />
                </el-icon>
                <span>{{ data.name }}</span>
              </span>
            </template>
          </el-tree>
          
          <el-empty v-else description="暂无文件夹" :image-size="60" />
        </el-card>
      </el-col>
      
      <!-- 右侧文件夹列表 -->
      <el-col :span="16">
        <el-card>
          <template #header>
            <div class="card-header">
              <div class="search-area">
                <el-input
                  v-model="searchKeyword"
                  placeholder="搜索文件夹名"
                  clearable
                  style="width: 200px"
                  @clear="loadFolders"
                  @keyup.enter="loadFolders"
                >
                  <template #prefix>
                    <el-icon><Search /></el-icon>
                  </template>
                </el-input>
                <el-button type="primary" @click="loadFolders">搜索</el-button>
              </div>
              <el-button type="primary" :icon="Plus" @click="openCreateDialog">
                创建文件夹
              </el-button>
            </div>
          </template>
          
          <el-table v-loading="loading" :data="folders" stripe>
            <el-table-column prop="name" label="文件夹名" min-width="150" />
            <el-table-column prop="path" label="路径" min-width="200" />
            <el-table-column prop="parentName" label="父文件夹" width="120">
              <template #default="{ row }">
                {{ row.parentName || '根目录' }}
              </template>
            </el-table-column>
            <el-table-column prop="allowSubfolder" label="允许子文件夹" width="120">
              <template #default="{ row }">
                <el-tag :type="row.allowSubfolder === 1 ? 'success' : 'info'">
                  {{ row.allowSubfolder === 1 ? '是' : '否' }}
                </el-tag>
              </template>
            </el-table-column>
            <el-table-column prop="creatorName" label="创建者" width="100" />
            <el-table-column label="操作" width="200" fixed="right">
              <template #default="{ row }">
                <el-button type="primary" link @click="viewFiles(row)">
                  查看文件
                </el-button>
                <el-button type="primary" link @click="openEditDialog(row)">
                  编辑
                </el-button>
                <el-popconfirm
                  title="确定要删除该文件夹吗？"
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
              @size-change="loadFolders"
              @current-change="loadFolders"
            />
          </div>
        </el-card>
      </el-col>
    </el-row>
    
    <!-- 创建/编辑对话框 -->
    <el-dialog 
      v-model="dialogVisible" 
      :title="isEdit ? '编辑文件夹' : '创建文件夹'"
      width="500px"
    >
      <el-form
        ref="formRef"
        :model="form"
        :rules="rules"
        label-width="100px"
      >
        <el-form-item label="文件夹名" prop="name">
          <el-input v-model="form.name" placeholder="请输入文件夹名" />
        </el-form-item>
        <el-form-item label="父文件夹" prop="parentId">
          <el-tree-select
            v-model="form.parentId"
            :data="parentFolderOptions"
            :props="{ value: 'id', label: 'name', children: 'children' }"
            placeholder="选择父文件夹（留空为根目录）"
            clearable
            check-strictly
            style="width: 100%"
          />
        </el-form-item>
        <el-form-item label="允许子文件夹" prop="allowSubfolder">
          <el-switch
            v-model="form.allowSubfolder"
            :active-value="1"
            :inactive-value="0"
            active-text="是"
            inactive-text="否"
          />
        </el-form-item>
        <el-form-item label="描述" prop="description">
          <el-input 
            v-model="form.description" 
            type="textarea" 
            :rows="3"
            placeholder="请输入描述（可选）" 
          />
        </el-form-item>
      </el-form>
      
      <template #footer>
        <el-button @click="dialogVisible = false">取消</el-button>
        <el-button type="primary" :loading="submitting" @click="handleSubmit">
          确定
        </el-button>
      </template>
    </el-dialog>
    
    <!-- 文件列表对话框 -->
    <el-dialog 
      v-model="filesDialogVisible" 
      :title="`${selectedFolder?.name || ''} - 文件列表`"
      width="800px"
    >
      <el-table v-loading="filesLoading" :data="folderFiles">
        <el-table-column prop="originalName" label="文件名" min-width="200" />
        <el-table-column prop="fileSizeFormatted" label="大小" width="120" />
        <el-table-column prop="mimeType" label="类型" width="150" />
        <el-table-column prop="uploaderName" label="上传者" width="100" />
        <el-table-column prop="createTime" label="上传时间" width="180">
          <template #default="{ row }">
            {{ formatDate(row.createTime) }}
          </template>
        </el-table-column>
      </el-table>
      
      <el-empty v-if="!filesLoading && folderFiles.length === 0" description="该文件夹暂无文件" />
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, onMounted } from 'vue'
import { Search, Plus, Folder, Refresh } from '@element-plus/icons-vue'
import { ElMessage, type FormInstance, type FormRules } from 'element-plus'
import type { Folder as FolderType, FileInfo } from '@/types'
import { 
  getFolders, 
  getFolderTree, 
  getFolder, 
  createFolder, 
  updateFolder, 
  deleteFolder,
  getFolderFiles 
} from '@/api/adminFolder'

const loading = ref(false)
const folders = ref<FolderType[]>([])
const folderTree = ref<FolderType[]>([])
const searchKeyword = ref('')

const pagination = reactive({
  page: 1,
  size: 10,
  total: 0
})

const dialogVisible = ref(false)
const isEdit = ref(false)
const editingId = ref<number | null>(null)
const formRef = ref<FormInstance>()
const submitting = ref(false)

const form = reactive({
  name: '',
  parentId: null as number | null,
  allowSubfolder: 1,
  description: ''
})

const rules: FormRules = {
  name: [
    { required: true, message: '请输入文件夹名', trigger: 'blur' }
  ]
}

const treeProps = {
  children: 'children',
  label: 'name'
}

const filesDialogVisible = ref(false)
const filesLoading = ref(false)
const selectedFolder = ref<FolderType | null>(null)
const folderFiles = ref<FileInfo[]>([])

// 计算可选的父文件夹（过滤掉不允许子文件夹的）
const parentFolderOptions = computed(() => {
  const filterTree = (folders: FolderType[]): FolderType[] => {
    return folders
      .filter(f => f.allowSubfolder === 1)
      .map(f => ({
        ...f,
        children: f.children ? filterTree(f.children) : []
      }))
  }
  return filterTree(folderTree.value)
})

const loadFolders = async () => {
  loading.value = true
  try {
    const response = await getFolders({
      page: pagination.page,
      size: pagination.size,
      keyword: searchKeyword.value || undefined
    })
    const data = response.data.data
    folders.value = data.records
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

const handleNodeClick = async (data: FolderType) => {
  try {
    const response = await getFolder(data.id)
    openEditDialog(response.data.data)
  } catch {
    // Error handled by interceptor
  }
}

const openCreateDialog = () => {
  isEdit.value = false
  editingId.value = null
  form.name = ''
  form.parentId = null
  form.allowSubfolder = 1
  form.description = ''
  dialogVisible.value = true
}

const openEditDialog = (folder: FolderType) => {
  isEdit.value = true
  editingId.value = folder.id
  form.name = folder.name
  form.parentId = folder.parentId
  form.allowSubfolder = folder.allowSubfolder
  form.description = folder.description || ''
  dialogVisible.value = true
}

const handleSubmit = async () => {
  if (!formRef.value) return
  
  await formRef.value.validate(async (valid) => {
    if (!valid) return
    
    submitting.value = true
    try {
      if (isEdit.value && editingId.value) {
        await updateFolder(editingId.value, {
          name: form.name,
          parentId: form.parentId,
          allowSubfolder: form.allowSubfolder,
          description: form.description || undefined
        })
        ElMessage.success('更新成功')
      } else {
        await createFolder({
          name: form.name,
          parentId: form.parentId,
          allowSubfolder: form.allowSubfolder,
          description: form.description || undefined
        })
        ElMessage.success('创建成功')
      }
      dialogVisible.value = false
      loadFolders()
      loadFolderTree()
    } catch {
      // Error handled by interceptor
    } finally {
      submitting.value = false
    }
  })
}

const handleDelete = async (id: number) => {
  try {
    await deleteFolder(id)
    ElMessage.success('删除成功')
    loadFolders()
    loadFolderTree()
  } catch {
    // Error handled by interceptor
  }
}

const viewFiles = async (folder: FolderType) => {
  selectedFolder.value = folder
  filesDialogVisible.value = true
  filesLoading.value = true
  try {
    const response = await getFolderFiles(folder.id)
    folderFiles.value = response.data.data
  } catch {
    // Error handled by interceptor
  } finally {
    filesLoading.value = false
  }
}

const formatDate = (dateStr: string) => {
  return new Date(dateStr).toLocaleString('zh-CN')
}

onMounted(() => {
  loadFolders()
  loadFolderTree()
})
</script>

<style scoped>
.tree-card {
  height: calc(100vh - 140px);
}

.tree-card :deep(.el-card__body) {
  overflow-y: auto;
  max-height: calc(100vh - 200px);
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.search-area {
  display: flex;
  gap: 12px;
}

.tree-node {
  display: flex;
  align-items: center;
  gap: 6px;
}

.pagination {
  margin-top: 20px;
  display: flex;
  justify-content: flex-end;
}
</style>
