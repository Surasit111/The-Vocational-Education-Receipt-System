// models/categoryModel.js
import pool from '../config/database.js'

export const Category = {
  // ดึงหมวดหมู่ทั้งหมดตาม type
  findByType: async (type) => {
    const result = await pool.query(
      'SELECT * FROM categories WHERE type = $1 ORDER BY label ASC',
      [type]
    )
    return result.rows
  },

  // ดึงหมวดหมู่ทั้งหมด
  findAll: async () => {
    const result = await pool.query(
      'SELECT * FROM categories ORDER BY type, label ASC'
    )
    return result.rows
  },

  // ดึงหมวดหมู่แบบแยกตาม type
  findAllGrouped: async () => {
    const result = await pool.query(
      'SELECT * FROM categories ORDER BY type, label ASC'
    )
    
    const grouped = {}
    result.rows.forEach(row => {
      if (!grouped[row.type]) {
        grouped[row.type] = []
      }
      grouped[row.type].push(row)
    })
    
    return grouped
  },

  // เพิ่มหมวดหมู่ใหม่
  create: async (categoryData) => {
    const { type, value, label, created_by } = categoryData
    
    const result = await pool.query(
      `INSERT INTO categories (type, value, label, created_by)
       VALUES ($1, $2, $3, $4)
       RETURNING *`,
      [type, value, label, created_by]
    )
    
    return result.rows[0]
  },

  // อัปเดตหมวดหมู่
  update: async (id, categoryData) => {
    const { value, label } = categoryData
    
    const result = await pool.query(
      `UPDATE categories 
       SET value = $1, label = $2, updated_at = NOW()
       WHERE id = $3
       RETURNING *`,
      [value, label, id]
    )
    
    return result.rows[0]
  },

  // ลบหมวดหมู่
  delete: async (id) => {
    const result = await pool.query(
      'DELETE FROM categories WHERE id = $1 RETURNING id',
      [id]
    )
    return result.rows[0]
  },

  // ตรวจสอบว่ามีอยู่แล้วหรือไม่
  exists: async (type, value) => {
    const result = await pool.query(
      'SELECT id FROM categories WHERE type = $1 AND value = $2',
      [type, value]
    )
    return result.rows.length > 0
  }
}