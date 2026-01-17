import request from '@/utils/request'
import type { ApiResponse, Folder, PaginatedData, FileInfo, CreateFolderRequest, UpdateFolderRequest, QueryParams } from '@/types'

// 获取文件夹列表（分页）
export const getFolders = (params?: QueryParams) => {
  return request.get<ApiResponse<PaginatedData<Folder>>>('/api/admin/folders', { params })
}

// 获取单个文件夹
export const getFolder = (id: number) => {
  return request.get<ApiResponse<Folder>>(`/api/admin/folders/${id}`)
}

// 创建文件夹
export const createFolder = (data: CreateFolderRequest) => {
  return request.post<ApiResponse<Folder>>('/api/admin/folders', data)
}

// 更新文件夹
export const updateFolder = (id: number, data: UpdateFolderRequest) => {
  return request.put<ApiResponse<Folder>>(`/api/admin/folders/${id}`, data)
}

// 删除文件夹
export const deleteFolder = (id: number) => {
  return request.delete<ApiResponse<null>>(`/api/admin/folders/${id}`)
}

// 获取文件夹树
export const getFolderTree = () => {
  return request.get<ApiResponse<Folder[]>>('/api/admin/folders/tree')
}

// 获取文件夹内的文件
export const getFolderFiles = (folderId: number) => {
  return request.get<ApiResponse<FileInfo[]>>(`/api/admin/folders/${folderId}/files`)
}
