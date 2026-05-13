// services/adminService.js
import api from './api'

export const adminService = {
  // ดึงข้อมูลแอดมินทั้งหมด
  getAll: async () => {
    try {
      const response = await api.get('/users/admins/manage')
      return response.data
    } catch (error) {
      throw new Error(error.response?.data?.message || 'ไม่สามารถดึงข้อมูลแอดมินได้')
    }
  },

  // เพิ่มแอดมินใหม่
  create: async (adminData) => {
    try {
      const response = await api.post('/users/admins/manage', adminData)
      return response.data
    } catch (error) {
      throw new Error(error.response?.data?.message || 'ไม่สามารถเพิ่มแอดมินได้')
    }
  },

  // แก้ไขข้อมูลแอดมิน
  update: async (id, adminData) => {
    try {
      const response = await api.put(`/users/admins/manage/${id}`, adminData)
      return response.data
    } catch (error) {
      throw new Error(error.response?.data?.message || 'ไม่สามารถแก้ไขข้อมูลแอดมินได้')
    }
  },

  // ลบแอดมิน
  delete: async (id) => {
    try {
      const response = await api.delete(`/users/admins/manage/${id}`)
      return response.data
    } catch (error) {
      throw new Error(error.response?.data?.message || 'ไม่สามารถลบแอดมินได้')
    }
  }
}

// Alias เพื่อความเข้ากันได้
adminService.getAdmins = adminService.getAll;
adminService.createAdmin = adminService.create;
adminService.updateAdmin = adminService.update;
adminService.deleteAdmin = adminService.delete;
