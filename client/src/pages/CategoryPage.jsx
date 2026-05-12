import { useState, useEffect } from 'react'
import { Container, Card, Row, Col, Nav, Badge, Button, Form, ListGroup, Spinner } from 'react-bootstrap'
import { Settings, Book, User, Briefcase, Building, Shield, Award, Plus, Trash2, Edit3, Save, X, ChevronRight, Info } from 'lucide-react'
import { toast } from 'react-hot-toast'
import { categoryService } from '../services/categoryService'
import { useAuth } from '../contexts/AuthContext'
import ConfirmDeleteModal from '../components/ConfirmDeleteModal'

const CATEGORY_TYPES = [
  { key: 'academic_year', label: 'ปีการศึกษา', icon: <Book size={18} />, description: 'จัดการปีการศึกษาที่ใช้ในระบบ' },
  { key: 'name_type', label: 'คำนำหน้าชื่อ', icon: <User size={18} />, description: 'จัดการตัวเลือกคำนำหน้าชื่อ' },
  { key: 'location', label: 'ตำแหน่ง', icon: <Briefcase size={18} />, description: 'จัดการตำแหน่งงานของผู้ปฏิบัติงาน' },
  { key: 'agency', label: 'หน่วยงาน', icon: <Building size={18} />, description: 'จัดการชื่อหน่วยงาน/ฝ่ายงาน' },
  { key: 'supervisor', label: 'หัวหน้างาน', icon: <Shield size={18} />, description: 'จัดการชื่อผู้มีอำนาจลงนาม' },
  { key: 'supervisor_position', label: 'ตำแหน่งหัวหน้างาน', icon: <Award size={18} />, description: 'จัดการตำแหน่งของหัวหน้างาน' }
]

