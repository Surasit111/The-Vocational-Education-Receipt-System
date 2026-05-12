// services/categoryService.js
import api from './api'

export const categoryService = {
  // ดึงหมวดหมู่ทั้งหมด
  getAll: async () => {
    try {
      const response = await api.get('/categories')
      return response.data
    } catch (error) {
      throw new Error(error.response?.data?.message || 'ไม่สามารถดึงข้อมูลได้')
    }
  },

  // ดึงหมวดหมู่ตามประเภท
  getByType: async (type) => {
    try {
      const response = await api.get(`/categories/type/${type}`)
      return response.data
    } catch (error) {
      throw new Error(error.response?.data?.message || 'ไม่สามารถดึงข้อมูลได้')
    }
  },

  // เพิ่มหมวดหมู่ใหม่
  create: async (categoryData) => {
    try {
      const response = await api.post('/categories', categoryData)
      return response.data
    } catch (error) {
      throw new Error(error.response?.data?.message || 'ไม่สามารถเพิ่มข้อมูลได้')
    }
  },

  // อัปเดตหมวดหมู่
  update: async (id, categoryData) => {
    try {
      const response = await api.put(`/categories/${id}`, categoryData)
      return response.data
    } catch (error) {
      throw new Error(error.response?.data?.message || 'ไม่สามารถแก้ไขข้อมูลได้')
    }
  },

  // ลบหมวดหมู่
  delete: async (id) => {
    try {
      const response = await api.delete(`/categories/${id}`)
      return response.data
    } catch (error) {
      throw new Error(error.response?.data?.message || 'ไม่สามารถลบข้อมูลได้')
    }
  }
}