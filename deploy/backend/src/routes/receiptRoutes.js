import express from 'express'
import {
  createReceipt,
  getReceipts,
  getReceipt,
  getUniqueNames,
  viewPDF,
  updatePDF,
  checkHasPDF,
  deleteReceipt,
  generatePDFOnly // ⭐ เพิ่มบรรทัดนี้
} from '../controllers/receiptController.js'
import { auth } from '../middlewares/auth.js'
import { optionalAuth } from '../middlewares/optionalAuth.js'

const router = express.Router()

// ==========================================
// ⭐ PUBLIC ROUTES - ไม่ต้องมี token
// ==========================================
router.post('/', optionalAuth, createReceipt)              // สร้างใบเสร็จ (optional)
router.get('/:id/pdf', optionalAuth, viewPDF)              // ดู PDF (optional)
router.post('/generate-pdf', generatePDFOnly)              // ⭐ สร้าง PDF โดยไม่บันทึก DB (public)

// ==========================================
// ⭐ PROTECTED ROUTES - ต้องมี token
// ==========================================
router.get('/', auth, getReceipts)                         // ดึงข้อมูลทั้งหมด
router.get('/names', auth, getUniqueNames)                 // ดึงรายชื่อ
router.get('/:id', auth, getReceipt)                       // ดึงข้อมูล 1 ใบ
router.delete('/:id', auth, deleteReceipt)                 // ลบใบเสร็จ
router.put('/:id/pdf', auth, updatePDF)                    // อัปเดต PDF
router.get('/:id/has-pdf', auth, checkHasPDF)              // ตรวจสอบ PDF

export default router