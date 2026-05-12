import pool from './database.js'
import fs from 'fs'
import path from 'path'
import bcrypt from 'bcrypt'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const initDb = async () => {
  try {
    console.log('🚀 Starting Database Initialization...')

    // 1. อ่านไฟล์ SQL
    const sqlPath = path.join(__dirname, 'schema.sql')
    const sql = fs.readFileSync(sqlPath, 'utf8')

    // 2. รันคำสั่งสร้างตาราง
    console.log('📝 Creating tables...')
    await pool.query(sql)
    console.log('✅ Tables created successfully')

    // 3. ตรวจสอบและสร้างบัญชีเริ่มต้น 3 ระดับ
    const usersToCreate = [
      {
        email: process.env.SUPER_EMAIL_ADDRESS || 'superadmin@gmail.com',
        password: process.env.SUPER_PASSWORD || '123456789',
        first_name: 'Super',
        last_name: 'Admin',
        role: 'admin'
      },
      {
        email: process.env.ADMIN_EMAIL_ADDRESS || 'admin@gmail.com',
        password: process.env.ADMIN_PASSWORD || '123456789',
        first_name: 'General',
        last_name: 'Administrator',
        role: 'admin'
      },
      {
        email: process.env.STAFF_EMAIL_ADDRESS || 'staff@gmail.com',
        password: process.env.STAFF_PASSWORD || '123456789',
        first_name: 'Primary',
        last_name: 'Staff',
        role: 'user'
      }
    ]

    for (const user of usersToCreate) {
      const checkUser = await pool.query('SELECT id FROM users WHERE email = $1', [user.email])
      
      if (checkUser.rows.length === 0) {
        console.log(`👤 Creating User: ${user.email} (${user.role})`)
        const hashedPassword = await bcrypt.hash(user.password, 10)
        
        await pool.query(
          `INSERT INTO users (email, password, first_name, last_name, role) 
           VALUES ($1, $2, $3, $4, $5)`,
          [user.email, hashedPassword, user.first_name, user.last_name, user.role]
        )
      } else {
        console.log(`ℹ️ User ${user.email} already exists, skipping...`)
      }
    }
    console.log('✅ Default accounts checked/created successfully')

    console.log('✨ Database Initialization Complete!')
    process.exit(0)
  } catch (error) {
    console.error('❌ Initialization Failed:', error)
    process.exit(1)
  }
}

initDb()
