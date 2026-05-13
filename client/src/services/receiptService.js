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
  },

  // สร้าง PDF โดยไม่บันทึกลงฐานข้อมูล (สำหรับผู้ใช้ทั่วไป)
  generatePDFOnly: async (receiptData) => {
    try {
      const response = await api.post('/receipts/generate-pdf', receiptData, {
        responseType: 'blob' // สำคัญมาก: ต้องระบุว่าเป็น blob เพื่อรับไฟล์ PDF
      })
      
      // สร้าง URL จาก Blob และเปิดในแท็บใหม่
      const blob = new Blob([response.data], { type: 'application/pdf' })
      const url = window.URL.createObjectURL(blob)
      window.open(url, '_blank')
      
      return true
    } catch (error) {
      console.error('PDF Generation Error:', error)
      throw new Error('ไม่สามารถสร้างไฟล์ PDF ได้')
    }
  }
}