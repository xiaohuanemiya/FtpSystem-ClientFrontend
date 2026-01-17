import request from '@/utils/request'
import type { ApiResponse, Folder, FileInfo } from '@/types'

// 获取根目录文件夹列表
export const getRootFolders = () => {
  return request.get<ApiResponse<Folder[]>>('/api/user/folders')
}

// 获取文件夹树
export const getFolderTree = () => {
  return request.get<ApiResponse<Folder[]>>('/api/user/folders/tree')
}

// 获取文件夹详情（含子文件夹和文件）
export const getFolderDetail = (id: number) => {
  return request.get<ApiResponse<Folder>>(`/api/user/folders/${id}`)
}

// 获取子文件夹列表
export const getChildFolders = (parentId: number) => {
  return request.get<ApiResponse<Folder[]>>(`/api/user/folders/${parentId}/children`)
}

// 获取文件夹内的文件
export const getFolderFiles = (folderId: number) => {
  return request.get<ApiResponse<FileInfo[]>>(`/api/user/folders/${folderId}/files`)
}
