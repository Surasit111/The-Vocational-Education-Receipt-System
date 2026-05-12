import { useState, useEffect } from 'react'
import { Modal, Button, Form, ListGroup, Badge, Spinner, Nav, Card } from 'react-bootstrap'
import { Plus, Trash2, Edit3, Save, X, Settings, Book, User, Briefcase, Building, Shield, Award, Info } from 'lucide-react'
import { toast } from 'react-hot-toast'
import { categoryService } from '../services/categoryService'
import { useAuth } from '../contexts/AuthContext'
import ConfirmDeleteModal from './ConfirmDeleteModal'

const CATEGORY_TYPES = [
  { key: 'academic_year', label: 'ปีการศึกษา', icon: <Book size={18} /> },
  { key: 'name_type', label: 'คำนำหน้าชื่อ', icon: <User size={18} /> },
  { key: 'location', label: 'ตำแหน่ง', icon: <Briefcase size={18} /> },
  { key: 'agency', label: 'หน่วยงาน', icon: <Building size={18} /> },
  { key: 'supervisor', label: 'หัวหน้างาน', icon: <Shield size={18} /> },
  { key: 'supervisor_position', label: 'ตำแหน่งหัวหน้างาน', icon: <Award size={18} /> }
]

const PLACEHOLDERS = {
  academic_year: "เช่น 2567",
  name_type: "เช่น นาย / นาง / นางสาว",
  location: "เช่น หัวหน้าแผนกซ่อมบำรุง",
  agency: "เช่น งานบริหารทั่วไป",
  supervisor: "เช่น นายสมชาย ใจดี",
  supervisor_position: "เช่น ผู้อำนวยการกองช่าง"
}

