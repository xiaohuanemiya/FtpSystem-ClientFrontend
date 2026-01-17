import request from '@/utils/request'
import type { ApiResponse, LoginRequest, LoginResponseData } from '@/types'

// 用户登录
export const login = (data: LoginRequest) => {
  return request.post<ApiResponse<LoginResponseData>>('/api/auth/login', data)
}
