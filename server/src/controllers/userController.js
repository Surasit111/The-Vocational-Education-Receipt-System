// controllers/userController.js
import { User } from '../models/userModel.js'
import pool from '../config/database.js'
// @desc    Get admin contact info
// @route   GET /api/users/admin-contact
// @access  Private
export const getAdminContact = async (req, res) => {
  try {
    // ดึงข้อมูล admin คนแรกที่เจอ
    const result = await pool.query(
      `SELECT id, first_name, last_name, phone, email
       FROM users 
       WHERE role = 'admin' AND is_active = true
       ORDER BY created_at ASC
       LIMIT 1`
    )

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'ไม่พบข้อมูลผู้ดูแลระบบ'
      })
    }

    const admin = result.rows[0]

    res.json({
      success: true,
      data: {
        name: `${admin.first_name} ${admin.last_name}`,
        phone: admin.phone || 'ไม่ระบุ',
        email: admin.email,
        status: 'ผู้ดูแลระบบ'
      }
    })

  } catch (error) {
    console.error('Get admin contact error:', error)
    res.status(500).json({
      success: false,
      message: 'เกิดข้อผิดพลาด',
      error: error.message
    })
  }
}

// @desc    Get all users (Admin only)
// @route   GET /api/users
// @access  Private (Admin)
export const getUsers = async (req, res) => {
  try {
    const users = await User.findAll()

    res.json({
      success: true,
      data: users
    })

  } catch (error) {
    console.error('Get users error:', error)
    res.status(500).json({
      success: false,
      message: 'เกิดข้อผิดพลาด',
      error: error.message
    })
  }
}

export const updateProfile = async (req, res) => {
  try {
    const { first_name, last_name, phone } = req.body
    const userId = req.user.id

    // Validate
    if (!first_name || !last_name) {
      return res.status(400).json({
        success: false,
        message: 'กรุณากรอกชื่อและนามสกุล'
      })
    }

    // Update user
    const result = await pool.query(
      `UPDATE users 
       SET first_name = $1, last_name = $2, phone = $3, updated_at = NOW()
       WHERE id = $4
       RETURNING id, email, first_name, last_name, phone, role`,
      [first_name, last_name, phone, userId]
    )

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'ไม่พบผู้ใช้'
      })
    }

    res.json({
      success: true,
      message: 'อัปเดตโปรไฟล์สำเร็จ',
      data: result.rows[0]
    })

  } catch (error) {
    console.error('Update profile error:', error)
    res.status(500).json({
      success: false,
      message: 'เกิดข้อผิดพลาด',
      error: error.message
    })
  }
}

export const getAllAdmins = async (req, res) => {
  try {
    // ดึงข้อมูล admins ทั้งหมด
    const result = await pool.query(
      `SELECT id, first_name, last_name, phone, email
       FROM users 
       WHERE role = 'admin' AND is_active = true
       ORDER BY created_at ASC`
    )

    res.json({
      success: true,
      total: result.rows.length,
      data: result.rows
    })

  } catch (error) {
    console.error('Get admins error:', error)
    res.status(500).json({
      success: false,
      message: 'เกิดข้อผิดพลาด',
      error: error.message
    })
  }
}