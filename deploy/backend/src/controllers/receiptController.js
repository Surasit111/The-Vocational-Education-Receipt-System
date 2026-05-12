import pool from '../config/database.js'
import { Receipt } from '../models/receiptModel.js'
import { generateReceiptPDF } from '../utils/pdfGenerator.js'

// @desc    Create new receipt
// @route   POST /api/receipts
// @access  Private (ถ้ามี auth)
export const createReceipt = async (req, res) => {
  const client = await pool.connect()
  
  try {
    const {
      academic_year,
      semester,
      name_type,
      payer_name,
      location,
      agency,
      supervisor,
      supervisor_position,
      payment_entries,
      pdf_base64
    } = req.body

    if (!academic_year || !semester || !name_type || !payer_name || 
        !location || !agency || !supervisor || !supervisor_position) {
      return res.status(400).json({
        success: false,
        message: 'กรุณากรอกข้อมูลให้ครบถ้วน'
      })
    }

    if (!payment_entries || payment_entries.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'กรุณาเพิ่มรายการชำระเงินอย่างน้อย 1 รายการ'
      })
    }

    await client.query('BEGIN')

    const year = new Date().getFullYear()

    const lastReceiptResult = await client.query(
      `SELECT receipt_number 
      FROM receipts 
      WHERE receipt_number LIKE $1 
      ORDER BY receipt_number DESC 
      LIMIT 1`,
      [`RC-${year}-%`]
    )

    let nextNumber = 1
    if (lastReceiptResult.rows.length > 0) {
      const lastNumber = lastReceiptResult.rows[0].receipt_number.split('-')[2]
      nextNumber = parseInt(lastNumber) + 1
    }

    const receipt_number = `RC-${year}-${String(nextNumber).padStart(4, '0')}`

    let pdfBuffer = null
    if (pdf_base64) {
      pdfBuffer = Buffer.from(pdf_base64, 'base64')
    }

    const userId = req.user?.id 

    const receiptResult = await client.query(
      `INSERT INTO receipts (
        receipt_number, academic_year, semester, name_type, payer_name,
        location, agency, supervisor, supervisor_position, pdf_data, created_by
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
      RETURNING *`,
      [
        receipt_number, academic_year, semester, name_type, payer_name,
        location, agency, supervisor, supervisor_position, pdfBuffer, userId
      ]
    )

    const receipt = receiptResult.rows[0]

    const paymentPromises = payment_entries.map((entry, index) => {
      return client.query(
        `INSERT INTO payment_entries (receipt_id, payment_date, amount, entry_order)
         VALUES ($1, $2, $3, $4)
         RETURNING *`,
        [receipt.id, entry.date, entry.amount, index + 1]
      )
    })

    const paymentResults = await Promise.all(paymentPromises)
    const payments = paymentResults.map(r => r.rows[0])

    await client.query('COMMIT')

    res.status(201).json({
      success: true,
      message: 'สร้างใบเสร็จสำเร็จ',
      receipt_number: receipt.receipt_number,
      data: {
        ...receipt,
        pdf_data: undefined,
        has_pdf: pdfBuffer !== null,
        payment_entries: payments
      }
    })

  } catch (error) {
    await client.query('ROLLBACK')
    console.error('Create receipt error:', error)
    res.status(500).json({
      success: false,
      message: 'เกิดข้อผิดพลาดในการสร้างใบเสร็จ',
      error: error.message
    })
  } finally {
    client.release()
  }
}

