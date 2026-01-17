import request from '@/utils/request'
import type { ApiResponse, User, PaginatedData, CreateUserRequest, UpdateUserRequest, QueryParams } from '@/types'

// 获取用户列表
export const getUsers = (params?: QueryParams) => {
  return request.get<ApiResponse<PaginatedData<User>>>('/api/admin/users', { params })
}

// 获取单个用户
export const getUser = (id: number) => {
  return request.get<ApiResponse<User>>(`/api/admin/users/${id}`)
}

// 创建用户
export const createUser = (data: CreateUserRequest) => {
  return request.post<ApiResponse<User>>('/api/admin/users', data)
}

// 更新用户
export const updateUser = (id: number, data: UpdateUserRequest) => {
  return request.put<ApiResponse<User>>(`/api/admin/users/${id}`, data)
}

// 删除用户
export const deleteUser = (id: number) => {
  return request.delete<ApiResponse<null>>(`/api/admin/users/${id}`)
}
