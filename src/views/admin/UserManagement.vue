<template>
  <div class="user-management">
    <el-card>
      <template #header>
        <div class="card-header">
          <div class="search-area">
            <el-input
              v-model="searchKeyword"
              placeholder="搜索用户名"
              clearable
              style="width: 200px"
              @clear="loadUsers"
              @keyup.enter="loadUsers"
            >
              <template #prefix>
                <el-icon><Search /></el-icon>
              </template>
            </el-input>
            <el-button type="primary" @click="loadUsers">搜索</el-button>
          </div>
          <el-button type="primary" :icon="Plus" @click="openCreateDialog">
            创建用户
          </el-button>
        </div>
      </template>
      
      <el-table v-loading="loading" :data="users" stripe>
        <el-table-column prop="id" label="ID" width="80" />
        <el-table-column prop="username" label="用户名" min-width="120" />
        <el-table-column prop="userTypeName" label="用户类型" width="100">
          <template #default="{ row }">
            <el-tag :type="row.userType === 1 ? 'danger' : 'info'">
              {{ row.userType === 1 ? '管理员' : '普通用户' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="status" label="状态" width="80">
          <template #default="{ row }">
            <el-tag :type="row.status === 1 ? 'success' : 'danger'">
              {{ row.status === 1 ? '启用' : '禁用' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="createTime" label="创建时间" width="180">
          <template #default="{ row }">
            {{ formatDate(row.createTime) }}
          </template>
        </el-table-column>
        <el-table-column label="操作" width="150" fixed="right">
          <template #default="{ row }">
            <el-button type="primary" link @click="openEditDialog(row)">
              编辑
            </el-button>
            <el-popconfirm
              title="确定要删除该用户吗？"
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
          @size-change="loadUsers"
          @current-change="loadUsers"
        />
      </div>
    </el-card>
    
    <!-- 创建/编辑对话框 -->
    <el-dialog 
      v-model="dialogVisible" 
      :title="isEdit ? '编辑用户' : '创建用户'"
      width="500px"
    >
      <el-form
        ref="formRef"
        :model="form"
        :rules="rules"
        label-width="80px"
      >
        <el-form-item label="用户名" prop="username">
          <el-input v-model="form.username" placeholder="请输入用户名" />
        </el-form-item>
        <el-form-item label="密码" :prop="isEdit ? '' : 'password'">
          <el-input 
            v-model="form.password" 
            type="password" 
            :placeholder="isEdit ? '不修改请留空' : '请输入密码'"
            show-password
          />
        </el-form-item>
        <el-form-item label="用户类型" prop="userType">
          <el-select v-model="form.userType" style="width: 100%">
            <el-option label="普通用户" :value="0" />
            <el-option label="管理员" :value="1" />
          </el-select>
        </el-form-item>
        <el-form-item label="状态" prop="status">
          <el-switch
            v-model="form.status"
            :active-value="1"
            :inactive-value="0"
            active-text="启用"
            inactive-text="禁用"
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
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { Search, Plus } from '@element-plus/icons-vue'
import { ElMessage, type FormInstance, type FormRules } from 'element-plus'
import type { User } from '@/types'
import { getUsers, createUser, updateUser, deleteUser } from '@/api/adminUser'

const loading = ref(false)
const users = ref<User[]>([])
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
  username: '',
  password: '',
  userType: 0,
  status: 1
})

const rules: FormRules = {
  username: [
    { required: true, message: '请输入用户名', trigger: 'blur' }
  ],
  password: [
    { required: true, message: '请输入密码', trigger: 'blur' }
  ],
  userType: [
    { required: true, message: '请选择用户类型', trigger: 'change' }
  ]
}

const loadUsers = async () => {
  loading.value = true
  try {
    const response = await getUsers({
      page: pagination.page,
      size: pagination.size,
      keyword: searchKeyword.value || undefined
    })
    const data = response.data.data
    users.value = data.records
    pagination.total = data.total
  } catch {
    // Error handled by interceptor
  } finally {
    loading.value = false
  }
}

const openCreateDialog = () => {
  isEdit.value = false
  editingId.value = null
  form.username = ''
  form.password = ''
  form.userType = 0
  form.status = 1
  dialogVisible.value = true
}

const openEditDialog = (user: User) => {
  isEdit.value = true
  editingId.value = user.id
  form.username = user.username
  form.password = ''
  form.userType = user.userType
  form.status = user.status
  dialogVisible.value = true
}

const handleSubmit = async () => {
  if (!formRef.value) return
  
  await formRef.value.validate(async (valid) => {
    if (!valid) return
    
    submitting.value = true
    try {
      if (isEdit.value && editingId.value) {
        const updateData: { username?: string; password?: string; userType?: number; status?: number } = {
          username: form.username,
          userType: form.userType,
          status: form.status
        }
        if (form.password) {
          updateData.password = form.password
        }
        await updateUser(editingId.value, updateData)
        ElMessage.success('更新成功')
      } else {
        await createUser({
          username: form.username,
          password: form.password,
          userType: form.userType,
          status: form.status
        })
        ElMessage.success('创建成功')
      }
      dialogVisible.value = false
      loadUsers()
    } catch {
      // Error handled by interceptor
    } finally {
      submitting.value = false
    }
  })
}

const handleDelete = async (id: number) => {
  try {
    await deleteUser(id)
    ElMessage.success('删除成功')
    loadUsers()
  } catch {
    // Error handled by interceptor
  }
}

const formatDate = (dateStr: string) => {
  return new Date(dateStr).toLocaleString('zh-CN')
}

onMounted(() => {
  loadUsers()
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

.pagination {
  margin-top: 20px;
  display: flex;
  justify-content: flex-end;
}
</style>
