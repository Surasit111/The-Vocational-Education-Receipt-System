// services/receiptService.js
import api from './api'

export const receiptService = {
  // ดึงข้อมูลใบเสร็จทั้งหมด (มีการกรอง)
  getAll: async (filters = {}) => {
    try {
      const response = await api.get('/receipts', {
        params: filters
      })
      return response.data
    } catch (error) {
      throw new Error(error.response?.data?.message || 'ไม่สามารถดึงข้อมูลใบเสร็จได้')
    }
  },

  // ดึงรายชื่อผู้ปฏิบัติงานที่ไม่ซ้ำกัน
  getUniqueNames: async () => {
    try {
      const response = await api.get('/receipts/names')
      return response.data
    } catch (error) {
      throw new Error('ไม่สามารถดึงรายชื่อได้')
    }
  },

  // ดูไฟล์ PDF (เปิดในแท็บใหม่)
  viewPDF: (receiptId) => {
    // ต้องใช้ URL เต็มสำหรับการเปิดแท็บใหม่
    const url = `${api.defaults.baseURL}/receipts/${receiptId}/pdf`
    window.open(url, '_blank')
  },

  // สร้างใบเสร็จใหม่
  create: async (receiptData) => {
    try {
      const response = await api.post('/receipts', receiptData)
      return response.data
    } catch (error) {
      throw new Error(error.response?.data?.message || 'ไม่สามารถสร้างใบเสร็จได้')
    }
  },

  // อัปเดตใบเสร็จ
  update: async (id, receiptData) => {
    try {
      const response = await api.put(`/receipts/${id}`, receiptData)
      return response.data
    } catch (error) {
      throw new Error(error.response?.data?.message || 'ไม่สามารถอัปเดตใบเสร็จได้')
    }
  },

  // ลบใบเสร็จ
  delete: async (id) => {
    try {
      const response = await api.delete(`/receipts/${id}`)
      return response.data
    } catch (error) {
      throw new Error(error.response?.data?.message || 'ไม่สามารถลบใบเสร็จได้')
    }
  }
}