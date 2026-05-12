import pool from '../config/database.js'

export const Receipt = {
  // สร้างใบเสร็จใหม่ (พร้อม PDF)
  create: async (data) => {
    const {
      receipt_number, receipt_date, academic_year, semester, name_type,
      payer_name, month, location, agency,
      amount, pdf_data // pdf_data เป็น Buffer
    } = data
    
    const result = await pool.query(
      `INSERT INTO receipts (
        receipt_number, receipt_date, academic_year, semester, name_type,
        payer_name, month, location, agency,
        amount, pdf_data
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
      RETURNING id, receipt_number, receipt_date, academic_year, semester, 
                name_type, payer_name, month, location, agency,
                amount, created_at, updated_at,
                CASE WHEN pdf_data IS NOT NULL THEN true ELSE false END as has_pdf`,
      [receipt_number, receipt_date, academic_year, semester, name_type,
       payer_name, month, location, agency,amount, pdf_data]
    )
    return result.rows[0]
  },

  // ค้นหาด้วยฟิลเตอร์หลายแบบ (ไม่ดึง pdf_data เพื่อประหยัด bandwidth)
  findWithFilters: async (filters = {}) => {
    let query = `
      SELECT 
        id, receipt_number, receipt_date, academic_year, semester,
        name_type, payer_name, month, location, agency,amount, 
        created_at, updated_at,
        CASE WHEN pdf_data IS NOT NULL THEN true ELSE false END as has_pdf
      FROM receipts 
      WHERE 1=1
    `
    const params = []
    let paramCount = 1

    // Filter: เดือนเริ่มต้น
    if (filters.month_start) {
      query += ` AND month >= $${paramCount}`
      params.push(parseInt(filters.month_start))
      paramCount++
    }
    
    // Filter: เดือนสิ้นสุด
    if (filters.month_end) {
      query += ` AND month <= $${paramCount}`
      params.push(parseInt(filters.month_end))
      paramCount++
    }

    // Filter: ปีการศึกษา
    if (filters.academic_year) {
      query += ` AND academic_year = $${paramCount}`
      params.push(filters.academic_year)
      paramCount++
    }

    // Filter: ภาคเรียน
    if (filters.semester) {
      query += ` AND semester = $${paramCount}`
      params.push(parseInt(filters.semester))
      paramCount++
    }

    // Filter: ชื่อผู้ปฏิบัติงาน
    if (filters.name) {
      query += ` AND payer_name ILIKE $${paramCount}`
      params.push(`%${filters.name}%`)
      paramCount++
    }

    // Filter เก่าที่รองรับไว้
    if (filters.day) {
      query += ` AND EXTRACT(DAY FROM receipt_date) = $${paramCount}`
      params.push(filters.day)
      paramCount++
    }
    
    if (filters.month) {
      query += ` AND month = $${paramCount}`
      params.push(parseInt(filters.month))
      paramCount++
    }
    
    if (filters.year) {
      query += ` AND EXTRACT(YEAR FROM receipt_date) = $${paramCount}`
      params.push(filters.year)
      paramCount++
    }

    query += ' ORDER BY receipt_date DESC, created_at DESC'

    const result = await pool.query(query, params)
    return result.rows
  },

  // นับจำนวนด้วยฟิลเตอร์
  countWithFilters: async (filters = {}) => {
    let query = 'SELECT COUNT(*) as total FROM receipts WHERE 1=1'
    const params = []
    let paramCount = 1

    if (filters.month_start) {
      query += ` AND month >= $${paramCount}`
      params.push(parseInt(filters.month_start))
      paramCount++
    }
    
    if (filters.month_end) {
      query += ` AND month <= $${paramCount}`
      params.push(parseInt(filters.month_end))
      paramCount++
    }

    if (filters.academic_year) {
      query += ` AND academic_year = $${paramCount}`
      params.push(filters.academic_year)
      paramCount++
    }

    if (filters.semester) {
      query += ` AND semester = $${paramCount}`
      params.push(parseInt(filters.semester))
      paramCount++
    }

    if (filters.name) {
      query += ` AND payer_name ILIKE $${paramCount}`
      params.push(`%${filters.name}%`)
      paramCount++
    }

    if (filters.day) {
      query += ` AND EXTRACT(DAY FROM receipt_date) = $${paramCount}`
      params.push(filters.day)
      paramCount++
    }
    
    if (filters.month) {
      query += ` AND month = $${paramCount}`
      params.push(parseInt(filters.month))
      paramCount++
    }
    
    if (filters.year) {
      query += ` AND EXTRACT(YEAR FROM receipt_date) = $${paramCount}`
      params.push(filters.year)
      paramCount++
    }

    const result = await pool.query(query, params)
    return parseInt(result.rows[0].total)
  },

  // ดึงข้อมูลทั้งหมด (ไม่รวม pdf_data)
  findAll: async () => {
    const result = await pool.query(
      `SELECT 
        id, receipt_number, receipt_date, academic_year, semester,
        name_type, payer_name, month, location, agency,
        amount, created_at, updated_at,
        CASE WHEN pdf_data IS NOT NULL THEN true ELSE false END as has_pdf
      FROM receipts 
      ORDER BY receipt_date DESC, created_at DESC`
    )
    return result.rows
  },

  // ดึงข้อมูลตาม ID (ไม่รวม pdf_data)
  findById: async (id) => {
    const result = await pool.query(
      `SELECT 
        id, receipt_number, receipt_date, academic_year, semester,
        name_type, payer_name, month, location, agency,
        amount, created_at, updated_at,
        CASE WHEN pdf_data IS NOT NULL THEN true ELSE false END as has_pdf
      FROM receipts 
      WHERE id = $1`,
      [id]
    )
    return result.rows[0]
  },

  // ดึง PDF data
  getPDF: async (id) => {
    const result = await pool.query(
      'SELECT pdf_data, receipt_number FROM receipts WHERE id = $1',
      [id]
    )
    return result.rows[0]
  },

  // อัปเดต PDF
  updatePDF: async (id, pdfBuffer) => {
    const result = await pool.query(
      'UPDATE receipts SET pdf_data = $1, updated_at = NOW() WHERE id = $2 RETURNING id',
      [pdfBuffer, id]
    )
    return result.rows[0]
  },

  // ตรวจสอบว่ามี PDF หรือไม่
  hasPDF: async (id) => {
    const result = await pool.query(
      'SELECT CASE WHEN pdf_data IS NOT NULL THEN true ELSE false END as has_pdf FROM receipts WHERE id = $1',
      [id]
    )
    return result.rows[0]?.has_pdf || false
  },

  // ดึงรายชื่อผู้ปฏิบัติงานที่ไม่ซ้ำกัน
  getUniqueNames: async () => {
    const result = await pool.query(
      `SELECT DISTINCT payer_name 
       FROM receipts 
       WHERE payer_name IS NOT NULL 
       ORDER BY payer_name`
    )
    return result.rows.map(row => row.payer_name)
  },

  // สร้างเลขที่ใบเสร็จอัตโนมัติ
  generateReceiptNumber: async () => {
    const result = await pool.query(
      'SELECT receipt_number FROM receipts ORDER BY created_at DESC LIMIT 1'
    )
    
    if (result.rows.length === 0) {
      return 'RCP-0001'
    }
    
    const lastNumber = result.rows[0].receipt_number
    const num = parseInt(lastNumber.split('-')[1]) + 1
    return `RCP-${num.toString().padStart(4, '0')}`
  },

  // ลบใบเสร็จ
  delete: async (id) => {
    const result = await pool.query(
      'DELETE FROM receipts WHERE id = $1 RETURNING id',
      [id]
    )
    return result.rows[0]
  }
}