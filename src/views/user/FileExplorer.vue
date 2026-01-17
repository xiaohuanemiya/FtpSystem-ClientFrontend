<template>
  <div class="file-explorer">
    <el-row :gutter="20">
      <!-- 左侧文件夹树 -->
      <el-col :span="6">
        <el-card class="tree-card">
          <template #header>
            <div class="card-header">
              <span>文件夹</span>
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
            :expand-on-click-node="false"
            @node-click="handleNodeClick"
          >
            <template #default="{ data }">
              <span class="tree-node">
                <el-icon><Folder /></el-icon>
                <span>{{ data.name }}</span>
              </span>
            </template>
          </el-tree>
          
          <el-empty v-else description="暂无文件夹" :image-size="60" />
        </el-card>
      </el-col>
      
      <!-- 右侧文件列表 -->
      <el-col :span="18">
        <el-card class="file-card">
          <template #header>
            <div class="card-header">
              <div class="breadcrumb">
                <el-breadcrumb separator="/">
                  <el-breadcrumb-item @click="handleBack">
                    <el-icon><HomeFilled /></el-icon>
                    <span>根目录</span>
                  </el-breadcrumb-item>
                  <el-breadcrumb-item v-if="currentFolder">
                    {{ currentFolder.name }}
                  </el-breadcrumb-item>
                </el-breadcrumb>
              </div>
              
              <div class="actions">
                <el-upload
                  v-if="currentFolder"
                  action=""
                  :show-file-list="false"
                  :auto-upload="false"
                  :on-change="handleFileSelect"
                  multiple
                >
                  <el-button type="primary" :icon="Upload">上传文件</el-button>
                </el-upload>
              </div>
            </div>
          </template>
          
          <div v-loading="loading" class="file-content">
            <!-- 子文件夹 -->
            <div v-if="subFolders.length > 0" class="section">
              <h4>文件夹</h4>
              <div class="folder-grid">
                <div 
                  v-for="folder in subFolders" 
                  :key="folder.id"
                  class="folder-item"
                  @click="enterFolder(folder)"
                >
                  <el-icon :size="48" color="#f0c000"><Folder /></el-icon>
                  <span class="folder-name">{{ folder.name }}</span>
                </div>
              </div>
            </div>
            
            <!-- 文件列表 -->
            <div v-if="files.length > 0" class="section">
              <h4>文件</h4>
              <el-table :data="files" stripe>
                <el-table-column prop="originalName" label="文件名" min-width="200">
                  <template #default="{ row }">
                    <div class="file-name">
                      <el-icon :size="20"><Document /></el-icon>
                      <span>{{ row.originalName }}</span>
                    </div>
                  </template>
                </el-table-column>
                <el-table-column prop="fileSizeFormatted" label="大小" width="120" />
                <el-table-column prop="uploaderName" label="上传者" width="100" />
                <el-table-column prop="createTime" label="上传时间" width="180">
                  <template #default="{ row }">
                    {{ formatDate(row.createTime) }}
                  </template>
                </el-table-column>
                <el-table-column label="操作" width="100" fixed="right">
                  <template #default="{ row }">
                    <el-button 
                      type="primary" 
                      link 
                      @click="handleDownload(row)"
                    >
                      <el-icon><Download /></el-icon>
                      下载
                    </el-button>
                  </template>
                </el-table-column>
              </el-table>
            </div>
            
            <el-empty 
              v-if="!loading && subFolders.length === 0 && files.length === 0" 
              :description="currentFolder ? '该文件夹为空' : '请选择一个文件夹'"
              :image-size="100"
            />
          </div>
        </el-card>
      </el-col>
    </el-row>
    
    <!-- 上传对话框 -->
    <el-dialog v-model="uploadDialogVisible" title="上传文件" width="500px">
      <div class="upload-list">
        <div v-for="(file, index) in uploadFiles" :key="index" class="upload-item">
          <el-icon><Document /></el-icon>
          <span>{{ file.name }}</span>
          <span class="file-size">{{ formatFileSize(file.size) }}</span>
          <el-button type="danger" link @click="removeUploadFile(index)">
            <el-icon><Delete /></el-icon>
          </el-button>
        </div>
      </div>
      
      <template #footer>
        <el-button @click="uploadDialogVisible = false">取消</el-button>
        <el-button type="primary" :loading="uploading" @click="confirmUpload">
          确认上传
        </el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { 
  Folder, 
  Document, 
  Refresh, 
  HomeFilled, 
  Upload, 
  Download,
  Delete 
} from '@element-plus/icons-vue'
import { ElMessage, type UploadFile } from 'element-plus'
import type { Folder as FolderType, FileInfo } from '@/types'
import { getFolderTree, getFolderDetail } from '@/api/userFolder'
import { uploadMultipleFiles, downloadFile } from '@/api/userFile'

