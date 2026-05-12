import pg from 'pg'
import dotenv from 'dotenv'

// ตรวจสอบว่าต้องการใช้ Neon หรือไม่จาก Flag --neon หรือ ENV
const isNeon = process.argv.includes('--neon') || process.env.DB_ENV === 'neon'

if (isNeon) {
  dotenv.config({ path: '.env.neon' })
  console.log('🌐 Using Neon Database Config (.env.neon)')
} else {
  dotenv.config() // Default to .env
}

const { Pool } = pg

const poolConfig = process.env.DATABASE_URL 
  ? { 
      connectionString: process.env.DATABASE_URL,
      ssl: { rejectUnauthorized: false } // จำเป็นสำหรับ Neon/Cloud
    }
  : {
      host: process.env.DB_HOST,
      port: process.env.DB_PORT,
      database: process.env.DB_NAME,
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
    }

const pool = new Pool(poolConfig)

pool.on('connect', () => {
  console.log('✅ Database connected')
})

pool.on('error', (err) => {
  console.error('❌ Database error:', err)
  process.exit(-1)
})

export default pool