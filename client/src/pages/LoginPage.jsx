import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { Form, Button, Card, Alert, Container, Row, Col, InputGroup } from 'react-bootstrap'
import { Mail, Lock, LogIn, UserPlus, ArrowRight } from 'lucide-react'
import { toast } from 'react-hot-toast'
import { useAuth } from '../contexts/AuthContext'

function LoginPage() {
  const navigate = useNavigate()
  const { login } = useAuth()
  const [formData, setFormData] = useState({ email: '', password: '' })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value })
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

  return (
    <div className="min-vh-100 d-flex align-items-center justify-content-center" style={{ backgroundColor: '#f6f9ff' }}>
      <Container>
        <Row className="justify-content-center">
          <Col md={8} lg={5} xl={4}>
            <div className="text-center mb-4">
              <h3 className="fw-bold mb-1" style={{ color: '#012970' }}>GSW Receipt System</h3>
              <p className="text-muted small">ระบบจัดการใบเสร็จรับเงิน กศ.พ.</p>
            </div>

            <Card className="border-0 shadow-sm rounded-4">
              <Card.Body className="p-4 p-md-5">
                <h4 className="fw-bold text-center mb-4" style={{ color: '#012970' }}>เข้าสู่ระบบ</h4>

                {error && (
                  <Alert variant="danger" className="border-0 shadow-sm py-2 small mb-4" dismissible onClose={() => setError('')}>
                    {error}
                  </Alert>
                )}

                <Form onSubmit={handleSubmit}>
                  <Form.Group className="mb-3">
                    <Form.Label className="small fw-bold text-muted">อีเมล</Form.Label>
                    <InputGroup>
                      <InputGroup.Text className="bg-light border-end-0">
                        <Mail size={18} className="text-muted" />
                      </InputGroup.Text>
                      <Form.Control
                        type="email"
                        name="email"
                        placeholder="example@email.com"
                        value={formData.email}
                        onChange={handleChange}
                        className="border-start-0 ps-0"
                        required
                        disabled={loading}
                      />
                    </InputGroup>
                  </Form.Group>

                  <Form.Group className="mb-4">
                    <Form.Label className="small fw-bold text-muted">รหัสผ่าน</Form.Label>
                    <InputGroup>
                      <InputGroup.Text className="bg-light border-end-0">
                        <Lock size={18} className="text-muted" />
                      </InputGroup.Text>
                      <Form.Control
                        type="password"
                        name="password"
                        placeholder="••••••••"
                        value={formData.password}
                        onChange={handleChange}
                        className="border-start-0 ps-0"
                        required
                        disabled={loading}
                      />
                    </InputGroup>
                  </Form.Group>

                  <Button
                    variant="primary"
                    type="submit"
                    className="w-100 mb-3 py-2 fw-bold d-flex align-items-center justify-content-center"
                    disabled={loading}
                  >
                    {loading ? (
                      <span className="spinner-border spinner-border-sm me-2" />
                    ) : (
                      <>เข้าสู่ระบบ <ArrowRight size={18} className="ms-2" /></>
                    )}
                  </Button>

                  <div className="text-center mb-4">
                    <div className="position-relative">
                      <hr className="text-muted opacity-25" />
                      <span className="position-absolute top-50 start-50 translate-middle bg-white px-3 text-muted small">หรือ</span>
                    </div>
                  </div>

                  <Button
                    variant="outline-secondary"
                    className="w-100 mb-4 py-2 small border-light-subtle d-flex align-items-center justify-content-center"
                    onClick={() => navigate('/form')}
                    disabled={loading}
                  >
                    เข้าใช้งานแบบทั่วไป (ไม่ใช้บัญชี)
                  </Button>

                  <div className="text-center">
                    <p className="text-muted small mb-0">
                      ยังไม่มีบัญชี?{' '}
                      <Link to="/register" className="fw-bold text-primary text-decoration-none d-inline-flex align-items-center">
                        สมัครสมาชิก <UserPlus size={14} className="ms-1" />
                      </Link>
                    </p>
                  </div>
                </Form>
              </Card.Body>
            </Card>
          </Col>
        </Row>
      </Container>
    </div>
  )
}

export default LoginPage