import jwt from 'jsonwebtoken'

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production'

// ⭐ Optional Auth Middleware - ไม่บังคับต้องมี token
export const optionalAuth = (req, res, next) => {
  try {
    // ดึง token จาก header
    const token = req.header('Authorization')?.replace('Bearer ', '')

    if (token) {
      try {
        // ถ้ามี token ให้ verify
        const decoded = jwt.verify(token, JWT_SECRET)
        req.user = decoded
      } catch (error) {
        // มี token แต่ไม่ถูกต้อง → ignore แล้วทำงานต่อ
        console.log('Invalid token, proceeding without auth')
      }
    }

    // ไม่มี token หรือ token ไม่ถูกต้อง → ทำงานต่อได้ปกติ
    next()
  } catch (error) {
    // Error ใดๆ ก็ไม่ block การทำงาน
    next()
  }
}