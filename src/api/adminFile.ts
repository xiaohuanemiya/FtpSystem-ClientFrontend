import request from '@/utils/request'
import type { ApiResponse, FileInfo, PaginatedData, QueryParams } from '@/types'

// 获取文件列表（分页）
export const getFiles = (params?: QueryParams) => {
  return request.get<ApiResponse<PaginatedData<FileInfo>>>('/api/admin/files', { params })
}

// 获取单个文件信息
export const getFile = (id: number) => {
  return request.get<ApiResponse<FileInfo>>(`/api/admin/files/${id}`)
}

// 更新文件信息（重命名或移动）
export const updateFile = (id: number, params: { newName?: string; newFolderId?: number }) => {
  return request.put<ApiResponse<FileInfo>>(`/api/admin/files/${id}`, null, { params })
}

// 删除文件
export const deleteFile = (id: number) => {
  return request.delete<ApiResponse<null>>(`/api/admin/files/${id}`)
}
