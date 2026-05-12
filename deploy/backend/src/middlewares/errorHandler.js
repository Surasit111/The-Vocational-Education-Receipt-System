export const errorHandler = (err, req, res, next) => {
  console.error('Error:', err)

  const status = err.status || 500
  const message = err.message || 'เกิดข้อผิดพลาดภายในเซิร์ฟเวอร์'

  res.status(status).json({
    success: false,
    message,
    error: process.env.NODE_ENV === 'development' ? err.stack : undefined
  })
}