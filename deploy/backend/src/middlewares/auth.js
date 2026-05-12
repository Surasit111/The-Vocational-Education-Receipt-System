// middlewares/auth.js
import jwt from 'jsonwebtoken'

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production'

// Middleware สำหรับตรวจสอบ Authentication
export const auth = (req, res, next) => {
  try {
    // ดึง token จาก header
    const token = req.header('Authorization')?.replace('Bearer ', '')

    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'กรุณาเข้าสู่ระบบ'
      })
    }

    // Verify token
    const decoded = jwt.verify(token, JWT_SECRET)
    req.user = decoded

    next()
  } catch (error) {
    res.status(401).json({
      success: false,
      message: 'Token ไม่ถูกต้องหรือหมดอายุ'
    })
  }
}

// Middleware สำหรับตรวจสอบว่าเป็น Admin
export const isAdmin = (req, res, next) => {
  if (req.user.role !== 'admin') {
    return res.status(403).json({
      success: false,
      message: 'คุณไม่มีสิทธิ์เข้าถึงส่วนนี้'
    })
  }
  next()
}

// Middleware สำหรับตรวจสอบว่าเป็น User หรือ Admin
export const isUser = (req, res, next) => {
  if (req.user.role !== 'user' && req.user.role !== 'admin') {
    return res.status(403).json({
      success: false,
      message: 'คุณไม่มีสิทธิ์เข้าถึงส่วนนี้'
    })
  }
  next()
}