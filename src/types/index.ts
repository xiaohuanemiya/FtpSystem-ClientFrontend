// API通用响应格式
export interface ApiResponse<T = unknown> {
  code: number
  message: string
  data: T
}

// 分页响应格式
export interface PaginatedData<T> {
  records: T[]
  total: number
  size: number
  current: number
  pages: number
}

// 登录请求
export interface LoginRequest {
  username: string
  password: string
}

// 登录响应数据
export interface LoginResponseData {
  token: string
  userId: number
  username: string
  userType: number
  userTypeName: string
}

// 用户信息
export interface User {
  id: number
  username: string
  userType: number
  userTypeName: string
  status: number
  createTime: string
  updateTime: string
}

// 创建用户请求
export interface CreateUserRequest {
  username: string
  password: string
  userType: number
  status?: number
}

// 更新用户请求
export interface UpdateUserRequest {
  username?: string
  password?: string
  userType?: number
  status?: number
}

// 文件夹信息
export interface Folder {
  id: number
  name: string
  parentId: number | null
  parentName: string | null
  allowSubfolder: number
  description: string | null
  creatorId: number
  creatorName: string
  path: string
  createTime: string
  updateTime: string
  children: Folder[] | null
  files: FileInfo[] | null
}

// 创建文件夹请求
export interface CreateFolderRequest {
  name: string
  parentId?: number | null
  allowSubfolder: number
  description?: string
}

// 更新文件夹请求
export interface UpdateFolderRequest {
  name?: string
  parentId?: number | null
  allowSubfolder?: number
  description?: string
}

// 文件信息
export interface FileInfo {
  id: number
  originalName: string
  extension: string
  fileSize: number
  fileSizeFormatted: string
  mimeType: string
  folderId: number
  folderName: string
  uploaderId: number
  uploaderName: string
  createTime: string
  updateTime: string
}

// 查询参数
export interface QueryParams {
  page?: number
  size?: number
  keyword?: string
}
