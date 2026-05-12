// controllers/adminController.js
import { User } from '../models/userModel.js'

// @desc    Get all admins
// @route   GET /api/users/admins/manage
// @access  Private (Admin)
export const getAdmins = async (req, res) => {
    try {
        const admins = await User.findAllAdmins()
        const firstAdmin = await User.findFirstAdmin()

        // เพิ่ม flag is_primary ให้แอดมินคนแรก
        const adminsWithFlag = admins.map(admin => ({
            ...admin,
            is_primary: admin.id === firstAdmin?.id
        }))

        res.json({
            success: true,
            total: adminsWithFlag.length,
            data: adminsWithFlag
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

// @desc    Create new admin
// @route   POST /api/users/admins/manage
// @access  Private (Admin)
export const createAdmin = async (req, res) => {
    try {
        const { email, password, first_name, last_name, phone, role = 'admin' } = req.body

        // Validate input
        if (!email || !password || !first_name || !last_name) {
            return res.status(400).json({
                success: false,
                message: 'กรุณากรอกข้อมูลให้ครบถ้วน (อีเมล, รหัสผ่าน, ชื่อ, นามสกุล)'
            })
        }

        // ตรวจสอบว่า email ลงท้ายด้วย @lru.ac.th
        if (!email.endsWith('@lru.ac.th')) {
            return res.status(400).json({
                success: false,
                message: 'กรุณาใช้อีเมล @lru.ac.th เท่านั้น'
            })
        }

        // ตรวจสอบ email ซ้ำ
        const existingUser = await User.findByEmail(email)
        if (existingUser) {
            return res.status(400).json({
                success: false,
                message: 'อีเมลนี้ถูกใช้งานแล้ว'
            })
        }

        const admin = await User.createAdmin({
            email,
            password,
            first_name,
            last_name,
            phone,
            role
        })

        res.status(201).json({
            success: true,
            message: 'เพิ่มผู้ใช้สำเร็จ',
            data: admin
        })
    } catch (error) {
        console.error('Create admin error:', error)
        res.status(500).json({
            success: false,
            message: 'เกิดข้อผิดพลาดในการเพิ่มแอดมิน',
            error: error.message
        })
    }
}

// @desc    Update admin/user
// @route   PUT /api/users/admins/manage/:id
// @access  Private (Admin)
export const updateAdmin = async (req, res) => {
    try {
        const { id } = req.params
        const { first_name, last_name, phone, email, role } = req.body
        const currentUserId = req.user.id

        // ดึงข้อมูลผู้ที่กำลังจะถูกแก้ไข
        const targetUser = await User.findById(id)
        if (!targetUser) {
            return res.status(404).json({ success: false, message: 'ไม่พบผู้ใช้ที่ต้องการแก้ไข' })
        }

        // ดึงข้อมูลแอดมินคนแรก (Super Admin)
        const firstAdmin = await User.findFirstAdmin()
        const isTargetSuperAdmin = firstAdmin && firstAdmin.id === parseInt(id)
        const isTargetAdmin = targetUser.role === 'admin' && !isTargetSuperAdmin

        // เช็คสิทธิ์ผู้แก้ไข
        const isCurrentSuperAdmin = firstAdmin && firstAdmin.id === currentUserId

        if (!isCurrentSuperAdmin) {
            // ถ้าไม่ใช่ Super Admin ห้ามแก้ Super Admin หรือ Admin ระดับเดียวกัน
            if (isTargetSuperAdmin || isTargetAdmin) {
                return res.status(403).json({
                    success: false,
                    message: 'คุณไม่มีสิทธิ์แก้ไขผู้ใช้ระดับนี้'
                })
            }
        }

        // Validate input
        if (!first_name || !last_name) {
            return res.status(400).json({ success: false, message: 'กรุณากรอกชื่อและนามสกุล' })
        }

        const updated = await User.updateAdmin(parseInt(id), {
            first_name,
            last_name,
            phone,
            email,
            role: isCurrentSuperAdmin ? role : targetUser.role // เฉพาะ Super Admin ถึงจะเปลี่ยน Role ได้
        })

        res.json({
            success: true,
            message: 'แก้ไขข้อมูลสำเร็จ',
            data: updated
        })
    } catch (error) {
        console.error('Update admin error:', error)
        res.status(500).json({
            success: false,
            message: 'เกิดข้อผิดพลาดในการแก้ไขข้อมูล',
            error: error.message
        })
    }
}

// @desc    Delete admin/user
// @route   DELETE /api/users/admins/manage/:id
// @access  Private (Admin)
export const deleteAdmin = async (req, res) => {
    try {
        const { id } = req.params
        const currentUserId = req.user.id

        // ดึงข้อมูลผู้ที่กำลังจะถูกลบ
        const targetUser = await User.findById(id)
        if (!targetUser) {
            return res.status(404).json({ success: false, message: 'ไม่พบผู้ใช้ที่ต้องการลบ' })
        }

        // เช็คสิทธิ์ผู้ลบ
        const firstAdmin = await User.findFirstAdmin()
        const isCurrentSuperAdmin = firstAdmin && firstAdmin.id === currentUserId
        const isTargetSuperAdmin = firstAdmin && firstAdmin.id === parseInt(id)
        const isTargetAdmin = targetUser.role === 'admin' && !isTargetSuperAdmin

        // ป้องกันลบตัวเอง
        if (currentUserId === parseInt(id)) {
            return res.status(403).json({ success: false, message: 'ไม่สามารถลบตัวเองได้' })
        }

        // กฎการลบ:
        // 1. Super Admin ลบได้ทุกคน (ยกเว้นตัวเอง)
        // 2. Admin ทั่วไป ลบได้เฉพาะ Staff (role: user) เท่านั้น
        if (!isCurrentSuperAdmin) {
            if (isTargetSuperAdmin || isTargetAdmin) {
                return res.status(403).json({
                    success: false,
                    message: 'คุณไม่มีสิทธิ์ลบผู้ใช้ระดับ Admin หรือ Super Admin'
                })
            }
        }

        const deleted = await User.deleteAdmin(parseInt(id))

        res.json({
            success: true,
            message: 'ลบผู้ใช้เรียบร้อย'
        })
    } catch (error) {
        console.error('Delete admin error:', error)
        res.status(500).json({
            success: false,
            message: 'เกิดข้อผิดพลาดในการลบผู้ใช้',
            error: error.message
        })
    }
}