const loading = ref(false)
const folderTree = ref<FolderType[]>([])
const currentFolder = ref<FolderType | null>(null)
const subFolders = ref<FolderType[]>([])
const files = ref<FileInfo[]>([])

const uploadDialogVisible = ref(false)
const uploadFiles = ref<File[]>([])
const uploading = ref(false)

const treeProps = {
  children: 'children',
  label: 'name'
}

// 加载文件夹树
const loadFolderTree = async () => {
  try {
    const response = await getFolderTree()
    folderTree.value = response.data.data
  } catch {
    // Error handled by interceptor
  }
}

// 加载文件夹详情
const loadFolderDetail = async (folderId: number) => {
  loading.value = true
  try {
    const response = await getFolderDetail(folderId)
    const folder = response.data.data
    currentFolder.value = folder
    subFolders.value = folder.children || []
    files.value = folder.files || []
  } catch {
    // Error handled by interceptor
  } finally {
    loading.value = false
  }
}

// 点击树节点
const handleNodeClick = (data: FolderType) => {
  loadFolderDetail(data.id)
}

// 进入子文件夹
const enterFolder = (folder: FolderType) => {
  loadFolderDetail(folder.id)
}

// 返回根目录
const handleBack = () => {
  currentFolder.value = null
  subFolders.value = []
  files.value = []
}

// 选择文件
const handleFileSelect = (uploadFile: UploadFile) => {
  if (uploadFile.raw) {
    // 检查是否已存在相同文件（按名称和大小判断）
    const isDuplicate = uploadFiles.value.some(
      f => f.name === uploadFile.raw!.name && f.size === uploadFile.raw!.size
    )
    if (!isDuplicate) {
      uploadFiles.value.push(uploadFile.raw)
    }
    uploadDialogVisible.value = true
  }
}

// 移除上传文件
const removeUploadFile = (index: number) => {
  uploadFiles.value.splice(index, 1)
  if (uploadFiles.value.length === 0) {
    uploadDialogVisible.value = false
  }
}

// 确认上传
const confirmUpload = async () => {
  if (!currentFolder.value) return
  
  uploading.value = true
  try {
    await uploadMultipleFiles(uploadFiles.value, currentFolder.value.id)
    ElMessage.success('上传成功')
    uploadDialogVisible.value = false
    uploadFiles.value = []
    loadFolderDetail(currentFolder.value.id)
  } catch {
    // Error handled by interceptor
  } finally {
    uploading.value = false
  }
}

// 下载文件
const handleDownload = (file: FileInfo) => {
  downloadFile(file.id, file.originalName)
}

// 格式化日期
const formatDate = (dateStr: string) => {
  return new Date(dateStr).toLocaleString('zh-CN')
}

// 格式化文件大小
const formatFileSize = (bytes: number) => {
  if (bytes < 1024) return bytes + ' B'
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(2) + ' KB'
  if (bytes < 1024 * 1024 * 1024) return (bytes / 1024 / 1024).toFixed(2) + ' MB'
  return (bytes / 1024 / 1024 / 1024).toFixed(2) + ' GB'
}

onMounted(() => {
  loadFolderTree()
})
</script>

<style scoped>
.file-explorer {
  height: 100%;
}

.tree-card,
.file-card {
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

.tree-node {
  display: flex;
  align-items: center;
  gap: 6px;
}

.breadcrumb {
  display: flex;
  align-items: center;
}

:deep(.el-breadcrumb__item) {
  cursor: pointer;
}

:deep(.el-breadcrumb__item:first-child .el-breadcrumb__inner) {
  display: flex;
  align-items: center;
  gap: 4px;
}

.file-content {
  min-height: 400px;
}

.section {
  margin-bottom: 24px;
}

.section h4 {
  margin-bottom: 16px;
  color: #666;
}

.folder-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(100px, 1fr));
  gap: 16px;
}

.folder-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 16px;
  border-radius: 8px;
  cursor: pointer;
  transition: background-color 0.2s;
}

.folder-item:hover {
  background-color: #f5f7fa;
}

.folder-name {
  margin-top: 8px;
  font-size: 13px;
  color: #333;
  text-align: center;
  word-break: break-all;
}

.file-name {
  display: flex;
  align-items: center;
  gap: 8px;
}

.upload-list {
  max-height: 300px;
  overflow-y: auto;
}

.upload-item {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 12px;
  background: #f5f7fa;
  border-radius: 4px;
  margin-bottom: 8px;
}

.upload-item .file-size {
  margin-left: auto;
  color: #999;
  font-size: 12px;
}
</style>
