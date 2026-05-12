// routes/userRoutes.js
import express from 'express'
import { 
  getAdminContact, 
  getAllAdmins, 
  getUsers, 
  updateProfile 
} from '../controllers/userController.js'
import { auth, isAdmin } from '../middlewares/auth.js'
import { optionalAuth } from '../middlewares/optionalAuth.js' // ⭐ เพิ่มบรรทัดนี้

const router = express.Router()

// ⭐ Public routes (ไม่ต้อง login)
router.get('/admins', optionalAuth, getAllAdmins) // ⭐ เปลี่ยนจาก auth เป็น optionalAuth

// Protected routes (ต้อง login)
router.get('/admin-contact', auth, getAdminContact)
router.put('/profile', auth, updateProfile)

// Admin only
router.get('/', auth, isAdmin, getUsers)

export default router