// @desc    Get all receipts with filters
// @route   GET /api/receipts
// @access  Private
export const getReceipts = async (req, res) => {
  try {
    const { 
      receipt_number, 
      month, 
      month_start,
      month_end,
      location, 
      agency, 
      name,
      academic_year,
      semester
    } = req.query

    const isAdmin = req.user?.role === 'admin'
    const userId = req.user?.id

    let query = `
      SELECT 
        r.id, r.receipt_number, r.receipt_date, r.academic_year, r.semester,
        r.name_type, r.payer_name, r.location, r.agency, r.supervisor,
        r.supervisor_position, r.created_at, r.updated_at, r.created_by,
        CASE WHEN r.pdf_data IS NOT NULL THEN true ELSE false END as has_pdf,
        u.first_name as creator_first_name, 
        u.last_name as creator_last_name, 
        u.phone as creator_phone, 
        u.email as creator_email,
        u.role as creator_role,
        json_agg(
          json_build_object(
            'id', pe.id,
            'payment_date', pe.payment_date,
            'amount', pe.amount,
            'entry_order', pe.entry_order
          ) ORDER BY pe.entry_order
        ) as payment_entries
      FROM receipts r
      LEFT JOIN payment_entries pe ON r.id = pe.receipt_id
      LEFT JOIN users u ON r.created_by = u.id
      WHERE 1=1
    `

    const params = []
    let paramCount = 1

    if (receipt_number) {
      query += ` AND r.receipt_number ILIKE $${paramCount}`
      params.push(`%${receipt_number}%`)
      paramCount++
    }

    if (month_start) {
      query += ` AND EXISTS (
        SELECT 1 FROM payment_entries 
        WHERE receipt_id = r.id 
        AND EXTRACT(MONTH FROM payment_date) >= $${paramCount}
      )`
      params.push(month_start)
      paramCount++
    }

    if (month_end) {
      query += ` AND EXISTS (
        SELECT 1 FROM payment_entries 
        WHERE receipt_id = r.id 
        AND EXTRACT(MONTH FROM payment_date) <= $${paramCount}
      )`
      params.push(month_end)
      paramCount++
    }

    if (month && !month_start && !month_end) {
      query += ` AND EXISTS (
        SELECT 1 FROM payment_entries 
        WHERE receipt_id = r.id 
        AND EXTRACT(MONTH FROM payment_date) = $${paramCount}
      )`
      params.push(month)
      paramCount++
    }

    if (academic_year) {
      query += ` AND r.academic_year = $${paramCount}`
      params.push(academic_year)
      paramCount++
    }

    if (semester) {
      query += ` AND r.semester = $${paramCount}`
      params.push(semester)
      paramCount++
    }

    if (location) {
      query += ` AND r.location = $${paramCount}`
      params.push(location)
      paramCount++
    }

    if (agency) {
      query += ` AND r.agency = $${paramCount}`
      params.push(agency)
      paramCount++
    }

    if (name) {
      query += ` AND TRIM(r.payer_name) ILIKE TRIM($${paramCount})`
      params.push(`%${name.trim()}%`)
      paramCount++
    }

    query += ` GROUP BY r.id, u.first_name, u.last_name, u.phone, u.email, u.role ORDER BY r.created_at DESC`

    const result = await pool.query(query, params)

    res.json({
      success: true,
      total: result.rows.length,
      data: result.rows,
      isAdmin: isAdmin
    })

  } catch (error) {
    console.error('Get receipts error:', error)
    res.status(500).json({
      success: false,
      message: 'เกิดข้อผิดพลาดในการดึงข้อมูล',
      error: error.message
    })
  }
}

// @desc    Get single receipt by ID
// @route   GET /api/receipts/:id
// @access  Private
export const getReceipt = async (req, res) => {
  try {
    const { id } = req.params

    const result = await pool.query(
      `SELECT 
        r.id, r.receipt_number, r.receipt_date, r.academic_year, r.semester,
        r.name_type, r.payer_name, r.location, r.agency, r.supervisor,
        r.supervisor_position, r.created_at, r.updated_at,
        CASE WHEN r.pdf_data IS NOT NULL THEN true ELSE false END as has_pdf,
        json_agg(
          json_build_object(
            'id', pe.id,
            'payment_date', pe.payment_date,
            'amount', pe.amount,
            'entry_order', pe.entry_order
          ) ORDER BY pe.entry_order
        ) as payment_entries
      FROM receipts r
      LEFT JOIN payment_entries pe ON r.id = pe.receipt_id
      WHERE r.id = $1
      GROUP BY r.id`,
      [id]
    )

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'ไม่พบใบเสร็จ'
      })
    }

    res.json({
      success: true,
      data: result.rows[0]
    })

  } catch (error) {
    console.error('Get receipt error:', error)
    res.status(500).json({
      success: false,
      message: 'เกิดข้อผิดพลาดในการดึงข้อมูล',
      error: error.message
    })
  }
}