function CategoryPage() {
  const { isAdmin } = useAuth()
  const [categories, setCategories] = useState({})
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState('academic_year')
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [deleteTarget, setDeleteTarget] = useState(null)
  const [showAddForm, setShowAddForm] = useState(false)
  const [editingId, setEditingId] = useState(null)
  const [formData, setFormData] = useState({ label: '' })

  useEffect(() => {
    fetchCategories()
  }, [])

  const fetchCategories = async () => {
    setLoading(true)
    try {
      const data = await categoryService.getAll()
      setCategories(data)
    } catch (error) {
      toast.error('ไม่สามารถโหลดข้อมูลหมวดหมู่ได้')
    } finally {
      setLoading(false)
    }
  }

  const handleAdd = async (type) => {
    if (!formData.label) return toast.error('กรุณากรอกข้อมูล')
    try {
      await categoryService.create({ type, value: formData.label, label: formData.label })
      toast.success('เพิ่มข้อมูลสำเร็จ')
      setFormData({ label: '' }); setShowAddForm(false); fetchCategories()
    } catch (error) { toast.error(error.message) }
  }

  const handleEdit = async (id) => {
    if (!formData.label) return toast.error('กรุณากรอกข้อมูล')
    try {
      await categoryService.update(id, { value: formData.label, label: formData.label })
      toast.success('อัปเดตข้อมูลสำเร็จ')
      setFormData({ label: '' }); setEditingId(null); fetchCategories()
    } catch (error) { toast.error(error.message) }
  }

  const handleDelete = (id, label) => {
    setDeleteTarget({ id, label }); setShowDeleteModal(true)
  }

  const confirmDelete = async () => {
    try {
      await categoryService.delete(deleteTarget.id)
      toast.success('ลบข้อมูลสำเร็จ')
      setShowDeleteModal(false); fetchCategories()
    } catch (error) { toast.error(error.message) }
  }

  const currentType = CATEGORY_TYPES.find(t => t.key === activeTab)
  const items = categories[activeTab] || []

  // Calculate total items across all categories
  const totalItems = Object.values(categories).reduce((acc, curr) => acc + (curr?.length || 0), 0)

  return (
    <div className="py-5 min-vh-100">
      <Container>
        {/* Unified Header Card */}
        <Card className="border-0 shadow-sm rounded-4 overflow-hidden mb-4">
          <Card.Body className="p-4 px-lg-5">
            <div className="d-flex align-items-center justify-content-between flex-wrap gap-4">
              <div>
                <h2 className="fw-bold mb-1 tracking-tight text-enterprise">จัดการหมวดหมู่ข้อมูล</h2>
                <p className="text-muted mb-0 small">กำหนดค่าตัวเลือกต่างๆ เพื่อใช้เป็นมาตรฐานในหน้าสร้างใบเสร็จ</p>
              </div>
              <div className="d-flex gap-3">
                <div className="text-end px-2">
                  <div className="small text-muted mb-0" style={{ fontSize: '0.8rem' }}>รายการข้อมูลทั้งหมด</div>
                  <div className="fw-bold text-enterprise fs-3">{loading ? '...' : totalItems} <span className="small fw-normal text-muted" style={{ fontSize: '0.95rem' }}>รายการ</span></div>
                </div>
              </div>
            </div>
          </Card.Body>
        </Card>

        <Row className="g-4">
          {/* Sidebar Menu */}
          <Col lg={4}>
            <Card className="border-0 shadow-sm rounded-4 overflow-hidden">
              <Card.Body className="p-2">
                <Nav className="flex-column gap-1">
                  {CATEGORY_TYPES.map((type) => (
                    <Nav.Link 
                      key={type.key}
                      onClick={() => { setActiveTab(type.key); setShowAddForm(false); setEditingId(null); }}
                      className={`p-3 rounded-3 transition-all d-flex align-items-center justify-content-between ${activeTab === type.key ? 'bg-primary text-white shadow-premium' : 'text-muted hover-bg-light'}`}
                    >
                      <div className="fw-bold" style={{ fontSize: '0.95rem' }}>{type.label}</div>
                      <div className="d-flex align-items-center gap-2">
                        <Badge 
                          bg={activeTab === type.key ? 'white' : 'primary-soft'} 
                          text={activeTab === type.key ? 'primary' : 'primary'} 
                          className="rounded-pill px-2 fw-bold"
                          style={{ fontSize: '0.7rem' }}
                        >
                          {categories[type.key]?.length || 0}
                        </Badge>
                        <ChevronRight size={16} className={`opacity-50 ${activeTab === type.key ? 'd-block' : 'd-none d-lg-block'}`} />
                      </div>
                    </Nav.Link>
                  ))}
                </Nav>
              </Card.Body>
            </Card>

            <div className="mt-4 p-3 rounded-4 bg-primary-soft border-0">
              <div className="d-flex gap-2 text-primary mb-2">
                <Info size={18} />
                <span className="small fw-bold">คำแนะนำ</span>
              </div>
              <p className="small text-muted mb-0">
                การแก้ไขหรือลบข้อมูลหมวดหมู่จะส่งผลต่อตัวเลือกในหน้าฟอร์มสร้างใบเสร็จ โปรดตรวจสอบความถูกต้องก่อนดำเนินการ
              </p>
            </div>
          </Col>

          {/* Main Content Area */}
          <Col lg={8}>
            <Card className="border-0 shadow-sm rounded-4 min-vh-50">
              <Card.Header className="bg-white p-4 border-0">
                <div className="d-flex align-items-center justify-content-between">
                  <div>
                    <div className="d-flex align-items-center gap-2 mb-1">
                      <h4 className="fw-bold text-enterprise mb-0">{currentType?.label}</h4>
                      <Badge bg="primary-subtle" text="primary" className="rounded-pill px-2" style={{ fontSize: '0.7rem' }}>
                        {items.length} รายการ
                      </Badge>
                    </div>
                    <p className="text-muted small mb-0">{currentType?.description}</p>
                  </div>
                  <Button 
                    variant="primary" 
                    size="sm" 
                    className="rounded-pill px-4"
                    onClick={() => { setShowAddForm(true); setEditingId(null); setFormData({ label: '' }); }}
                  >
                    <Plus size={18} className="me-2" /> เพิ่มรายการ
                  </Button>
                </div>
              </Card.Header>
              
              <Card.Body className="p-4 pt-0">
                {showAddForm && (
                  <div className="bg-light p-3 rounded-4 mb-4 border border-primary-soft shadow-sm transition-all">
                    <Form onSubmit={(e) => { e.preventDefault(); handleAdd(activeTab); }}>
                      <Form.Label className="small fw-bold text-muted mb-2">กรอกชื่อรายการที่ต้องการเพิ่ม</Form.Label>
                      <div className="d-flex gap-2">
                        <Form.Control
                          autoFocus
                          placeholder={`เช่น ${currentType?.label}...`}
                          value={formData.label}
                          onChange={(e) => setFormData({ label: e.target.value })}
                          className="border-0 shadow-sm py-2"
                        />
                        <Button type="submit" variant="primary" className="px-4">บันทึก</Button>
                        <Button variant="light" className="border" onClick={() => setShowAddForm(false)}>ยกเลิก</Button>
                      </div>
                    </Form>
                  </div>
                )}

                {loading ? (
                  <div className="text-center py-5">
                    <Spinner animation="border" variant="primary" size="sm" />
                    <p className="mt-2 text-muted small">กำลังโหลดรายการ...</p>
                  </div>
                ) : (
                  <div style={{ maxHeight: '440px', overflowY: 'auto', overflowX: 'hidden' }} className="custom-scrollbar pr-1">
                    <ListGroup variant="flush" className="rounded-4 overflow-hidden border">
                      {items.length === 0 ? (
                        <div className="text-center py-5">
                          <div className="text-muted opacity-25 mb-2"><Plus size={48} /></div>
                          <p className="text-muted small">ยังไม่มีรายการข้อมูลในส่วนนี้</p>
                        </div>
                      ) : (
                        items.map((item) => (
                          <ListGroup.Item key={item.id} className="p-3 border-light transition-all hover-bg-light border-0 border-bottom">
                            {editingId === item.id ? (
                              <Form onSubmit={(e) => { e.preventDefault(); handleEdit(item.id); }} className="d-flex gap-2">
                                <Form.Control
                                  autoFocus
                                  value={formData.label}
                                  onChange={(e) => setFormData({ label: e.target.value })}
                                  size="sm"
                                  className="border-primary"
                                />
                                <Button type="submit" variant="success" size="sm" className="p-1 px-2"><Save size={16} /></Button>
                                <Button variant="light" size="sm" className="border p-1 px-2" onClick={() => setEditingId(null)}><X size={16} /></Button>
                              </Form>
                            ) : (
                              <div className="d-flex align-items-center justify-content-between">
                                <span className="fw-medium">{item.label}</span>
                                <div className="d-flex gap-1">
                                  <Button 
                                    variant="light" 
                                    size="sm" 
                                    className="text-primary border-0 hover-shadow"
                                    onClick={() => { setEditingId(item.id); setFormData({ label: item.label }); setShowAddForm(false); }}
                                  >
                                    <Edit3 size={16} />
                                  </Button>
                                  {isAdmin() && (
                                    <Button 
                                      variant="light" 
                                      size="sm" 
                                      className="text-danger border-0 hover-shadow"
                                      onClick={() => handleDelete(item.id, item.label)}
                                    >
                                      <Trash2 size={16} />
                                    </Button>
                                  )}
                                </div>
                              </div>
                            )}
                          </ListGroup.Item>
                        ))
                      )}
                    </ListGroup>
                  </div>
                )}
              </Card.Body>
            </Card>
          </Col>
        </Row>
      </Container>

      <ConfirmDeleteModal
        show={showDeleteModal}
        onHide={() => setShowDeleteModal(false)}
        onConfirm={confirmDelete}
        title="ยืนยันการลบข้อมูล"
        message="คุณแน่ใจหรือไม่ที่จะลบรายการนี้? ข้อมูลที่เคยถูกใช้ในใบเสร็จจะไม่ได้รับผลกระทบ แต่จะไม่มีตัวเลือกนี้ให้เลือกในครั้งต่อไป"
        itemName={deleteTarget?.label}
      />
    </div>
  )
}

export default CategoryPage
