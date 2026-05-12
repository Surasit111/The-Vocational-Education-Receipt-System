// routes/categoryRoutes.js
import express from 'express'
import {
  getCategories,
  getCategoriesByType,
  createCategory,
  updateCategory,
  deleteCategory
} from '../controllers/categoryController.js'
import { auth, isAdmin } from '../middlewares/auth.js'
import { optionalAuth } from '../middlewares/optionalAuth.js'

const router = express.Router()

// ⭐ ลบ router.use(auth) ออก - ให้แต่ละ route กำหนดเอง

// ⭐ Public routes - ดูข้อมูลได้โดยไม่ต้องล็อกอิน (ใช้ optionalAuth)
router.get('/', optionalAuth, getCategories)
router.get('/:type', optionalAuth, getCategoriesByType)

// ⭐ Protected routes - ต้องล็อกอินก่อน (User + Admin)
router.post('/', auth, createCategory)
router.put('/:id', auth, updateCategory)

// ⭐ Admin only
router.delete('/:id', auth, isAdmin, deleteCategory)

export default router