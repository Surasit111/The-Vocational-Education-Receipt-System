import { useState, useEffect } from 'react'
import { Form, Button, Row, Col, Card, InputGroup } from 'react-bootstrap'
import { Filter, Calendar, BookOpen, User, RefreshCw, Search, ChevronDown } from 'lucide-react'
import { categoryService } from '../services/categoryService'

function StatisticsFilter({ onFilter, onClear, nameOptions = [], initialName = '' }) {
  const [filters, setFilters] = useState({
    month_start: '',
    month_end: '',
    academic_year: '',
    semester: '',
    name: initialName
  })

  const [categories, setCategories] = useState({
    academic_year: [],
    name_type: [],
    location: [],
    agency: [],
    supervisor: [],
    supervisor_position: []
  })

  const MONTHS = [
    { value: 1, label: 'มกราคม' }, { value: 2, label: 'กุมภาพันธ์' }, { value: 3, label: 'มีนาคม' },
    { value: 4, label: 'เมษายน' }, { value: 5, label: 'พฤษภาคม' }, { value: 6, label: 'มิถุนายน' },
    { value: 7, label: 'กรกฎาคม' }, { value: 8, label: 'สิงหาคม' }, { value: 9, label: 'กันยายน' },
    { value: 10, label: 'ตุลาคม' }, { value: 11, label: 'พฤศจิกายน' }, { value: 12, label: 'ธันวาคม' }
  ]

  const SEMESTERS = [
    { value: 1, label: 'ภาคเรียนที่ 1' },
    { value: 2, label: 'ภาคเรียนที่ 2' },
    { value: 3, label: 'ภาคเรียนที่ 3' }
  ]

  useEffect(() => {
    fetchCategories()
  }, [])

  useEffect(() => {
    if (initialName) {
      setFilters(prev => ({ ...prev, name: initialName }))
    }
  }, [initialName])

  const fetchCategories = async () => {
    try {
      const data = await categoryService.getAll()
      setCategories(data)
    } catch (error) {
      console.error('Error fetching categories:', error)
    }
  }

  useEffect(() => {
    let submitFilters = {}
    if (filters.month_start) submitFilters.month_start = filters.month_start
    if (filters.month_end) submitFilters.month_end = filters.month_end
    if (filters.academic_year) submitFilters.academic_year = filters.academic_year
    if (filters.semester) submitFilters.semester = filters.semester
    if (filters.name) submitFilters.name = filters.name
    onFilter(submitFilters)
  }, [filters])

  const handleChange = (e) => {
    const { name, value } = e.target
    setFilters(prev => ({ ...prev, [name]: value }))
  }

  const handleClear = () => {
    setFilters({ month_start: '', month_end: '', academic_year: '', semester: '', name: '' })
    onClear()
  }

  return (
    <Card className="border-0 shadow-sm mb-4 rounded-4 overflow-hidden">
      <Card.Body className="p-4">
        <div className="d-flex align-items-center mb-4 pb-2 border-bottom border-light">
          <div className="bg-primary-soft p-2 rounded-3 me-3">
            <Filter size={18} className="text-primary" />
          </div>
          <div>
            <h6 className="mb-0 fw-bold text-enterprise">ตัวกรองรายงาน</h6>
            <p className="text-muted small mb-0">ค้นหาและคัดกรองข้อมูลที่คุณต้องการ</p>
          </div>
        </div>

        <Form>
          <Row className="g-3">
            <Col lg={4} md={6}>
              <Form.Label className="small fw-bold text-muted px-1">ช่วงเดือน</Form.Label>
              <InputGroup size="sm" className="shadow-none">
                <InputGroup.Text className="bg-light border-0">
                  <Calendar size={14} className="text-muted" />
                </InputGroup.Text>
                <Form.Select name="month_start" value={filters.month_start} onChange={handleChange} className="bg-light border-0 ps-0">
                  <option value="">เริ่มต้น</option>
                  {MONTHS.map(m => <option key={m.value} value={m.value}>{m.label}</option>)}
                </Form.Select>
                <InputGroup.Text className="bg-light border-0 text-muted px-1 small opacity-50">-</InputGroup.Text>
                <Form.Select name="month_end" value={filters.month_end} onChange={handleChange} className="bg-light border-0 ps-0">
                  <option value="">สิ้นสุด</option>
                  {MONTHS.map(m => <option key={m.value} value={m.value}>{m.label}</option>)}
                </Form.Select>
              </InputGroup>
            </Col>

            <Col lg={2} md={6}>
              <Form.Label className="small fw-bold text-muted px-1">ปีการศึกษา</Form.Label>
              <InputGroup size="sm">
                <InputGroup.Text className="bg-light border-0">
                  <BookOpen size={14} className="text-muted" />
                </InputGroup.Text>
                <Form.Select name="academic_year" value={filters.academic_year} onChange={handleChange} className="bg-light border-0 ps-0">
                  <option value="">ทั้งหมด</option>
                  {categories.academic_year?.map((year) => <option key={year.id} value={year.value}>{year.label}</option>)}
                </Form.Select>
              </InputGroup>
            </Col>

            <Col lg={2} md={6}>
              <Form.Label className="small fw-bold text-muted px-1">ภาคเรียน</Form.Label>
              <InputGroup size="sm">
                <InputGroup.Text className="bg-light border-0">
                  <RefreshCw size={14} className="text-muted" />
                </InputGroup.Text>
                <Form.Select name="semester" value={filters.semester} onChange={handleChange} className="bg-light border-0 ps-0">
                  <option value="">ทั้งหมด</option>
                  {SEMESTERS.map(s => <option key={s.value} value={s.value}>{s.label}</option>)}
                </Form.Select>
              </InputGroup>
            </Col>

            <Col lg={3} md={6}>
              <Form.Label className="small fw-bold text-muted px-1">ชื่อผู้ปฏิบัติงาน</Form.Label>
              <InputGroup size="sm">
                <InputGroup.Text className="bg-light border-0">
                  <User size={14} className="text-muted" />
                </InputGroup.Text>
                <Form.Select name="name" value={filters.name} onChange={handleChange} className="bg-light border-0 ps-0">
                  <option value="">เลือกรายชื่อ...</option>
                  {nameOptions.map((name, index) => <option key={index} value={name}>{name}</option>)}
                </Form.Select>
              </InputGroup>
            </Col>

            <Col lg={1} md={12} className="d-flex align-items-end">
              <Button 
                variant="light" 
                size="sm" 
                onClick={handleClear}
                className="w-100 border-0 bg-light text-muted hover-shadow transition-all"
                style={{ height: '35px' }}
                title="ล้างตัวกรอง"
              >
                <RefreshCw size={16} />
              </Button>
            </Col>
          </Row>
        </Form>
      </Card.Body>
    </Card>
  )
}

export default StatisticsFilter