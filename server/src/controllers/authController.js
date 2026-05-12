// controllers/authController.js
import { User } from '../models/userModel.js'
import jwt from 'jsonwebtoken'

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production'
const JWT_EXPIRES_IN = '7d'

// @desc    Register new user
// @route   POST /api/auth/register
// @access  Public
export const register = async (req, res) => {
  try {
    const {email, password, confirmPassword, first_name, last_name, phone } = req.body

    // Validate input
    if (!email || !password || !confirmPassword || !first_name || !last_name) {
      return res.status(400).json({
        success: false,
        message: 'กรุณากรอกข้อมูลให้ครบถ้วน'
      })
    }

    // ตรวจสอบว่า password ตรงกันไหม
    if (password !== confirmPassword) {
      return res.status(400).json({
        success: false,
        message: 'รหัสผ่านไม่ตรงกัน'
      })
    }

    // ตรวจสอบว่า email ลงท้ายด้วย @lru.ac.th
    if (!email.endsWith('@lru.ac.th')) {
      return res.status(400).json({
        success: false,
        message: 'กรุณาใช้อีเมล @lru.ac.th เท่านั้น'
      })
    }

    // ตรวจสอบว่า email ซ้ำไหม
    const existingEmail = await User.findByEmail(email)
    if (existingEmail) {
      return res.status(400).json({
        success: false,
        message: 'อีเมลนี้ถูกใช้งานแล้ว'
      })
    }

    // สร้าง user ใหม่
    const user = await User.create({
      email,
      password,
      first_name,
      last_name,
      phone,
      role: 'user' // default role
    })

    // ดึงแอดมินคนแรกเพื่อตรวจสอบ is_primary
    const firstAdmin = await User.findFirstAdmin()
    const isPrimary = firstAdmin && firstAdmin.id === user.id

    // สร้าง JWT token
    const token = jwt.sign(
      { id: user.id, email: user.email, role: user.role, is_primary: isPrimary },
      JWT_SECRET,
      { expiresIn: JWT_EXPIRES_IN }
    )



    res.status(201).json({
      success: true,
      message: 'สมัครสมาชิกสำเร็จ',
      token,
      user: {
        id: user.id,
        email: user.email,
        first_name: user.first_name,
        last_name: user.last_name,
        phone: user.phone,
        role: user.role,
        is_primary: firstAdmin && firstAdmin.id === user.id
      }
    })

  } catch (error) {
    console.error('Register error:', error)
    res.status(500).json({
      success: false,
      message: 'เกิดข้อผิดพลาดในการสมัครสมาชิก',
      error: error.message
    })
  }
}

// @desc    Login user
// @route   POST /api/auth/login
// @access  Public
export const login = async (req, res) => {
  try {
    const { email, password } = req.body

    // Validate input
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'กรุณากรอกอีเมลและรหัสผ่าน'
      })
    }

    // หา user
    const user = await User.findByEmail(email)
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'อีเมลหรือรหัสผ่านไม่ถูกต้อง'
      })
    }

    // ตรวจสอบว่า user ถูก active ไหม
    if (!user.is_active) {
      return res.status(401).json({
        success: false,
        message: 'บัญชีนี้ถูกระงับการใช้งาน'
      })
    }

    // ตรวจสอบ password
    const isPasswordValid = await User.comparePassword(password, user.password)
    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        message: 'อีเมลหรือรหัสผ่านไม่ถูกต้อง'
      })
    }

    // ดึงแอดมินคนแรกเพื่อตรวจสอบ is_primary
    const firstAdmin = await User.findFirstAdmin()
    const isPrimary = firstAdmin && firstAdmin.id === user.id

    // สร้าง JWT token
    const token = jwt.sign(
      { id: user.id, email: user.email, role: user.role, is_primary: isPrimary },
      JWT_SECRET,
      { expiresIn: JWT_EXPIRES_IN }
    )



    res.json({
      success: true,
      message: 'เข้าสู่ระบบสำเร็จ',
      token,
      user: {
        id: user.id,
        email: user.email,
        first_name: user.first_name,
        last_name: user.last_name,
        phone: user.phone,
        role: user.role,
        is_primary: firstAdmin && firstAdmin.id === user.id
      }
    })

  } catch (error) {
    console.error('Login error:', error)
    res.status(500).json({
      success: false,
      message: 'เกิดข้อผิดพลาดในการเข้าสู่ระบบ',
      error: error.message
    })
  }
}

// @desc    Get current user
// @route   GET /api/auth/me
// @access  Private
export const getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user.id)

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'ไม่พบผู้ใช้'
      })
    }

    // ดึงแอดมินคนแรกเพื่อตรวจสอบ is_primary
    const firstAdmin = await User.findFirstAdmin()

    res.json({
      success: true,
      user: {
        ...user,
        is_primary: firstAdmin && firstAdmin.id === user.id
      }
    })

  } catch (error) {
    console.error('Get me error:', error)
    res.status(500).json({
      success: false,
      message: 'เกิดข้อผิดพลาด',
      error: error.message
    })
  }
}

// @desc    Logout user
// @route   POST /api/auth/logout
// @access  Private
export const logout = async (req, res) => {
  // ใน JWT ไม่สามารถ logout ได้จริงๆ
  // ต้องให้ Frontend ลบ token ออก
  res.json({
    success: true,
    message: 'ออกจากระบบสำเร็จ'
  })
}