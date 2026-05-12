import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { Form, Button, Card, Alert, Container, Row, Col, InputGroup } from 'react-bootstrap'
import { User, Mail, Phone, Lock, UserPlus, ArrowRight, UserCheck } from 'lucide-react'
import { toast } from 'react-hot-toast'
import axios from 'axios'

const API_BASE_URL = '/api'

function RegisterPage() {
  const navigate = useNavigate()
  const [formData, setFormData] = useState({
    email: '', first_name: '', last_name: '', phone: '', password: '', confirmPassword: ''
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value })
    setError('')
  }

  const validateForm = () => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(formData.email)) { setError('กรุณากรอกอีเมลให้ถูกต้อง'); return false; }
    if (formData.password.length < 6) { setError('รหัสผ่านต้องมีอย่างน้อย 6 ตัวอักษร'); return false; }
    if (formData.password !== formData.confirmPassword) { setError('รหัสผ่านไม่ตรงกัน'); return false; }
    if (formData.phone && !/^0\d{9}$/.test(formData.phone)) { setError('เบอร์โทรไม่ถูกต้อง'); return false; }
    return true
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!validateForm()) return
    setLoading(true)
    setError('')
    try {
      const response = await axios.post(`${API_BASE_URL}/auth/register`, formData)
      if (response.data.success) {
        toast.success('สมัครสมาชิกสำเร็จ! กรุณาเข้าสู่ระบบ')
        navigate('/login')
      }
    } catch (err) {
      const message = err.response?.data?.message || 'สมัครสมาชิกไม่สำเร็จ'
      setError(message)
      toast.error(message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-vh-100 d-flex align-items-center justify-content-center py-5" style={{ backgroundColor: '#f6f9ff' }}>
      <Container>
        <Row className="justify-content-center">
          <Col md={10} lg={7} xl={6}>
            <div className="text-center mb-4">
              <h3 className="fw-bold mb-1" style={{ color: '#012970' }}>GSW Receipt System</h3>
              <p className="text-muted small">สมัครสมาชิกเพื่อเข้าใช้งานระบบจัดการใบเสร็จ</p>
            </div>

            <Card className="border-0 shadow-sm rounded-4">
              <Card.Body className="p-4 p-md-5">
                <h4 className="fw-bold text-center mb-4" style={{ color: '#012970' }}>สมัครสมาชิกใหม่</h4>

                {error && (
                  <Alert variant="danger" className="border-0 shadow-sm py-2 small mb-4" dismissible onClose={() => setError('')}>
                    {error}
                  </Alert>
                )}

                <Form onSubmit={handleSubmit}>
                  <Row className="g-3 mb-3">
                    <Col md={6}>
                      <Form.Label className="small fw-bold text-muted">ชื่อ</Form.Label>
                      <InputGroup size="sm">
                        <InputGroup.Text className="bg-light border-end-0">
                          <User size={16} className="text-muted" />
                        </InputGroup.Text>
                        <Form.Control name="first_name" placeholder="ชื่อ" value={formData.first_name} onChange={handleChange} className="border-start-0 ps-0" required disabled={loading} />
                      </InputGroup>
                    </Col>
                    <Col md={6}>
                      <Form.Label className="small fw-bold text-muted">นามสกุล</Form.Label>
                      <Form.Control size="sm" name="last_name" placeholder="นามสกุล" value={formData.last_name} onChange={handleChange} required disabled={loading} />
                    </Col>
                  </Row>

                  <Form.Group className="mb-3">
                    <Form.Label className="small fw-bold text-muted">อีเมล</Form.Label>
                    <InputGroup size="sm">
                      <InputGroup.Text className="bg-light border-end-0">
                        <Mail size={16} className="text-muted" />
                      </InputGroup.Text>
                      <Form.Control type="email" name="email" placeholder="example@email.com" value={formData.email} onChange={handleChange} className="border-start-0 ps-0" required disabled={loading} />
                    </InputGroup>
                  </Form.Group>

                  <Form.Group className="mb-3">
                    <Form.Label className="small fw-bold text-muted">เบอร์โทรศัพท์ (ไม่บังคับ)</Form.Label>
                    <InputGroup size="sm">
                      <InputGroup.Text className="bg-light border-end-0">
                        <Phone size={16} className="text-muted" />
                      </InputGroup.Text>
                      <Form.Control type="tel" name="phone" placeholder="0123456789" value={formData.phone} onChange={handleChange} className="border-start-0 ps-0" disabled={loading} />
                    </InputGroup>
                  </Form.Group>

                  <Row className="g-3 mb-4">
                    <Col md={6}>
                      <Form.Label className="small fw-bold text-muted">รหัสผ่าน</Form.Label>
                      <InputGroup size="sm">
                        <InputGroup.Text className="bg-light border-end-0">
                          <Lock size={16} className="text-muted" />
                        </InputGroup.Text>
                        <Form.Control type="password" name="password" placeholder="••••••••" value={formData.password} onChange={handleChange} className="border-start-0 ps-0" required disabled={loading} minLength={6} />
                      </InputGroup>
                    </Col>
                    <Col md={6}>
                      <Form.Label className="small fw-bold text-muted">ยืนยันรหัสผ่าน</Form.Label>
                      <Form.Control size="sm" type="password" name="confirmPassword" placeholder="••••••••" value={formData.confirmPassword} onChange={handleChange} required disabled={loading} minLength={6} />
                    </Col>
                  </Row>

                  <Button
                    variant="primary"
                    type="submit"
                    className="w-100 mb-3 py-2 fw-bold d-flex align-items-center justify-content-center"
                    disabled={loading}
                  >
                    {loading ? (
                      <span className="spinner-border spinner-border-sm me-2" />
                    ) : (
                      <>สร้างบัญชีผู้ใช้ <UserCheck size={18} className="ms-2" /></>
                    )}
                  </Button>

                  <div className="text-center">
                    <p className="text-muted small mb-0">
                      มีบัญชีอยู่แล้ว?{' '}
                      <Link to="/login" className="fw-bold text-primary text-decoration-none d-inline-flex align-items-center">
                        เข้าสู่ระบบ <ArrowRight size={14} className="ms-1" />
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

export default RegisterPage