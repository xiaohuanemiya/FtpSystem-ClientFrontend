import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type { LoginResponseData } from '@/types'
import { login as apiLogin } from '@/api/auth'

export const useAuthStore = defineStore('auth', () => {
  const token = ref<string | null>(localStorage.getItem('token'))
  const userInfo = ref<Omit<LoginResponseData, 'token'> | null>(
    localStorage.getItem('userInfo') ? JSON.parse(localStorage.getItem('userInfo')!) : null
  )

  const isLoggedIn = computed(() => !!token.value)
  const isAdmin = computed(() => userInfo.value?.userType === 1)
  const username = computed(() => userInfo.value?.username || '')

  const login = async (loginData: { username: string; password: string }) => {
    const response = await apiLogin(loginData)
    const data = response.data.data
    
    token.value = data.token
    userInfo.value = {
      userId: data.userId,
      username: data.username,
      userType: data.userType,
      userTypeName: data.userTypeName
    }
    
    localStorage.setItem('token', data.token)
    localStorage.setItem('userInfo', JSON.stringify(userInfo.value))
    
    return data
  }

  const logout = () => {
    token.value = null
    userInfo.value = null
    localStorage.removeItem('token')
    localStorage.removeItem('userInfo')
  }

  return {
    token,
    userInfo,
    isLoggedIn,
    isAdmin,
    username,
    login,
    logout
  }
})
