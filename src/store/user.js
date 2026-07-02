import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import request from '@/utils/request'

export const useUserStore = defineStore('user', () => {
  const token = ref(localStorage.getItem('token') || '')
  const userInfo = ref(null)

  const isLoggedIn = computed(() => !!token.value)

  // 登录
  async function login(loginData) {
    const res = await request.post('/user/login', loginData)
    token.value = res.data.token
    userInfo.value = res.data.user
    localStorage.setItem('token', res.data.token)
    return res.data
  }

  // 注册
  async function register(registerData) {
    const res = await request.post('/user/register', registerData)
    return res.data
  }

  // 获取用户信息
  async function getUserInfo(userId) {
    const res = await request.get(`/user/info/${userId}`)
    return res.data
  }

  // 获取当前用户信息
  async function getCurrentUserInfo() {
    const res = await request.get('/user/info')
    userInfo.value = res.data
    return res.data
  }

  // 更新用户信息
  async function updateUserInfo(data) {
    const res = await request.put('/user/info', data)
    userInfo.value = res.data
    return res.data
  }

  // 关注用户
  async function followUser(userId) {
    await request.post(`/user/follow/${userId}`)
  }

  // 取消关注
  async function unfollowUser(userId) {
    await request.delete(`/user/follow/${userId}`)
  }

  // 检查登录状态
  async function checkLoginStatus() {
    if (token.value) {
      try {
        await getCurrentUserInfo()
      } catch (error) {
        logout()
      }
    }
  }

  // 登出
  function logout() {
    token.value = ''
    userInfo.value = null
    localStorage.removeItem('token')
  }

  return {
    token,
    userInfo,
    isLoggedIn,
    login,
    register,
    getUserInfo,
    getCurrentUserInfo,
    updateUserInfo,
    followUser,
    unfollowUser,
    checkLoginStatus,
    logout
  }
})