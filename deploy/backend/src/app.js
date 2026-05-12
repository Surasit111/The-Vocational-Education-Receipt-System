import express from 'express'
import cors from 'cors'
import routes from './routes/index.js'
import { errorHandler } from './middlewares/errorHandler.js'

const app = express()

// ✅ แก้ CORS ให้รองรับ production
app.use(cors({
  origin: process.env.CLIENT_URL || 'http://localhost:3000',
  credentials: true
}))

app.use(express.json({ limit: '50mb' }))
app.use(express.urlencoded({ extended: true, limit: '50mb' }))

app.use('/uploads', express.static('uploads'))

app.use('/api', routes)

app.get('/health', (req, res) => {
  res.json({ status: 'OK', message: 'Server running' })
})

app.use(errorHandler)

export default app