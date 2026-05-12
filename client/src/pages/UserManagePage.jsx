import { useState, useEffect } from 'react'
import { Container, Card, Row, Col, Table, Badge, Button, Form, InputGroup, Spinner, Modal } from 'react-bootstrap'
import { Users, UserPlus, Search, Shield, ShieldCheck, Mail, Phone, Trash2, X, Save, User, Edit3 } from 'lucide-react'
import { toast } from 'react-hot-toast'
import axios from 'axios'
import { useAuth } from '../contexts/AuthContext'
import ConfirmDeleteModal from '../components/ConfirmDeleteModal'

const API_BASE_URL = '/api'

function UserManagePage() {
  const { user: currentUser, token } = useAuth()
  const [admins, setAdmins] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [showAddForm, setShowAddForm] = useState(false)
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [deleteTarget, setDeleteTarget] = useState(null)
  
  // Edit state
  const [showEditForm, setShowEditForm] = useState(false)
  const [editFormData, setEditFormData] = useState({
    id: '',
    email: '',
    first_name: '',
    last_name: '',
    phone: '',
    role: 'user'
  })
  
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    first_name: '',
    last_name: '',
    phone: '',
    role: 'admin'
  })

  useEffect(() => {
    if (token) {
      fetchAdmins()
    }
  }, [token])

  const fetchAdmins = async () => {
    setLoading(true)
    try {
      // ⭐ เปลี่ยนไปใช้ Endpoint /manage ให้ถูกต้องตาม Server
      const response = await axios.get(`${API_BASE_URL}/users/admins/manage`, {
        headers: { Authorization: `Bearer ${token}` }
      })
      
      // ⭐ รับข้อมูลจาก response.data.data ตามโครงสร้างที่ Server ส่งมา
      const adminList = response.data?.data || []
      setAdmins(adminList)
    } catch (error) {
      console.error('Fetch admins error:', error)
      toast.error('ไม่สามารถโหลดข้อมูลผู้ใช้ได้')
    } finally {
      setLoading(false)
    }
  }

  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value })
  }

  const handleAddAdmin = async (e) => {
    e.preventDefault()
    try {
      // ⭐ เปลี่ยน Endpoint ให้ตรงตาม userRoutes.js
      await axios.post(`${API_BASE_URL}/users/admins/manage`, formData, {
        headers: { Authorization: `Bearer ${token}` }
      })
      toast.success('เพิ่มผู้ใช้สำเร็จ')
      setFormData({ email: '', password: '', first_name: '', last_name: '', phone: '', role: 'admin' })
      setShowAddForm(false)
      fetchAdmins()
    } catch (error) {
      toast.error(error.response?.data?.message || 'เกิดข้อผิดพลาดในการเพิ่มผู้ใช้')
    }
  }

  const handleRemoveAdmin = (admin) => {
    if (admin?.id === currentUser?.id) return toast.error('คุณไม่สามารถลบตัวเองได้')
    if (admin?.is_primary) return toast.error('ไม่สามารถลบผู้ใช้หลักได้')
    setDeleteTarget(admin)
    setShowDeleteModal(true)
  }

  const confirmRemoveAdmin = async () => {
    if (!deleteTarget?.id) return
    try {
      // ⭐ ใช้ METHOD DELETE ตามมาตรฐาน REST ของเซิร์ฟเวอร์
      await axios.delete(`${API_BASE_URL}/users/admins/manage/${deleteTarget.id}`, {
        headers: { Authorization: `Bearer ${token}` }
      })
      toast.success('ลบสิทธิ์ผู้ใช้เรียบร้อย')
      setShowDeleteModal(false)
      fetchAdmins()
    } catch (error) {
      toast.error(error.response?.data?.message || 'ไม่สามารถลบสิทธิ์ได้')
    }
  }

  const filteredAdmins = admins.filter(a => 
    (a?.first_name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
    (a?.last_name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
    (a?.email || '').toLowerCase().includes(searchTerm.toLowerCase())
  )

  const handleEditClick = (user) => {
    setEditFormData({
      id: user.id,
      email: user.email,
      first_name: user.first_name,
      last_name: user.last_name,
      phone: user.phone || '',
      role: user.role
    })
    setShowEditForm(true)
  }

  const handleEditSubmit = async (e) => {
    e.preventDefault()
    try {
      await axios.put(`${API_BASE_URL}/users/admins/manage/${editFormData.id}`, editFormData, {
        headers: { Authorization: `Bearer ${token}` }
      })
      toast.success('แก้ไขข้อมูลสำเร็จ')
      setShowEditForm(false)
      fetchAdmins()
    } catch (error) {
      toast.error(error.response?.data?.message || 'ไม่สามารถแก้ไขข้อมูลได้')
    }
  }

  const canEdit = (target) => {
    if (currentUser?.is_primary) return true
    if (currentUser?.role === 'admin') {
      return target.role === 'user' && !target.is_primary
    }
    return false
  }

  const canDelete = (target) => {
    if (currentUser?.is_primary) {
      return target.id !== currentUser.id // ห้ามลบตัวเอง
    }
    return false
  }

  return (
    <div className="py-5 min-vh-100">
      <Container>
        {/* Unified Header Card */}
        <Card className="border-0 shadow-sm rounded-4 overflow-hidden mb-4">
          <Card.Body className="p-4 px-lg-5">
            <div className="d-flex align-items-center justify-content-between flex-wrap gap-4">
              <div>
                <h2 className="fw-bold mb-1 tracking-tight text-enterprise">จัดการผู้ใช้งานระบบ</h2>
                <p className="text-muted small mb-0">จัดการสิทธิ์และข้อมูลของผู้ใช้ทั้งหมดในระบบ</p>
              </div>
              <div className="d-flex gap-3">
                <div className="text-end px-2">
                  <div className="small text-muted mb-0" style={{ fontSize: '0.8rem' }}>จำนวนผู้ใช้ทั้งหมด</div>
                  <div className="fw-bold text-enterprise fs-3">{loading ? '...' : admins.length} <span className="small fw-normal text-muted" style={{ fontSize: '0.95rem' }}>คน</span></div>
                </div>
              </div>
            </div>
          </Card.Body>
        </Card>

        <Row className="g-4">


          <Col lg={12}>
            <Card className="border-0 shadow-sm rounded-4 overflow-hidden">
              <Card.Header className="bg-white p-4 border-0 border-bottom">
                <div className="d-flex align-items-center justify-content-between flex-wrap gap-3">
                  <div className="d-flex align-items-center gap-2">
                    <h5 className="mb-0 fw-bold text-enterprise">รายชื่อผู้ใช้</h5>
                  </div>
                  <div className="d-flex gap-2 flex-wrap flex-grow-1 justify-content-md-end" style={{ minWidth: '300px' }}>
                    <InputGroup size="sm" style={{ maxWidth: '300px' }}>
                      <InputGroup.Text className="bg-light border-0"><Search size={16} /></InputGroup.Text>
                      <Form.Control 
                        placeholder="ค้นหาผู้ใช้..." 
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="bg-light border-0 py-2"
                      />
                    </InputGroup>
                    <Button 
                      variant="primary"
                      size="sm"
                      className="rounded-3 px-3 fw-bold border-0 shadow-sm"
                      onClick={() => {
                        setFormData({ email: '', password: '', first_name: '', last_name: '', phone: '', role: 'user' })
                        setShowAddForm(true)
                      }}
                    >
                      <UserPlus size={16} className="me-2" /> เพิ่มผู้ใช้ใหม่
                    </Button>
                  </div>
                </div>
              </Card.Header>
              <Card.Body className="p-0">
                {loading ? (
                  <div className="text-center py-5">
                    <Spinner animation="border" variant="info" />
                    <p className="mt-2 text-muted small">กำลังดึงข้อมูล...</p>
                  </div>
                ) : (
                  <div className="table-responsive">
                    <Table hover className="align-middle mb-0">
                      <thead className="bg-light">
                        <tr>
                          <th className="px-4 py-3">ผู้ใช้งาน</th>
                          <th className="py-3">อีเมล</th>
                          <th className="py-3">เบอร์โทรศัพท์</th>
                          <th className="py-3 text-center">สถานะ</th>
                          <th className="py-3 text-end px-4">จัดการ</th>
                        </tr>
                      </thead>
                      <tbody>
                        {filteredAdmins.length === 0 ? (
                          <tr>
                            <td colSpan="5" className="text-center py-5 text-muted">
                              ไม่พบข้อมูลผู้ดูแลระบบ
                            </td>
                          </tr>
                        ) : (
                          filteredAdmins.map((admin) => (
                            <tr key={admin?.id}>
                              <td className="px-4">
                                <div className="fw-bold text-enterprise" style={{ fontSize: '0.9rem' }}>
                                  {admin?.first_name} {admin?.last_name}
                                </div>
                              </td>
                              <td>
                                <div className="small text-muted">{admin?.email}</div>
                              </td>
                              <td>
                                <div className="small text-muted">{admin?.phone || '-'}</div>
                              </td>
                              <td className="text-center">
                                {admin?.is_primary ? (
                                  <Badge bg="danger" className="rounded-pill px-4 py-2 shadow-sm fw-bold" style={{ fontSize: '0.8rem', minWidth: '130px' }}>ผู้ดูแลระบบสูงสุด</Badge>
                                ) : admin?.role === 'admin' ? (
                                  <Badge bg="warning" text="dark" className="rounded-pill px-4 py-2 shadow-sm fw-bold" style={{ fontSize: '0.8rem', minWidth: '130px' }}>ผู้ดูแลระบบ</Badge>
                                ) : (
                                  <Badge bg="light" text="muted" className="rounded-pill px-4 py-2 border border-light-subtle fw-medium" style={{ fontSize: '0.8rem', minWidth: '130px' }}>ผู้ใช้ทั่วไป</Badge>
                                )}
                              </td>
                              <td className="text-end px-4">
                                <div className="d-flex justify-content-end gap-2">
                                  {canEdit(admin) && (
                                    <Button 
                                      variant="link" 
                                      className="text-primary p-2 hover-bg-primary-subtle transition-all rounded-3" 
                                      onClick={() => handleEditClick(admin)}
                                      title="แก้ไข"
                                    >
                                      <Edit3 size={18} />
                                    </Button>
                                  )}
                                  {canDelete(admin) && (
                                    <Button 
                                      variant="link" 
                                      className="text-danger p-2 hover-bg-danger-subtle transition-all rounded-3" 
                                      onClick={() => handleRemoveAdmin(admin)}
                                      title="ลบ"
                                    >
                                      <Trash2 size={18} />
                                    </Button>
                                  )}
                                  {!canEdit(admin) && !canDelete(admin) && (
                                    <span className="text-muted small px-2">-</span>
                                  )}
                                </div>
                              </td>
                            </tr>
                          ))
                        )}
                      </tbody>
                    </Table>
                  </div>
                )}
              </Card.Body>
            </Card>
          </Col>
        </Row>
      </Container>

      {/* Add User Modal */}
      <Modal show={showAddForm} onHide={() => setShowAddForm(false)} centered>
        <Modal.Header closeButton className="border-0">
          <Modal.Title className="fw-bold text-enterprise">เพิ่มผู้ใช้ใหม่</Modal.Title>
        </Modal.Header>
        <Modal.Body className="px-4 pb-4">
          <Form onSubmit={handleAddAdmin}>
            <Row className="g-3">
              <Col md={12}>
                <Form.Label className="small fw-bold text-muted">อีเมล (@lru.ac.th)</Form.Label>
                <Form.Control type="email" name="email" value={formData.email} onChange={handleInputChange} required className="bg-light border-0" placeholder="user@lru.ac.th" />
              </Col>
              <Col md={12}>
                <Form.Label className="small fw-bold text-muted">รหัสผ่าน</Form.Label>
                <Form.Control type="password" name="password" value={formData.password} onChange={handleInputChange} required className="bg-light border-0" placeholder="••••••••" />
              </Col>
              <Col md={6}>
                <Form.Label className="small fw-bold text-muted">ชื่อจริง</Form.Label>
                <Form.Control type="text" name="first_name" value={formData.first_name} onChange={handleInputChange} required className="bg-light border-0" />
              </Col>
              <Col md={6}>
                <Form.Label className="small fw-bold text-muted">นามสกุล</Form.Label>
                <Form.Control type="text" name="last_name" value={formData.last_name} onChange={handleInputChange} required className="bg-light border-0" />
              </Col>
              <Col md={12}>
                <Form.Label className="small fw-bold text-muted">เบอร์โทรศัพท์</Form.Label>
                <Form.Control type="tel" name="phone" value={formData.phone} onChange={handleInputChange} className="bg-light border-0" placeholder="08xxxxxxxx" />
              </Col>
              <Col md={12}>
                <Form.Label className="small fw-bold text-muted">ระดับผู้ใช้งาน</Form.Label>
                <Form.Select name="role" value={formData.role} onChange={handleInputChange} className="bg-light border-0 shadow-sm" required>
                  <option value="admin">ผู้ดูแลระบบ</option>
                  <option value="user">ผู้ใช้ทั่วไป</option>
                </Form.Select>
              </Col>
            </Row>
            <div className="d-flex gap-2 mt-4 pt-2">
              <Button variant="light" className="w-100 rounded-pill fw-bold border" onClick={() => setShowAddForm(false)}>
                ยกเลิก
              </Button>
              <Button type="submit" variant="info" className="w-100 rounded-pill fw-bold shadow-sm text-white">
                บันทึกข้อมูล
              </Button>
            </div>
          </Form>
        </Modal.Body>
      </Modal>

      {/* Edit User Modal */}
      <Modal show={showEditForm} onHide={() => setShowEditForm(false)} centered>
        <Modal.Header closeButton className="border-0">
          <Modal.Title className="fw-bold text-enterprise">แก้ไขข้อมูลผู้ใช้</Modal.Title>
        </Modal.Header>
        <Modal.Body className="px-4 pb-4">
          <Form onSubmit={handleEditSubmit}>
            <Row className="g-3">
              <Col md={12}>
                <Form.Label className="small fw-bold text-muted">อีเมล</Form.Label>
                <Form.Control 
                  type="email" 
                  value={editFormData.email} 
                  onChange={(e) => setEditFormData({...editFormData, email: e.target.value})} 
                  required 
                  className="bg-light border-0" 
                  disabled={!currentUser?.is_primary}
                />
              </Col>
              <Col md={6}>
                <Form.Label className="small fw-bold text-muted">ชื่อจริง</Form.Label>
                <Form.Control 
                  type="text" 
                  value={editFormData.first_name} 
                  onChange={(e) => setEditFormData({...editFormData, first_name: e.target.value})} 
                  required 
                  className="bg-light border-0" 
                />
              </Col>
              <Col md={6}>
                <Form.Label className="small fw-bold text-muted">นามสกุล</Form.Label>
                <Form.Control 
                  type="text" 
                  value={editFormData.last_name} 
                  onChange={(e) => setEditFormData({...editFormData, last_name: e.target.value})} 
                  required 
                  className="bg-light border-0" 
                />
              </Col>
              <Col md={12}>
                <Form.Label className="small fw-bold text-muted">เบอร์โทรศัพท์</Form.Label>
                <Form.Control 
                  type="tel" 
                  value={editFormData.phone} 
                  onChange={(e) => setEditFormData({...editFormData, phone: e.target.value})} 
                  className="bg-light border-0" 
                />
              </Col>
              {currentUser?.is_primary && (
                <Col md={12}>
                  <Form.Label className="small fw-bold text-muted">ระดับผู้ใช้งาน</Form.Label>
                  <Form.Select 
                    value={editFormData.role} 
                    onChange={(e) => setEditFormData({...editFormData, role: e.target.value})} 
                    className="bg-light border-0 shadow-sm"
                  >
                    <option value="admin">ผู้ดูแลระบบ</option>
                    <option value="user">ผู้ใช้ทั่วไป</option>
                  </Form.Select>
                </Col>
              )}
            </Row>
            <div className="d-flex gap-2 mt-4 pt-2">
              <Button variant="light" className="w-100 rounded-pill fw-bold border" onClick={() => setShowEditForm(false)}>
                ยกเลิก
              </Button>
              <Button type="submit" variant="primary" className="w-100 rounded-pill fw-bold shadow-sm">
                บันทึกการเปลี่ยนแปลง
              </Button>
            </div>
          </Form>
        </Modal.Body>
      </Modal>

      <ConfirmDeleteModal
        show={showDeleteModal}
        onHide={() => setShowDeleteModal(false)}
        onConfirm={confirmRemoveAdmin}
        title="ยืนยันการลบผู้ใช้"
        message="คุณแน่ใจหรือไม่ที่จะลบผู้ใช้คนนี้? การดำเนินการนี้ไม่สามารถกู้คืนได้"
        itemName={deleteTarget ? `${deleteTarget.first_name} ${deleteTarget.last_name} (${deleteTarget.email})` : ''}
      />
    </div>
  )
}

export default UserManagePage
