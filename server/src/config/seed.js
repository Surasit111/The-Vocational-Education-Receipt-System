import pool from './database.js'
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const seedDb = async () => {
  try {
    console.log('🌱 Starting Data Seeding (45 items)...')

    // 1. อ่านไฟล์ SQL
    const sqlPath = path.join(__dirname, 'seedData.sql')
    const sql = fs.readFileSync(sqlPath, 'utf8')

    // 2. รันคำสั่งเพิ่มข้อมูล
    console.log('📝 Inserting sample data...')
    await pool.query(sql)
    
    console.log('✅ 45 Sample items seeded successfully!')
    process.exit(0)
  } catch (error) {
    console.error('❌ Seeding Failed:', error)
    process.exit(1)
  }
}

seedDb()