function CategoryManageModal({ show, onHide, onUpdate }) {
  const { isAdmin } = useAuth()
  const [categories, setCategories] = useState({})
  const [loading, setLoading] = useState(false)
  const [activeTab, setActiveTab] = useState('academic_year')
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [deleteTarget, setDeleteTarget] = useState(null)
  const [showAddForm, setShowAddForm] = useState(false)
  const [editingId, setEditingId] = useState(null)
  const [formData, setFormData] = useState({ label: '' })

  useEffect(() => {
    if (show) fetchCategories()
  }, [show])

  const fetchCategories = async () => {
    setLoading(true)
    try {
      const data = await categoryService.getAll()
      setCategories(data)
    } catch (error) {
      toast.error(error.message)
    } finally {
      setLoading(false)
    }
  }

  const handleAdd = async (type) => {
    if (!formData.label) { toast.error('กรุณากรอกข้อมูล'); return; }
    try {
      await categoryService.create({ type, value: formData.label, label: formData.label })
      toast.success('เพิ่มหมวดหมู่สำเร็จ')
      setFormData({ label: '' }); setShowAddForm(false); fetchCategories()
      if (onUpdate) onUpdate()
    } catch (error) { toast.error(error.message) }
  }

  const handleEdit = async (id) => {
    if (!formData.label) { toast.error('กรุณากรอกข้อมูล'); return; }
    try {
      await categoryService.update(id, { value: formData.label, label: formData.label })
      toast.success('แก้ไขหมวดหมู่สำเร็จ')
      setFormData({ label: '' }); setEditingId(null); fetchCategories()
      if (onUpdate) onUpdate()
    } catch (error) { toast.error(error.message) }
  }

  const handleDelete = (id, label) => {
    setDeleteTarget({ id, label }); setShowDeleteModal(true)
  }

  const confirmDelete = async () => {
    if (!deleteTarget) return
    try {
      await categoryService.delete(deleteTarget.id)
      toast.success('ลบหมวดหมู่สำเร็จ')
      setShowDeleteModal(false); setDeleteTarget(null); fetchCategories()
      if (onUpdate) onUpdate()
    } catch (error) { toast.error(error.message) }
  }

  const renderCategoryList = (type) => {
    const items = categories[type] || []
    return (
      <div className="pt-3">
        <div className="d-flex justify-content-between align-items-center mb-4">
          <h6 className="mb-0 fw-bold d-flex align-items-center" style={{ color: '#012970' }}>
            {CATEGORY_TYPES.find(t => t.key === type)?.icon}
            <span className="ms-2">รายการ{CATEGORY_TYPES.find(t => t.key === type)?.label}</span>
            <Badge bg="primary-subtle" text="primary" className="ms-2 rounded-pill px-2">{items.length}</Badge>
          </h6>
          <Button 
            size="sm" 
            variant="primary"
            className="rounded-pill px-3 d-flex align-items-center"
            onClick={() => { setShowAddForm(true); setEditingId(null); setFormData({ label: '' }); }}
          >
            <Plus size={16} className="me-1" /> เพิ่มใหม่
          </Button>
        </div>

        {showAddForm && (
          <Card className="border-0 bg-light mb-4 shadow-sm">
            <Card.Body className="p-3">
              <Form onSubmit={(e) => { e.preventDefault(); handleAdd(type); }}>
                <Form.Group className="mb-3">
                  <Form.Label className="small fw-bold text-muted">กรอกข้อมูลที่ต้องการเพิ่ม</Form.Label>
                  <Form.Control
                    size="sm"
                    type="text"
                    value={formData.label}
                    onChange={(e) => setFormData({ label: e.target.value })}
                    placeholder={PLACEHOLDERS[type] || "กรอกข้อมูล"}
                    className="border-0 shadow-sm"
                    required
                    autoFocus
                  />
                </Form.Group>
                <div className="d-flex gap-2">
                  <Button size="sm" type="submit" variant="primary" className="px-3">บันทึก</Button>
                  <Button size="sm" variant="light" className="border px-3" onClick={() => { setShowAddForm(false); setFormData({ label: '' }); }}>ยกเลิก</Button>
                </div>
              </Form>
            </Card.Body>
          </Card>
        )}

        <ListGroup className="border-0 shadow-sm rounded-3 overflow-hidden">
          {items.length === 0 ? (
            <ListGroup.Item className="text-center py-5 text-muted bg-white border-0">
              <div className="mb-2 opacity-25"><Settings size={40} /></div>
              <p className="small mb-0">ยังไม่มีข้อมูลในหมวดหมู่นี้</p>
            </ListGroup.Item>
          ) : (
            items.map((item) => (
              <ListGroup.Item key={item.id} className="border-0 border-bottom px-3 py-3 hover-bg-light transition-all bg-white">
                {editingId === item.id ? (
                  <Form onSubmit={(e) => { e.preventDefault(); handleEdit(item.id); }}>
                    <div className="d-flex gap-2 align-items-center">
                      <Form.Control
                        size="sm"
                        type="text"
                        value={formData.label}
                        onChange={(e) => setFormData({ label: e.target.value })}
                        className="border-primary-subtle"
                        autoFocus
                      />
                      <Button size="sm" type="submit" variant="success" className="p-1 px-2"><Save size={14} /></Button>
                      <Button size="sm" variant="light" className="border p-1 px-2" onClick={() => setEditingId(null)}><X size={14} /></Button>
                    </div>
                  </Form>
                ) : (
                  <div className="d-flex justify-content-between align-items-center">
                    <span className="fw-medium text-dark">{item.label}</span>
                    <div className="d-flex gap-1">
                      <Button 
                        size="sm" 
                        variant="light"
                        className="text-primary border-0 p-1 px-2 hover-shadow-sm"
                        onClick={() => { setEditingId(item.id); setFormData({ label: item.label }); setShowAddForm(false); }}
                      >
                        <Edit3 size={14} />
                      </Button>
                      {isAdmin() && (
                        <Button 
                          size="sm" 
                          variant="light"
                          className="text-danger border-0 p-1 px-2 hover-shadow-sm"
                          onClick={() => handleDelete(item.id, item.label)}
                        >
                          <Trash2 size={14} />
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
    )
  }

  return (
    <>
      <Modal show={show} onHide={onHide} size="lg" centered className="category-modal border-0">
        <Modal.Header closeButton className="border-0 pb-0 px-4 pt-4">
          <Modal.Title className="fw-bold d-flex align-items-center" style={{ color: '#012970' }}>
            <div className="bg-primary-subtle p-2 rounded-3 me-2">
              <Settings size={20} className="text-primary" />
            </div>
            จัดการหมวดหมู่ข้อมูล
          </Modal.Title>
        </Modal.Header>
        <Modal.Body className="px-4 pb-4">
          <p className="text-muted small mb-4">ปรับแต่งตัวเลือกที่แสดงในฟอร์มเพื่อให้ข้อมูลเป็นมาตรฐานเดียวกัน</p>
          
          <Nav variant="tabs" className="custom-nav-tabs border-bottom-0 mb-3 gap-1">
            {CATEGORY_TYPES.map((type) => (
              <Nav.Item key={type.key}>
                <Nav.Link 
                  active={activeTab === type.key}
                  onClick={() => setActiveTab(type.key)}
                  className={`px-3 py-2 rounded-3 border-0 small fw-bold d-flex align-items-center transition-all ${activeTab === type.key ? 'bg-primary text-white shadow-sm' : 'text-muted bg-light'}`}
                >
                  <span className="me-2 d-none d-md-inline">{type.icon}</span>
                  {type.label}
                </Nav.Link>
              </Nav.Item>
            ))}
          </Nav>

          <div className="category-content-scroll" style={{ maxHeight: '50vh', overflowY: 'auto' }}>
            {loading ? (
              <div className="text-center py-5">
                <Spinner animation="border" variant="primary" size="sm" />
                <p className="mt-2 small text-muted">กำลังดึงข้อมูล...</p>
              </div>
            ) : renderCategoryList(activeTab)}
          </div>

          {!isAdmin() && (
            <div className="mt-4 p-3 rounded-3 bg-info-subtle border-0 d-flex align-items-start">
              <Info size={18} className="text-info me-2 mt-1 flex-shrink-0" />
              <p className="small mb-0 text-info-emphasis">
                <strong>ข้อมูลเพิ่มเติม:</strong> คุณสามารถเพิ่มและแก้ไขหมวดหมู่ได้เพื่อให้ฟอร์มสมบูรณ์ขึ้น แต่การลบข้อมูลสงวนไว้สำหรับผู้ดูแลระบบเท่านั้น
              </p>
            </div>
          )}
        </Modal.Body>
        <Modal.Footer className="border-0 px-4 pb-4">
          <Button variant="light" className="px-4 border text-muted fw-bold" onClick={onHide}>ปิดหน้าต่าง</Button>
        </Modal.Footer>
      </Modal>

      <ConfirmDeleteModal
        show={showDeleteModal}
        onHide={() => { setShowDeleteModal(false); setDeleteTarget(null); }}
        onConfirm={confirmDelete}
        title="ลบหมวดหมู่ข้อมูล"
        message="คุณแน่ใจหรือไม่ที่จะลบรายการนี้? การลบอาจส่งผลต่อข้อมูลเดิมที่เคยกรอกไว้"
        itemName={deleteTarget?.label}
      />
    </>
  )
}

export default CategoryManageModal