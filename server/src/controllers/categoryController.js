// controllers/categoryController.js
import { Category } from '../models/categoryModel.js'

// @desc    Get all categories grouped by type
// @route   GET /api/categories
// @access  Private
export const getCategories = async (req, res) => {
  try {
    const categories = await Category.findAllGrouped()

    res.json({
      success: true,
      data: categories
    })
  } catch (error) {
    console.error('Get categories error:', error)
    res.status(500).json({
      success: false,
      message: 'เกิดข้อผิดพลาดในการดึงข้อมูล',
      error: error.message
    })
  }
}

// @desc    Get categories by type
// @route   GET /api/categories/:type
// @access  Private
export const getCategoriesByType = async (req, res) => {
  try {
    const { type } = req.params
    const categories = await Category.findByType(type)

    res.json({
      success: true,
      data: categories
    })
  } catch (error) {
    console.error('Get categories by type error:', error)
    res.status(500).json({
      success: false,
      message: 'เกิดข้อผิดพลาดในการดึงข้อมูล',
      error: error.message
    })
  }
}

// @desc    Create new category
// @route   POST /api/categories
// @access  Private (User + Admin)
export const createCategory = async (req, res) => {
  try {
    const { type, value, label } = req.body
    const created_by = req.user.id

    // ตรวจสอบว่ามีอยู่แล้วหรือไม่
    const exists = await Category.exists(type, value)
    if (exists) {
      return res.status(400).json({
        success: false,
        message: 'หมวดหมู่นี้มีอยู่แล้ว'
      })
    }

    const category = await Category.create({
      type,
      value,
      label,
      created_by
    })

    res.status(201).json({
      success: true,
      message: 'เพิ่มหมวดหมู่สำเร็จ',
      data: category
    })
  } catch (error) {
    console.error('Create category error:', error)
    res.status(500).json({
      success: false,
      message: 'เกิดข้อผิดพลาดในการเพิ่มหมวดหมู่',
      error: error.message
    })
  }
}

// @desc    Update category
// @route   PUT /api/categories/:id
// @access  Private (User + Admin)
export const updateCategory = async (req, res) => {
  try {
    const { id } = req.params
    const { value, label } = req.body

    const category = await Category.update(id, { value, label })

    if (!category) {
      return res.status(404).json({
        success: false,
        message: 'ไม่พบหมวดหมู่'
      })
    }

    res.json({
      success: true,
      message: 'อัปเดตหมวดหมู่สำเร็จ',
      data: category
    })
  } catch (error) {
    console.error('Update category error:', error)
    res.status(500).json({
      success: false,
      message: 'เกิดข้อผิดพลาดในการอัปเดตหมวดหมู่',
      error: error.message
    })
  }
}

// @desc    Delete category
// @route   DELETE /api/categories/:id
// @access  Private (Admin only)
export const deleteCategory = async (req, res) => {
  try {
    const { id } = req.params

    const category = await Category.delete(id)

    if (!category) {
      return res.status(404).json({
        success: false,
        message: 'ไม่พบหมวดหมู่'
      })
    }

    res.json({
      success: true,
      message: 'ลบหมวดหมู่สำเร็จ'
    })
  } catch (error) {
    console.error('Delete category error:', error)
    res.status(500).json({
      success: false,
      message: 'เกิดข้อผิดพลาดในการลบหมวดหมู่',
      error: error.message
    })
  }
}