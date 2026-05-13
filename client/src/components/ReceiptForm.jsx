import React, { useState, useEffect } from 'react'
import { Form, Button, Row, Col, Alert, Modal, Card, InputGroup } from 'react-bootstrap'
import { FilePlus, User, Briefcase, CreditCard, Settings, Plus, Trash2, Calendar, ClipboardCheck, Lock } from 'lucide-react'
import DatePicker from "react-datepicker"
import "react-datepicker/dist/react-datepicker.css"
import { registerLocale } from "react-datepicker"
import th from "date-fns/locale/th"
import { receiptService } from '../services/receiptService'
import { categoryService } from '../services/categoryService'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'

registerLocale("th", th)

function CustomDateInput({ value, onClick, placeholder }) {
  const displayValue = value
    ? value.replace(/(\d{2})\/(\d{2})\/(\d{4})/, (match, day, month, year) => {
        const buddhistYear = parseInt(year, 10) + 543
        return `${day}/${month}/${buddhistYear}`
      })
    : ""

  return (
    <InputGroup onClick={onClick} className="cursor-pointer">
      <InputGroup.Text className="bg-light border-end-0">
        <Calendar size={18} className="text-muted" />
      </InputGroup.Text>
      <Form.Control
        value={displayValue}
        placeholder={placeholder}
        readOnly
        className="bg-white border-start-0 ps-0"
        style={{ cursor: 'pointer' }}
      />
    </InputGroup>
  )
}

const SEMESTERS = [
  { value: 1, label: '1' },
  { value: 2, label: '2' },
  { value: 3, label: '3' }
]