// @desc    Get unique names for filter
// @route   GET /api/receipts/names
// @access  Private
export const getUniqueNames = async (req, res) => {
  try {
    const names = await Receipt.getUniqueNames()

    res.json({
      success: true,
      data: names
    })

  } catch (error) {
    console.error('Get names error:', error)
    res.status(500).json({
      success: false,
      message: 'เกิดข้อผิดพลาดในการดึงรายชื่อ',
      error: error.message
    })
  }
}

// @desc    View PDF (inline) - สร้าง PDF ใหม่จากข้อมูล
// @route   GET /api/receipts/:id/pdf
// @access  Private
export const viewPDF = async (req, res) => {
  try {
    const { id } = req.params

    // ⭐ ดึงข้อมูลใบเสร็จพร้อม payment entries
    const result = await pool.query(
      `SELECT 
        r.id, r.receipt_number, r.receipt_date, r.academic_year, r.semester,
        r.name_type, r.payer_name, r.location, r.agency, r.supervisor,
        r.supervisor_position, r.created_at, r.updated_at,
        json_agg(
          json_build_object(
            'id', pe.id,
            'payment_date', pe.payment_date,
            'amount', pe.amount,
            'entry_order', pe.entry_order
          ) ORDER BY pe.entry_order
        ) as payment_entries
      FROM receipts r
      LEFT JOIN payment_entries pe ON r.id = pe.receipt_id
      WHERE r.id = $1
      GROUP BY r.id`,
      [id]
    )

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'ไม่พบใบเสร็จ'
      })
    }

    const receipt = result.rows[0]

    // ⭐ สร้าง PDF จากข้อมูล
    const pdfBuffer = await generateReceiptPDF({
      receipt: receipt,
      paymentEntries: receipt.payment_entries
    })

    // ส่ง PDF เพื่อแสดงในเบราว์เซอร์
    res.setHeader('Content-Type', 'application/pdf')
    res.setHeader('Content-Disposition', 'inline')
    res.setHeader('Content-Length', pdfBuffer.length)
    res.send(pdfBuffer)

  } catch (error) {
    console.error('View PDF error:', error)
    res.status(500).json({
      success: false,
      message: 'เกิดข้อผิดพลาดในการเปิดไฟล์ PDF',
      error: error.message
    })
  }
}

// ⭐ ลบฟังก์ชัน downloadPDF ออกทั้งหมด (ไม่ต้องใช้แล้ว)

// @desc    Update PDF
// @route   PUT /api/receipts/:id/pdf
// @access  Private
export const updatePDF = async (req, res) => {
  try {
    const { id } = req.params
    const { pdf_base64 } = req.body

    if (!pdf_base64) {
      return res.status(400).json({
        success: false,
        message: 'กรุณาส่งไฟล์ PDF'
      })
    }

    const receipt = await Receipt.findById(id)
    if (!receipt) {
      return res.status(404).json({
        success: false,
        message: 'ไม่พบใบเสร็จ'
      })
    }

    const pdfBuffer = Buffer.from(pdf_base64, 'base64')
    await Receipt.updatePDF(id, pdfBuffer)

    res.json({
      success: true,
      message: 'อัปเดตไฟล์ PDF สำเร็จ'
    })

  } catch (error) {
    console.error('Update PDF error:', error)
    res.status(500).json({
      success: false,
      message: 'เกิดข้อผิดพลาดในการอัปเดตไฟล์ PDF',
      error: error.message
    })
  }
}

