import express from 'express'
import receiptRoutes from './receiptRoutes.js'
import authRoutes from './authRoutes.js' // ⭐ เพิ่มบรรทัดนี้
import categoryRoutes from './categoryRoutes.js' // ⭐ เพิ่ม
import userRoutes from './userRoutes.js'         // ⭐ เพิ่ม

const router = express.Router()

router.use('/receipts', receiptRoutes)
router.use('/auth', authRoutes) // ⭐ เพิ่มบรรทัดนี้
router.use('/categories', categoryRoutes)        // ⭐ เพิ่ม
router.use('/users', userRoutes)                 // ⭐ เพิ่ม

export default router