import pool from '../config/database.js'

export const Receipt = {
  // สร้างใบเสร็จใหม่ (พร้อม PDF)
  create: async (data) => {
    const {
      receipt_number, receipt_date, academic_year, semester, name_type,
      payer_name, month, location, agency,
      amount, pdf_data // pdf_data เป็น Buffer
    } = data
    
    const [result] = await pool.query(
      `INSERT INTO receipts (
        receipt_number, receipt_date, academic_year, semester, name_type,
        payer_name, month, location, agency,
        amount, pdf_data
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [receipt_number, receipt_date, academic_year, semester, name_type,
       payer_name, month, location, agency, amount, pdf_data]
    )
    
    // MySQL: ดึงข้อมูลที่เพิ่งสร้างด้วย lastInsertId
    const [rows] = await pool.query(
      `SELECT 
        id, receipt_number, receipt_date, academic_year, semester, 
        name_type, payer_name, month, location, agency,
        amount, created_at, updated_at,
        CASE WHEN pdf_data IS NOT NULL THEN 1 ELSE 0 END as has_pdf
      FROM receipts WHERE id = ?`,
      [result.insertId]
    )
    return rows[0]
  },

  // ค้นหาด้วยฟิลเตอร์หลายแบบ (ไม่ดึง pdf_data เพื่อประหยัด bandwidth)
  findWithFilters: async (filters = {}) => {
    let query = `
      SELECT 
        id, receipt_number, receipt_date, academic_year, semester,
        name_type, payer_name, month, location, agency, amount, 
        created_at, updated_at,
        CASE WHEN pdf_data IS NOT NULL THEN 1 ELSE 0 END as has_pdf
      FROM receipts 
      WHERE 1=1
    `
    const params = []

    // Filter: เดือนเริ่มต้น
    if (filters.month_start) {
      query += ` AND month >= ?`
      params.push(parseInt(filters.month_start))
    }
    
    // Filter: เดือนสิ้นสุด
    if (filters.month_end) {
      query += ` AND month <= ?`
      params.push(parseInt(filters.month_end))
    }

    // Filter: ปีการศึกษา
    if (filters.academic_year) {
      query += ` AND academic_year = ?`
      params.push(filters.academic_year)
    }

    // Filter: ภาคเรียน
    if (filters.semester) {
      query += ` AND semester = ?`
      params.push(parseInt(filters.semester))
    }

    // Filter: ชื่อผู้ปฏิบัติงาน (ใช้ LIKE แทน ILIKE)
    if (filters.name) {
      query += ` AND payer_name LIKE ?`
      params.push(`%${filters.name}%`)
    }

    // Filter เก่าที่รองรับไว้
    if (filters.day) {
      query += ` AND DAY(receipt_date) = ?`
      params.push(filters.day)
    }
    
    if (filters.month) {
      query += ` AND month = ?`
      params.push(parseInt(filters.month))
    }
    
    if (filters.year) {
      query += ` AND YEAR(receipt_date) = ?`
      params.push(filters.year)
    }

    query += ' ORDER BY receipt_date DESC, created_at DESC'

    const [rows] = await pool.query(query, params)
    return rows
  },

  // นับจำนวนด้วยฟิลเตอร์
  countWithFilters: async (filters = {}) => {
    let query = 'SELECT COUNT(*) as total FROM receipts WHERE 1=1'
    const params = []

    if (filters.month_start) {
      query += ` AND month >= ?`
      params.push(parseInt(filters.month_start))
    }
    
    if (filters.month_end) {
      query += ` AND month <= ?`
      params.push(parseInt(filters.month_end))
    }

    if (filters.academic_year) {
      query += ` AND academic_year = ?`
      params.push(filters.academic_year)
    }

    if (filters.semester) {
      query += ` AND semester = ?`
      params.push(parseInt(filters.semester))
    }

    if (filters.name) {
      query += ` AND payer_name LIKE ?`
      params.push(`%${filters.name}%`)
    }

    if (filters.day) {
      query += ` AND DAY(receipt_date) = ?`
      params.push(filters.day)
    }
    
    if (filters.month) {
      query += ` AND month = ?`
      params.push(parseInt(filters.month))
    }
    
    if (filters.year) {
      query += ` AND YEAR(receipt_date) = ?`
      params.push(filters.year)
    }

    const [rows] = await pool.query(query, params)
    return parseInt(rows[0].total)
  },

  // ดึงข้อมูลทั้งหมด (ไม่รวม pdf_data)
  findAll: async () => {
    const [rows] = await pool.query(
      `SELECT 
        id, receipt_number, receipt_date, academic_year, semester,
        name_type, payer_name, month, location, agency,
        amount, created_at, updated_at,
        CASE WHEN pdf_data IS NOT NULL THEN 1 ELSE 0 END as has_pdf
      FROM receipts 
      ORDER BY receipt_date DESC, created_at DESC`
    )
    return rows
  },

  // ดึงข้อมูลตาม ID (ไม่รวม pdf_data)
  findById: async (id) => {
    const [rows] = await pool.query(
      `SELECT 
        id, receipt_number, receipt_date, academic_year, semester,
        name_type, payer_name, month, location, agency,
        amount, created_at, updated_at,
        CASE WHEN pdf_data IS NOT NULL THEN 1 ELSE 0 END as has_pdf
      FROM receipts 
      WHERE id = ?`,
      [id]
    )
    return rows[0]
  },

  // ดึง PDF data
  getPDF: async (id) => {
    const [rows] = await pool.query(
      'SELECT pdf_data, receipt_number FROM receipts WHERE id = ?',
      [id]
    )
    return rows[0]
  },

  // อัปเดต PDF
  updatePDF: async (id, pdfBuffer) => {
    const [result] = await pool.query(
      'UPDATE receipts SET pdf_data = ?, updated_at = NOW() WHERE id = ?',
      [pdfBuffer, id]
    )
    return { id, affectedRows: result.affectedRows }
  },

  // ตรวจสอบว่ามี PDF หรือไม่
  hasPDF: async (id) => {
    const [rows] = await pool.query(
      'SELECT CASE WHEN pdf_data IS NOT NULL THEN 1 ELSE 0 END as has_pdf FROM receipts WHERE id = ?',
      [id]
    )
    return rows[0]?.has_pdf === 1 || false
  },

  // ดึงรายชื่อผู้ปฏิบัติงานที่ไม่ซ้ำกัน
  getUniqueNames: async () => {
    const [rows] = await pool.query(
      `SELECT DISTINCT payer_name 
       FROM receipts 
       WHERE payer_name IS NOT NULL 
       ORDER BY payer_name`
    )
    return rows.map(row => row.payer_name)
  },

  // สร้างเลขที่ใบเสร็จอัตโนมัติ
  generateReceiptNumber: async () => {
    const [rows] = await pool.query(
      'SELECT receipt_number FROM receipts ORDER BY created_at DESC LIMIT 1'
    )
    
    if (rows.length === 0) {
      return 'RCP-0001'
    }
    
    const lastNumber = rows[0].receipt_number
    const num = parseInt(lastNumber.split('-')[1]) + 1
    return `RCP-${num.toString().padStart(4, '0')}`
  },

  // ลบใบเสร็จ
  delete: async (id) => {
    const [result] = await pool.query(
      'DELETE FROM receipts WHERE id = ?',
      [id]
    )
    return { id, affectedRows: result.affectedRows }
  }
}