// @desc    Check if receipt has PDF
// @route   GET /api/receipts/:id/has-pdf
// @access  Private
export const checkHasPDF = async (req, res) => {
  try {
    const { id } = req.params
    const hasPdf = await Receipt.hasPDF(id)

    res.json({
      success: true,
      has_pdf: hasPdf
    })

  } catch (error) {
    console.error('Check PDF error:', error)
    res.status(500).json({
      success: false,
      message: 'เกิดข้อผิดพลาดในการตรวจสอบไฟล์ PDF',
      error: error.message
    })
  }
}

// @desc    Delete receipt
// @route   DELETE /api/receipts/:id
// @access  Private (Admin only)
export const deleteReceipt = async (req, res) => {
  const client = await pool.connect()
  
  try {
    const { id } = req.params
    
    // ⭐ เช็คสิทธิ์ Admin
    if (req.user?.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: '⛔ คุณไม่มีสิทธิ์ลบใบเสร็จ (เฉพาะผู้ดูแลระบบ)'
      })
    }

    await client.query('BEGIN')

    await client.query('DELETE FROM payment_entries WHERE receipt_id = $1', [id])

    const result = await client.query(
      'DELETE FROM receipts WHERE id = $1 RETURNING id',
      [id]
    )

    if (result.rows.length === 0) {
      await client.query('ROLLBACK')
      return res.status(404).json({
        success: false,
        message: 'ไม่พบใบเสร็จ'
      })
    }

    await client.query('COMMIT')

    res.json({
      success: true,
      message: 'ลบใบเสร็จสำเร็จ'
    })

  } catch (error) {
    await client.query('ROLLBACK')
    console.error('Delete receipt error:', error)
    res.status(500).json({
      success: false,
      message: 'เกิดข้อผิดพลาดในการลบใบเสร็จ',
      error: error.message
    })
  } finally {
    client.release()
  }
}

// @desc    Generate PDF without saving to database
// @route   POST /api/receipts/generate-pdf
// @access  Public (ไม่ต้อง login)
export const generatePDFOnly = async (req, res) => {
  try {
    const {
      academic_year,
      semester,
      name_type,
      payer_name,
      location,
      agency,
      supervisor,
      supervisor_position,
      payment_entries
    } = req.body

    // Validate
    if (!academic_year || !semester || !name_type || !payer_name || 
        !location || !agency || !supervisor || !supervisor_position) {
      return res.status(400).json({
        success: false,
        message: 'กรุณากรอกข้อมูลให้ครบถ้วน'
      })
    }

    if (!payment_entries || payment_entries.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'กรุณาเพิ่มรายการชำระเงินอย่างน้อย 1 รายการ'
      })
    }

    // ⭐ สร้าง PDF โดยตรง ไม่บันทึก Database
    const receiptData = {
      receipt: {
        academic_year,
        semester,
        name_type,
        payer_name,
        location,
        agency,
        supervisor,
        supervisor_position
      },
      paymentEntries: payment_entries.map(entry => ({
        payment_date: entry.date,
        amount: entry.amount
      }))
    }

    const pdfBuffer = await generateReceiptPDF(receiptData)

    // ส่ง PDF กลับไปแสดงในเบราว์เซอร์
    res.setHeader('Content-Type', 'application/pdf')
    res.setHeader('Content-Disposition', 'inline; filename="receipt-preview.pdf"')
    res.setHeader('Content-Length', pdfBuffer.length)
    res.send(pdfBuffer)

  } catch (error) {
    console.error('Generate PDF error:', error)
    res.status(500).json({
      success: false,
      message: 'เกิดข้อผิดพลาดในการสร้าง PDF',
      error: error.message
    })
  }
}