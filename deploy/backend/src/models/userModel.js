// models/userModel.js
import pool from '../config/database.js'
import bcrypt from 'bcrypt'

export const User = {
  // สร้าง user ใหม่
  create: async (userData) => {
    const {email, password, first_name, last_name, phone, role = 'user' } = userData
    
    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10)
    
    const result = await pool.query(
      `INSERT INTO users (email, password, first_name, last_name, phone, role)
       VALUES ($1, $2, $3, $4, $5, $6, $7)
       RETURNING id, email, first_name, last_name, phone, role, created_at`,
      [email, hashedPassword, first_name, last_name, phone, role]
    )
    
    return result.rows[0]
  },

  // หา user ด้วย email
  findByEmail: async (email) => {
    const result = await pool.query(
      'SELECT * FROM users WHERE email = $1',
      [email]
    )
    return result.rows[0]
  },

  // หา user ด้วย id
  findById: async (id) => {
    const result = await pool.query(
      'SELECT id,email, first_name, last_name, phone, role, is_active, created_at FROM users WHERE id = $1',
      [id]
    )
    return result.rows[0]
  },

  // ตรวจสอบ password
  comparePassword: async (plainPassword, hashedPassword) => {
    return await bcrypt.compare(plainPassword, hashedPassword)
  },

  // อัปเดต user
  update: async (id, userData) => {
    const { first_name, last_name, phone } = userData
    
    const result = await pool.query(
      `UPDATE users 
       SET first_name = $1, last_name = $2, phone = $3, updated_at = NOW()
       WHERE id = $4
       RETURNING id,email, first_name, last_name, phone, role`,
      [first_name, last_name, phone, id]
    )
    
    return result.rows[0]
  },

  // เปลี่ยน password
  changePassword: async (id, newPassword) => {
    const hashedPassword = await bcrypt.hash(newPassword, 10)
    
    await pool.query(
      'UPDATE users SET password = $1, updated_at = NOW() WHERE id = $2',
      [hashedPassword, id]
    )
  },

  // ดึง users ทั้งหมด (admin only)
  findAll: async () => {
    const result = await pool.query(
      'SELECT id, email, first_name, last_name, phone, role, is_active, created_at FROM users ORDER BY created_at DESC'
    )
    return result.rows
  },

  // ลบ user (soft delete)
  delete: async (id) => {
    await pool.query(
      'UPDATE users SET is_active = false WHERE id = $1',
      [id]
    )
  }
}