function ReceiptForm() {
  const navigate = useNavigate()
  const { isAuthenticated } = useAuth()
  const [categories, setCategories] = useState({
    academic_year: [],
    name_type: [],
    location: [],
    agency: [],
    supervisor: [],
    supervisor_position: []
  })

  const [formData, setFormData] = useState({
    academic_year: '',
    semester: '',
    name_type: '',
    payer_name: '',
    location: '',
    agency: '',
    supervisor: '',
    supervisor_position: '',
    payment_entries: [{ date: "", amount: 300 }]
  })

  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState({ type: '', text: '' })

  useEffect(() => {
    fetchCategories()
  }, [])

  const fetchCategories = async () => {
    try {
      const result = await categoryService.getAll()
      if (result && result.data) {
        setCategories(result.data)
      }
    } catch (error) {
      console.error('Error fetching categories:', error)
    }
  }

  const NAME_TYPES = categories.name_type?.map(c => ({ value: c.value, label: c.label })) || []
  const ACADEMIC_YEARS = categories.academic_year?.map(c => ({ value: parseInt(c.value), label: c.label })) || []
  const POSITIONS = categories.location?.map(c => ({ value: c.value, label: c.label })) || []
  const AGENCIES = categories.agency?.map(c => ({ value: c.value, label: c.label })) || []
  const SUPERVISORS = categories.supervisor?.map(c => ({ value: c.value, label: c.label })) || []
  const SUPERVISOR_POSITIONS = categories.supervisor_position?.map(c => ({ value: c.value, label: c.label })) || []

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  const handlePaymentChange = (index, field, value) => {
    const newEntries = [...formData.payment_entries]
    newEntries[index][field] = value
    setFormData(prev => ({
      ...prev,
      payment_entries: newEntries
    }))
  }

  const addPaymentEntry = () => {
    setFormData(prev => ({
      ...prev,
      payment_entries: [
        ...prev.payment_entries,
        { date: "", amount: 300 }
      ]
    }))
  }

  const removePaymentEntry = (index) => {
    if (formData.payment_entries.length > 1) {
      const newEntries = formData.payment_entries.filter((_, i) => i !== index)
      setFormData(prev => ({
        ...prev,
        payment_entries: newEntries
      }))
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setMessage({ type: '', text: '' })

    try {
      const hasEmptyDate = formData.payment_entries.some(entry => !entry.date)
      if (hasEmptyDate) {
        setMessage({
          type: 'warning',
          text: 'กรุณาเลือกวันที่ให้ครบทุกรายการ'
        })
        setLoading(false)
        return
      }

      if (isAuthenticated()) {
        const result = await receiptService.create(formData)
        setMessage({ type: 'success', text: 'สร้างใบเสร็จสำเร็จ!' })
        const nameOnly = formData.payer_name
        setTimeout(() => {
          navigate('/statistics', { state: { filterName: nameOnly, showSuccessMessage: true } })
        }, 1000)
      } else {
        await receiptService.generatePDFOnly(formData)
        setMessage({ type: 'success', text: 'สร้าง PDF สำเร็จ!' })
      }

      setFormData({
        academic_year: '',
        semester: '',
        name_type: '',
        payer_name: '',
        location: '',
        agency: '',
        supervisor: '',
        supervisor_position: '',
        payment_entries: [{ date: "", amount: 300 }]
      })

      setTimeout(() => { setMessage({ type: '', text: '' }) }, 3000)

    } catch (error) {
      console.error('Submit error:', error)
      setMessage({
        type: 'danger',
        text: error.message || 'เกิดข้อผิดพลาดในการสร้างใบเสร็จ'
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="container py-4">
      <Card className="border-0 shadow-sm overflow-hidden rounded-4">
        <Card.Header className="bg-white border-0 py-4 px-4">
          <div className="d-flex align-items-center">
            <h4 className="mb-0 fw-bold text-enterprise">ออกแบบฟอร์มใบเสร็จ กศ.พ.</h4>
          </div>
        </Card.Header>
        
        <Card.Body className="p-4 px-5">
          {message.text && (
            <Alert variant={message.type} className="border-0 shadow-sm d-flex align-items-center mb-4 rounded-4 py-3">
              {message.type === 'success' ? <ClipboardCheck className="me-2" /> : null}
              <span className="fw-medium">{message.text}</span>
            </Alert>
          )}

          <Form onSubmit={handleSubmit}>
            {/* Section 1: ข้อมูลปีการศึกษา */}
            <div className="mb-5">
              <div className="d-flex align-items-center mb-4">
                <span className="bg-primary text-white rounded-circle me-3 d-flex align-items-center justify-content-center fw-bold shadow-sm" style={{ width: '28px', height: '28px', fontSize: '0.85rem' }}>1</span>
                <h5 className="mb-0 fw-bold text-enterprise">ข้อมูลปีการศึกษา</h5>
              </div>
              <Row className="g-4">
                <Col md={6}>
                  <Form.Group>
                    <Form.Label className="small fw-bold text-muted">ภาคเรียนที่</Form.Label>
                    <Form.Select name="semester" value={formData.semester} onChange={handleChange} required className="bg-light border-0">
                      <option value="">เลือกภาคเรียน</option>
                      {SEMESTERS.map(sem => <option key={sem.value} value={sem.value}>{sem.label}</option>)}
                    </Form.Select>
                  </Form.Group>
                </Col>
                <Col md={6}>
                  <Form.Group>
                    <Form.Label className="small fw-bold text-muted">ปีการศึกษา</Form.Label>
                    <Form.Select name="academic_year" value={formData.academic_year} onChange={handleChange} required className="bg-light border-0">
                      <option value="">เลือกปีการศึกษา</option>
                      {ACADEMIC_YEARS.map(year => <option key={year.value} value={year.value}>{year.label}</option>)}
                    </Form.Select>
                  </Form.Group>
                </Col>
              </Row>
            </div>

            {/* Section 2: ข้อมูลผู้ปฏิบัติงาน */}
            <div className="mb-5">
              <div className="d-flex align-items-center mb-4">
                <span className="bg-primary text-white rounded-circle me-3 d-flex align-items-center justify-content-center fw-bold shadow-sm" style={{ width: '28px', height: '28px', fontSize: '0.85rem' }}>2</span>
                <h5 className="mb-0 fw-bold text-enterprise">ข้อมูลผู้ปฏิบัติงาน</h5>
              </div>
              <Row className="g-4 mb-4">
                <Col md={3}>
                  <Form.Group>
                    <Form.Label className="small fw-bold text-muted">คำนำหน้าชื่อ</Form.Label>
                    <Form.Select name="name_type" value={formData.name_type} onChange={handleChange} required className="bg-light border-0">
                      <option value="">คำนำหน้า</option>
                      {NAME_TYPES.map(type => <option key={type.value} value={type.value}>{type.label}</option>)}
                    </Form.Select>
                  </Form.Group>
                </Col>
                <Col md={9}>
                  <Form.Group>
                    <Form.Label className="small fw-bold text-muted">ชื่อ-นามสกุล ผู้ปฏิบัติงาน</Form.Label>
                    <InputGroup>
                      <InputGroup.Text className="bg-light border-0">
                        <User size={18} className="text-muted" />
                      </InputGroup.Text>
                      <Form.Control 
                        type="text" 
                        name="payer_name" 
                        value={formData.payer_name} 
                        onChange={handleChange} 
                        placeholder="กรอกชื่อและนามสกุล" 
                        className="bg-light border-0 ps-0"
                        required 
                      />
                    </InputGroup>
                  </Form.Group>
                </Col>
              </Row>
              <Row className="g-4 mb-4">
                <Col md={6}>
                  <Form.Group>
                    <Form.Label className="small fw-bold text-muted">ตำแหน่ง</Form.Label>
                    <Form.Select name="location" value={formData.location} onChange={handleChange} required className="bg-light border-0">
                      <option value="">เลือกตำแหน่ง</option>
                      {POSITIONS.map(pos => <option key={pos.value} value={pos.value}>{pos.label}</option>)}
                    </Form.Select>
                  </Form.Group>
                </Col>
                <Col md={6}>
                  <Form.Group>
                    <Form.Label className="small fw-bold text-muted">หน่วยงาน</Form.Label>
                    <InputGroup>
                      <InputGroup.Text className="bg-light border-0">
                        <Briefcase size={18} className="text-muted" />
                      </InputGroup.Text>
                      <Form.Select name="agency" value={formData.agency} onChange={handleChange} className="bg-light border-0 ps-0" required>
                        <option value="">เลือกหน่วยงาน</option>
                        {AGENCIES.map(agency => <option key={agency.value} value={agency.value}>{agency.label}</option>)}
                      </Form.Select>
                    </InputGroup>
                  </Form.Group>
                </Col>
              </Row>
              <Row className="g-4">
                <Col md={6}>
                  <Form.Group>
                    <Form.Label className="small fw-bold text-muted">หัวหน้างาน</Form.Label>
                    <Form.Select name="supervisor" value={formData.supervisor} onChange={handleChange} required className="bg-light border-0">
                      <option value="">เลือกหัวหน้างาน</option>
                      {SUPERVISORS.map(sup => <option key={sup.value} value={sup.value}>{sup.label}</option>)}
                    </Form.Select>
                  </Form.Group>
                </Col>
                <Col md={6}>
                  <Form.Group>
                    <Form.Label className="small fw-bold text-muted">ตำแหน่งหัวหน้างาน</Form.Label>
                    <Form.Select name="supervisor_position" value={formData.supervisor_position} onChange={handleChange} required className="bg-light border-0">
                      <option value="">เลือกตำแหน่งหัวหน้างาน</option>
                      {SUPERVISOR_POSITIONS.map(pos => <option key={pos.value} value={pos.value}>{pos.label}</option>)}
                    </Form.Select>
                  </Form.Group>
                </Col>
              </Row>
            </div>

            {/* Section 3: รายการชำระเงิน */}
            <div className="mb-5">
              <div className="d-flex justify-content-between align-items-center mb-4">
                <div className="d-flex align-items-center">
                  <span className="bg-primary text-white rounded-circle me-3 d-flex align-items-center justify-content-center fw-bold shadow-sm" style={{ width: '28px', height: '28px', fontSize: '0.85rem' }}>3</span>
                  <h5 className="mb-0 fw-bold text-enterprise">รายการชำระเงิน</h5>
                </div>
                <Button 
                  variant="outline-primary" 
                  size="sm" 
                  onClick={addPaymentEntry} 
                  className="d-flex align-items-center rounded-pill px-4 py-2 fw-bold transition-all hover-shadow"
                >
                  <Plus size={16} className="me-2" /> เพิ่มรายการ
                </Button>
              </div>

              <div className="bg-light p-4 rounded-4 border-0">
                {formData.payment_entries.map((entry, index) => (
                  <div key={index} className={`pb-4 mb-4 ${index !== formData.payment_entries.length - 1 ? 'border-bottom border-secondary-subtle' : ''}`}>
                    <Row className="g-3 align-items-end">
                      <Col md={5}>
                        <Form.Label className="small fw-bold text-muted">วัน เดือน ปี</Form.Label>
                        <DatePicker
                          selected={entry.date ? new Date(entry.date + "T00:00:00") : null}
                          onChange={(date) => {
                            const year = date.getFullYear()
                            const month = String(date.getMonth() + 1).padStart(2, '0')
                            const day = String(date.getDate()).padStart(2, '0')
                            const isoDate = `${year}-${month}-${day}`
                            handlePaymentChange(index, "date", isoDate)
                          }}
                          dateFormat="dd/MM/yyyy"
                          locale="th"
                          customInput={<CustomDateInput placeholder="เลือกวันที่" />}
                          wrapperClassName="w-100"
                        />
                      </Col>
                      <Col md={5}>
                        <Form.Label className="small fw-bold text-muted">จำนวนเงิน (บาท)</Form.Label>
                        <InputGroup>
                          <InputGroup.Text className="bg-white border-0 shadow-sm">
                            <CreditCard size={18} className="text-muted" />
                          </InputGroup.Text>
                          <Form.Control
                            type="number"
                            value={entry.amount}
                            onChange={(e) => handlePaymentChange(index, "amount", e.target.value)}
                            className="bg-white border-0 shadow-sm ps-0"
                            min="0"
                            required
                          />
                        </InputGroup>
                      </Col>
                      <Col md={2}>
                        {formData.payment_entries.length > 1 && (
                          <Button 
                            variant="light" 
                            className="w-100 d-flex align-items-center justify-content-center text-danger border-0 hover-shadow transition-all"
                            onClick={() => removePaymentEntry(index)}
                            style={{ height: '42px', backgroundColor: 'rgba(239, 71, 111, 0.1)' }}
                          >
                            <Trash2 size={18} />
                          </Button>
                        )}
                      </Col>
                    </Row>
                  </div>
                ))}
              </div>
            </div>

            <div className="text-center pt-4">
              <Button 
                variant="primary" 
                type="submit" 
                size="lg" 
                className="w-100 w-md-50 py-3 shadow-premium d-flex align-items-center justify-content-center mx-auto fw-bold rounded-pill"
                disabled={loading}
              >
                {loading ? (
                  <>
                    <span className="spinner-border spinner-border-sm me-3" role="status" aria-hidden="true"></span>
                    กำลังบันทึกข้อมูล...
                  </>
                ) : (
                  <>
                    <ClipboardCheck className="me-2" size={22} />
                    ยืนยันออกใบเสร็จรับเงิน
                  </>
                )}
              </Button>
              <p className="mt-4 text-muted small">โปรดตรวจสอบความถูกต้องของข้อมูลก่อนยืนยัน เพื่อความถูกต้องของเอกสาร</p>
            </div>
          </Form>
        </Card.Body>
      </Card>
    </div>
  )
}

export default ReceiptForm