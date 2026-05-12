import { useState, useEffect } from 'react'
import { Container, Card, Row, Col, Alert, Pagination } from 'react-bootstrap'
import { LayoutDashboard, FileText, Search, Info, CheckCircle, ChevronRight, User, ChevronLeft } from 'lucide-react'
import StatisticsFilter from '../components/StatisticsFilter'
import ReceiptTable from '../components/ReceiptTable'
import { receiptService } from '../services/receiptService'
import { useAuth } from '../contexts/AuthContext'
import { useLocation, Link } from 'react-router-dom'

function StatisticsPage() {
  const { isAdmin } = useAuth()
  const location = useLocation()
  const [receipts, setReceipts] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [currentFilters, setCurrentFilters] = useState({})
  const [nameOptions, setNameOptions] = useState([])
  const [filterKey, setFilterKey] = useState(0)
  const [successMessage, setSuccessMessage] = useState('')
  
  // Pagination State
  const [currentPage, setCurrentPage] = useState(1)
  const itemsPerPage = 15

  useEffect(() => {
    fetchNameOptions()
    if (location.state?.filterName) {
      const { filterName, showSuccessMessage } = location.state
      if (showSuccessMessage) {
        setSuccessMessage(`สร้างใบเสร็จสำเร็จ! กำลังแสดงรายการของ ${filterName}`)
        setTimeout(() => setSuccessMessage(''), 5000)
      }
      fetchReceipts({ name: filterName })
      window.history.replaceState({}, document.title)
    } else {
      fetchReceipts()
    }
  }, [location.state])

  const fetchReceipts = async (filters = {}) => {
    setLoading(true)
    setError('')
    try {
      const result = await receiptService.getAll(filters)
      setReceipts(Array.isArray(result.data) ? result.data : [])
      setCurrentFilters(filters)
      setCurrentPage(1) // Reset to first page on new search
    } catch (err) {
      setError(err.message || 'เกิดข้อผิดพลาดในการดึงข้อมูล')
      setReceipts([])
    } finally {
      setLoading(false)
    }
  }

  const handleRefreshAfterDelete = () => fetchReceipts(currentFilters)
  
  const fetchNameOptions = async () => {
    try {
      const result = await receiptService.getUniqueNames()
      setNameOptions(Array.isArray(result.data) ? result.data : [])
    } catch (err) {
      console.error('Error fetching name options:', err)
    }
  }

  const handleFilter = (filters) => fetchReceipts(filters)
  const handleClear = () => fetchReceipts({})

  // Pagination Logic
  const indexOfLastItem = currentPage * itemsPerPage
  const indexOfFirstItem = indexOfLastItem - itemsPerPage
  const currentItems = Array.isArray(receipts) ? receipts.slice(indexOfFirstItem, indexOfLastItem) : []
  const totalPages = Math.ceil((receipts?.length || 0) / itemsPerPage)

  const handlePageChange = (pageNumber) => {
    setCurrentPage(pageNumber)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  return (
    <div className="py-5 min-vh-100">
      <Container>
        {/* Unified Header Card */}
        <Card className="border-0 shadow-sm rounded-4 overflow-hidden mb-4">
          <Card.Body className="p-4 px-lg-5">
            <div className="d-flex align-items-center justify-content-between flex-wrap gap-4">
              <div>
                <h2 className="fw-bold mb-1 tracking-tight text-enterprise">รายการใบเสร็จ</h2>
                <p className="text-muted mb-0 small">ตรวจสอบข้อมูลและสรุปรายการใบเสร็จรับเงินทั้งหมดในระบบ</p>
              </div>
              <div className="d-flex gap-3">
                <div className="text-end px-2">
                  <div className="small text-muted mb-0" style={{ fontSize: '0.8rem' }}>จำนวนใบเสร็จทั้งหมด</div>
                  <div className="fw-bold text-enterprise fs-3">{receipts.length} <span className="small fw-normal text-muted" style={{ fontSize: '0.95rem' }}>รายการ</span></div>
                </div>
              </div>
            </div>
          </Card.Body>
        </Card>

        {/* Status Messages */}
        {(successMessage || error) && (
          <div className="mb-4">
            {successMessage && (
              <Alert variant="success" className="border-0 shadow-sm d-flex align-items-center py-3 rounded-4 bg-success-subtle">
                <CheckCircle size={20} className="me-3 text-success" />
                <span className="fw-medium text-success-emphasis">{successMessage}</span>
              </Alert>
            )}
            {error && (
              <Alert variant="danger" className="border-0 shadow-sm d-flex align-items-center py-3 rounded-4 bg-danger-subtle">
                <Info size={20} className="me-3 text-danger" />
                <span className="fw-medium text-danger-emphasis">{error}</span>
              </Alert>
            )}
          </div>
        )}

        <Row className="g-4">
          <Col lg={12}>
            {/* Minimal Filter Section */}
            <StatisticsFilter 
              key={filterKey}
              onFilter={handleFilter} 
              onClear={handleClear}
              nameOptions={nameOptions}
              initialName={location.state?.filterName || ''}
            />

            {/* Enterprise Table Card */}
            <Card className="border-0 shadow-sm overflow-hidden rounded-4">
              <Card.Body className="p-0">
                <ReceiptTable 
                  receipts={currentItems} 
                  loading={loading} 
                  isAdmin={isAdmin()} 
                  onDelete={handleRefreshAfterDelete}
                />
              </Card.Body>
              
              {/* Pagination Controls */}
              {!loading && totalPages > 1 && (
                <div className="p-3 border-top d-flex align-items-center justify-content-between bg-white">
                  <div className="text-muted small">
                    แสดง {indexOfFirstItem + 1} ถึง {Math.min(indexOfLastItem, receipts.length)} จากทั้งหมด {receipts.length} รายการ
                  </div>
                  <Pagination className="mb-0 custom-pagination">
                    <Pagination.Prev 
                      onClick={() => handlePageChange(currentPage - 1)}
                      disabled={currentPage === 1}
                    >
                      <ChevronLeft size={16} />
                    </Pagination.Prev>
                    
                    {[...Array(totalPages)].map((_, i) => (
                      <Pagination.Item 
                        key={i + 1} 
                        active={i + 1 === currentPage}
                        onClick={() => handlePageChange(i + 1)}
                      >
                        {i + 1}
                      </Pagination.Item>
                    ))}

                    <Pagination.Next 
                      onClick={() => handlePageChange(currentPage + 1)}
                      disabled={currentPage === totalPages}
                    >
                      <ChevronRight size={16} />
                    </Pagination.Next>
                  </Pagination>
                </div>
              )}
            </Card>
          </Col>
        </Row>
      </Container>
    </div>
  )
}

export default StatisticsPage