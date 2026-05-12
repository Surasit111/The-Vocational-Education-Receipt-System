// services/authService.js
import api from './api'

export const authService = {
  // Register
  register: async (userData) => {
    try {
      const response = await api.post('/auth/register', userData)
      return response.data
    } catch (error) {
      throw new Error(error.response?.data?.message || 'สมัครสมาชิกไม่สำเร็จ')
    }
  },

  // Login
  login: async (email, password) => {
    try {
      const response = await api.post('/auth/login', { email, password })
      return response.data
    } catch (error) {
      throw new Error(error.response?.data?.message || 'เข้าสู่ระบบไม่สำเร็จ')
    }
  },

  // Get current user
  getMe: async () => {
    try {
      // ไม่ต้องส่ง token แล้วเพราะ api instance จัดการให้ใน interceptor
      const response = await api.get('/auth/me')
      return response.data.user
    } catch (error) {
      throw new Error(error.response?.data?.message || 'ดึงข้อมูลผู้ใช้ไม่สำเร็จ')
    }
  },

  // Logout
  logout: async () => {
    try {
      await api.post('/auth/logout')
    } catch (error) {
      console.error('Logout error:', error)
    }
  }
}