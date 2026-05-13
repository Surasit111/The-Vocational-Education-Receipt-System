import { useState, useEffect } from 'react'
import { Modal, Form, Button, Row, Col, Badge, InputGroup } from 'react-bootstrap'
import { toast } from 'react-hot-toast'
import { useAuth } from '../contexts/AuthContext'
import { User, Mail, Phone, Shield, Edit3, Save, X, UserCircle } from 'lucide-react'
import axios from 'axios'

const API_BASE_URL = '/api'

function ProfileModal({ show, onHide }) {
  const { user, token, getRoleLabel } = useAuth()
  const [editing, setEditing] = useState(false)
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    first_name: '',
    last_name: '',
    phone: ''
  })

  useEffect(() => {
    if (user) {
      setFormData({
        first_name: user.first_name || '',
        last_name: user.last_name || '',
        phone: user.phone || ''
      })
    }
  }, [user, show])

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    try {
      const response = await axios.put(
        `${API_BASE_URL}/users/profile`,
        formData,
        {
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`
          }
        }
      )

      if (response.data.success) {
        toast.success('อัปเดตโปรไฟล์สำเร็จ!')
        setEditing(false)
        // หน่วงเวลาเล็กน้อยเพื่อให้ AuthContext อัปเดต (ถ้ามีการจัดการเบื้องหลัง) 
        // หรือถ้าต้องการความชัวร์ สามารถใช้ window.location.reload() ได้แต่จะทำให้ Modal ปิด
        // ในที่นี้เราจะเปลี่ยนโหมดกลับเป็นหน้าดูโปรไฟล์ตามที่ผู้ใช้ต้องการ
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'ไม่สามารถอัปเดตโปรไฟล์ได้')
    } finally {
      setLoading(false)
    }
  }

  const handleClose = () => {
    setEditing(false)
    onHide()
  }

  return (
    <Modal show={show} onHide={handleClose} centered className="profile-modal border-0">
      <Modal.Header closeButton className="border-0 pb-0 px-4 pt-4">
        <Modal.Title className="fw-bold text-enterprise">
          โปรไฟล์ของฉัน
        </Modal.Title>
      </Modal.Header>
      <Modal.Body className="p-4">
        {!editing ? (
          <div className="profile-view">
            <div className="text-center mb-4 pb-3 border-bottom border-light">
              <div className="text-muted small fw-bold text-uppercase mb-1" style={{ fontSize: '0.65rem', letterSpacing: '0.05em' }}>ชื่อผู้ใช้</div>
              <h4 className="fw-bold mb-0 text-enterprise">{user?.first_name} {user?.last_name}</h4>
            </div>

            <div className="profile-details mb-4">
              <div className="d-flex align-items-center mb-3 p-3 bg-light rounded-4 border-0">
                <div className="bg-white p-2 rounded-3 me-3 shadow-sm text-primary">
                  <Shield size={18} />
                </div>
                <div>
                  <div className="text-muted small fw-bold text-uppercase" style={{ fontSize: '0.65rem' }}>ระดับผู้ใช้งาน</div>
                  <div className="fw-bold text-enterprise">
                    {getRoleLabel()}
                  </div>
                </div>
              </div>

              <div className="d-flex align-items-center mb-3 p-3 bg-light rounded-4 border-0">
                <div className="bg-white p-2 rounded-3 me-3 shadow-sm text-muted">
                  <Mail size={18} />
                </div>
                <div>
                  <div className="text-muted small fw-bold text-uppercase" style={{ fontSize: '0.65rem' }}>อีเมลสำหรับเข้าใช้งาน</div>
                  <div className="fw-bold text-enterprise">{user?.email}</div>
                </div>
              </div>

              <div className="d-flex align-items-center mb-3 p-3 bg-light rounded-4 border-0">
                <div className="bg-white p-2 rounded-3 me-3 shadow-sm text-muted">
                  <Phone size={18} />
                </div>
                <div>
                  <div className="text-muted small fw-bold text-uppercase" style={{ fontSize: '0.65rem' }}>เบอร์โทรศัพท์</div>
                  <div className="fw-bold text-enterprise">{user?.phone || 'ไม่ระบุ'}</div>
                </div>
              </div>
            </div>

            <Button 
              variant="primary" 
              className="w-100 py-2 fw-bold shadow-premium d-flex align-items-center justify-content-center gap-2"
              onClick={() => setEditing(true)}
            >
              <Edit3 size={18} /> แก้ไขข้อมูลส่วนตัว
            </Button>
          </div>
        ) : (
          <Form onSubmit={handleSubmit} className="profile-edit">
            <div className="mb-4 pb-2 border-bottom border-light">
              <h6 className="fw-bold mb-0 text-enterprise">แก้ไขข้อมูลส่วนตัว</h6>
              <p className="text-muted small mb-0">ปรับปรุงข้อมูลของคุณให้เป็นปัจจุบัน</p>
            </div>
            
            <Row className="g-3 mb-3">
              <Col md={6}>
                <Form.Label className="small fw-bold text-muted px-1">ชื่อ</Form.Label>
                <Form.Control
                  type="text"
                  name="first_name"
                  value={formData.first_name}
                  onChange={handleChange}
                  required
                  disabled={loading}
                  className="bg-light border-0"
                />
              </Col>
              <Col md={6}>
                <Form.Label className="small fw-bold text-muted px-1">นามสกุล</Form.Label>
                <Form.Control
                  type="text"
                  name="last_name"
                  value={formData.last_name}
                  onChange={handleChange}
                  required
                  disabled={loading}
                  className="bg-light border-0"
                />
              </Col>
            </Row>

            <Form.Group className="mb-4">
              <Form.Label className="small fw-bold text-muted px-1">เบอร์โทรศัพท์</Form.Label>
              <InputGroup>
                <InputGroup.Text className="bg-light border-0 text-muted">
                  <Phone size={16} />
                </InputGroup.Text>
                <Form.Control
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  placeholder="0812345678"
                  disabled={loading}
                  className="bg-light border-0 ps-0"
                />
              </InputGroup>
            </Form.Group>

            <div className="d-flex gap-2">
              <Button 
                variant="primary" 
                type="submit" 
                className="flex-fill fw-bold shadow-premium py-2"
                disabled={loading}
              >
                {loading ? (
                  <span className="spinner-border spinner-border-sm me-2" />
                ) : (
                  <><Save size={18} className="me-2" /> บันทึกการเปลี่ยนแปลง</>
                )}
              </Button>
              <Button 
                variant="light" 
                className="flex-fill border py-2 text-muted fw-bold"
                onClick={() => setEditing(false)}
                disabled={loading}
              >
                ยกเลิก
              </Button>
            </div>
          </Form>
        )}
      </Modal.Body>
    </Modal>
  )
}

export default ProfileModal