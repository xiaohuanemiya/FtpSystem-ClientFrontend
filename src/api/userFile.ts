import request from '@/utils/request'
import type { ApiResponse, FileInfo } from '@/types'

// 上传单个文件
export const uploadFile = (file: File, folderId: number) => {
  const formData = new FormData()
  formData.append('file', file)
  formData.append('folderId', folderId.toString())
  return request.post<ApiResponse<FileInfo>>('/api/user/files/upload', formData, {
    headers: {
      'Content-Type': 'multipart/form-data'
    }
  })
}

// 上传多个文件
export const uploadMultipleFiles = (files: File[], folderId: number) => {
  const formData = new FormData()
  files.forEach(file => {
    formData.append('files', file)
  })
  formData.append('folderId', folderId.toString())
  return request.post<ApiResponse<FileInfo[]>>('/api/user/files/upload-multiple', formData, {
    headers: {
      'Content-Type': 'multipart/form-data'
    }
  })
}

// 下载文件
export const downloadFile = async (id: number, fileName: string) => {
  const response = await request.get(`/api/user/files/${id}/download`, {
    responseType: 'blob'
  })
  const url = window.URL.createObjectURL(new Blob([response.data]))
  const link = document.createElement('a')
  link.href = url
  link.setAttribute('download', fileName)
  document.body.appendChild(link)
  link.click()
  link.remove()
  window.URL.revokeObjectURL(url)
}

// 获取文件信息
export const getFileInfo = (id: number) => {
  return request.get<ApiResponse<FileInfo>>(`/api/user/files/${id}`)
}
