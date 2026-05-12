import { useState, useEffect } from 'react'
import { Modal, Button, Row, Col, Badge, Spinner } from 'react-bootstrap'
import { Phone, Mail, User, PhoneCall, Info } from 'lucide-react'
import axios from 'axios'

const API_BASE_URL = '/api'

function ContactModal({ show, onHide }) {
  const [admins, setAdmins] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (show) {
      fetchAdmins()
    }
  }, [show])

  const fetchAdmins = async () => {
    setLoading(true)
    try {
      const response = await axios.get(`${API_BASE_URL}/users/admins`)
      setAdmins(response.data?.data || [])
    } catch (error) {
      console.error('Fetch admins error:', error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <Modal show={show} onHide={onHide} centered size="lg" className="contact-modal border-0">
      <Modal.Header closeButton className="border-0 pb-0 px-4 pt-4">
        <Modal.Title className="fw-bold text-enterprise">
          ติดต่อผู้ดูแลระบบ
        </Modal.Title>
      </Modal.Header>
      
      <Modal.Body className="p-4">
        <div className="mb-4">
          <p className="text-muted small mb-0 d-flex align-items-center gap-2">
            <Info size={14} className="text-primary" /> สามารถติดต่อผู้ดูแลระบบได้ตามข้อมูลการติดต่อด้านล่างนี้
          </p>
        </div>

        {loading ? (
          <div className="text-center py-5">
            <Spinner animation="border" variant="primary" size="sm" />
            <p className="mt-3 text-muted small">กำลังโหลดข้อมูลผู้ดูแลระบบ...</p>
          </div>
        ) : (
          <Row className="g-4">
            {admins.length === 0 ? (
              <Col className="text-center py-4">
                <p className="text-muted">ไม่พบข้อมูลผู้ดูแลระบบในขณะนี้</p>
              </Col>
            ) : (
              admins.map((admin) => (
                <Col md={6} key={admin.id}>
                  <div className="admin-contact-card p-4 rounded-4 border bg-white shadow-sm h-100 border-light">
                    <div className="d-flex align-items-center justify-content-between gap-2 mb-3">
                      <h6 className="fw-bold text-enterprise mb-0 text-truncate">{admin.first_name} {admin.last_name}</h6>
                      <Badge bg="warning-subtle" text="warning-emphasis" className="rounded-pill px-3 py-1 small border border-warning-subtle flex-shrink-0" style={{ fontSize: '0.65rem' }}>
                        ผู้ดูแลระบบ
                      </Badge>
                    </div>
                    
                    <div className="contact-info mt-4">
                      <div className="d-flex align-items-center gap-3 mb-3 text-muted small py-1 border-bottom border-light">
                        <div className="bg-light p-2 rounded-3 text-primary">
                          <Phone size={14} />
                        </div>
                        <div>
                          <div className="fw-bold text-enterprise" style={{ fontSize: '0.85rem' }}>เบอร์โทรศัพท์: {admin.phone || 'ไม่ระบุ'}</div>
                        </div>
                      </div>
                      
                      <div className="d-flex align-items-center gap-3 text-muted small py-1">
                        <div className="bg-light p-2 rounded-3 text-primary">
                          <Mail size={14} />
                        </div>
                        <div className="text-truncate">
                          <div className="fw-bold text-enterprise" style={{ fontSize: '0.85rem' }}>อีเมล: {admin.email}</div>
                        </div>
                      </div>
                    </div>
                  </div>
                </Col>
              ))
            )}
          </Row>
        )}
      </Modal.Body>
      
      <Modal.Footer className="border-0 p-4">
        <Button variant="light" className="w-100 rounded-pill py-2 fw-bold border text-muted" onClick={onHide}>
          ปิดหน้าต่าง
        </Button>
      </Modal.Footer>
    </Modal>
  )
}

export default ContactModal