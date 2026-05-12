// pages/LoginPage.jsx
import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { Form, Button, Card, Alert, Container, Row, Col } from 'react-bootstrap'
import { toast } from 'react-hot-toast'
import { useAuth } from '../contexts/AuthContext'
import './AuthPages.css'

function LoginPage() {
  const navigate = useNavigate()
  const { login } = useAuth()
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    })
    setError('')
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      await login(formData.email, formData.password)
      toast.success('เข้าสู่ระบบสำเร็จ!')
      navigate('/statistics')
    } catch (err) {
      setError(err.message || 'เข้าสู่ระบบไม่สำเร็จ')
      toast.error(err.message || 'เข้าสู่ระบบไม่สำเร็จ')
    } finally {
      setLoading(false)
    }
  }

  // ⭐ ฟังก์ชันสำหรับเข้าใช้งานโดยไม่ใช้บัญชี
  const handleGuestAccess = () => {
    navigate('/form')
  }

  return (
    <div className="auth-page">
      <Container>
        <Row className="justify-content-center">
          <Col md={5} lg={4}>
            <div className="auth-card-wrapper">
              <Card className="auth-card shadow-lg">
                <Card.Body className="p-5">
                  {/* Logo/Header */}
                  <div className="text-center mb-4">
                    <div className="auth-icon mb-3">
                      🔐
                    </div>
                    <h2 className="auth-title">เข้าสู่ระบบ</h2>
                    <p className="text-muted">ระบบจัดการใบเสร็จ</p>
                  </div>

                  {/* Error Alert */}
                  {error && (
                    <Alert variant="danger" dismissible onClose={() => setError('')}>
                      {error}
                    </Alert>
                  )}

                  {/* Login Form */}
                  <Form onSubmit={handleSubmit}>
                    <Form.Group className="mb-3">
                      <Form.Label>📧 อีเมล</Form.Label>
                      <Form.Control
                        type="email"
                        name="email"
                        placeholder="example@address.ac.th / .com / .lru.ac"
                        value={formData.email}
                        onChange={handleChange}
                        required
                        disabled={loading}
                      />
                    </Form.Group>

                    <Form.Group className="mb-4">
                      <Form.Label>🔒 รหัสผ่าน</Form.Label>
                      <Form.Control
                        type="password"
                        name="password"
                        placeholder="••••••••"
                        value={formData.password}
                        onChange={handleChange}
                        required
                        disabled={loading}
                      />
                    </Form.Group>

                    <Button
                      variant="primary"
                      type="submit"
                      className="w-100 mb-3 py-2"
                      disabled={loading}
                    >
                      {loading ? (
                        <>
                          <span className="spinner-border spinner-border-sm me-2" />
                          กำลังเข้าสู่ระบบ...
                        </>
                      ) : (
                        '🚀 เข้าสู่ระบบ'
                      )}
                    </Button>

                    {/* ⭐ ปุ่มเข้าใช้งานโดยไม่ใช้บัญชี */}
                    <Button
                      variant="outline-secondary"
                      className="w-100 mb-3 py-2"
                      onClick={handleGuestAccess}
                      disabled={loading}
                    >
                      👤 เข้าใช้งานโดยไม่ใช้บัญชี
                    </Button>

                    <div className="text-center">
                      <p className="text-muted mb-0">
                        ยังไม่มีบัญชี?{' '}
                        <Link to="/register" className="text-decoration-none">
                          สมัครสมาชิก
                        </Link>
                      </p>
                    </div>
                  </Form>
                </Card.Body>
              </Card>

              {/* Info */}
              <div className="text-center mt-3">
                <small className="text-muted">
                  💡 ใช้อีเมล @lru.ac.th เท่านั้น
                </small>
              </div>
            </div>
          </Col>
        </Row>
      </Container>
    </div>
  )
}

export default LoginPage