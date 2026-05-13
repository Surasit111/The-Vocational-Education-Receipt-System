import { Table, Badge, Button } from 'react-bootstrap'
import { FileText, Trash2, User, Phone, ChevronRight, Download } from 'lucide-react'
import { receiptService } from '../services/receiptService'
import { toast } from 'react-hot-toast'
import api from '../services/api'
import { useState } from 'react'
import ConfirmDeleteModal from './ConfirmDeleteModal'

function ReceiptTable({ 
  receipts, 
  loading, 
  isAdmin = false, 
  onDelete = () => window.location.reload() 
}) {
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [deleteTarget, setDeleteTarget] = useState(null)

  const formatDate = (dateString) => {
    try {
      const date = new Date(dateString)
      return date.toLocaleDateString('th-TH', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      })
    } catch (error) {
      return dateString
    }
  }

  const handleViewPDF = async (receipt) => {
    try {
      toast.loading('กำลังโหลดเอกสาร...')
      const response = await api.get(`/receipts/${receipt.id}/pdf`, {
        responseType: 'blob'
      })

      const url = window.URL.createObjectURL(response.data)
      window.open(url, '_blank')
      toast.dismiss()
    } catch (error) {
      toast.dismiss()
      toast.error('ไม่สามารถเปิดไฟล์ PDF ได้')
    }
  }

  const handleDelete = async (id, receiptNumber) => {
    setDeleteTarget({ id, receiptNumber })
    setShowDeleteModal(true)
  }

  const confirmDelete = async () => {
    if (!deleteTarget) return
    try {
      toast.loading('กำลังลบรายการ...')
      await receiptService.delete(deleteTarget.id)
      toast.dismiss()
      toast.success('ลบข้อมูลเรียบร้อยแล้ว')
      setShowDeleteModal(false)
      setDeleteTarget(null)
      onDelete()
    } catch (error) {
      toast.dismiss()
      toast.error(error.message || 'ไม่สามารถลบข้อมูลได้')
    }
  }

  if (loading) {
    return (
      <div className="d-flex flex-column align-items-center justify-content-center py-5">
        <div className="spinner-border text-primary opacity-25 mb-3" role="status" style={{ width: '3rem', height: '3rem' }}></div>
        <p className="text-muted small fw-medium">กำลังเตรียมข้อมูล...</p>
      </div>
    )
  }

  if (!receipts || receipts.length === 0) {
    return (
      <div className="text-center py-5">
        <div className="bg-light d-inline-flex p-4 rounded-circle mb-4">
          <FileText size={48} className="text-muted opacity-25" />
        </div>
        <h5 className="fw-bold text-enterprise mb-2">ไม่พบรายการใบเสร็จ</h5>
        <p className="text-muted small mx-auto" style={{ maxWidth: '300px' }}>
          ขณะนี้ยังไม่มีข้อมูลในระบบ หรือลองปรับเงื่อนไขการค้นหาใหม่อีกครั้ง
        </p>
      </div>
    )
  }

  return (
    <div className="receipt-table-container">
      <div className="table-responsive">
        <table className="custom-table w-100">
          <thead>
            <tr>
              <th>วันที่ออกเอกสาร</th>
              <th className="text-center">ปี/ภาคเรียน</th>
              <th>ชื่อผู้ปฏิบัติงาน</th>
              <th className="text-center">เอกสาร</th>
              <th>ผู้ทำรายการ</th>
              {isAdmin && <th className="text-end">การจัดการ</th>}
            </tr>
          </thead>
          <tbody>
            {receipts.map((receipt) => (
              <tr key={receipt.id}>
                <td className="fw-semibold text-enterprise" style={{ fontSize: '0.9rem' }}>
                  {formatDate(receipt.receipt_date)}
                </td>
                <td className="text-center">
                  <Badge bg="primary-subtle" text="primary" className="fw-bold px-2 py-1" style={{ fontSize: '0.75rem' }}>
                    {receipt.academic_year}/{receipt.semester || '-'}
                  </Badge>
                </td>
                <td>
                  <div className="d-flex flex-column">
                    <div className="fw-bold text-enterprise" style={{ fontSize: '0.95rem' }}>
                      <span className="text-muted fw-normal me-1" style={{ fontSize: '0.8rem' }}>{receipt.name_type}</span>
                      {receipt.payer_name}
                    </div>
                    <div className="text-muted small mt-1" style={{ fontSize: '0.75rem' }}>
                      {receipt.location}
                    </div>
                  </div>
                </td>
                <td className="text-center">
                  <Button 
                    variant="light" 
                    size="sm"
                    className="rounded-3 border-0 bg-danger-subtle text-danger px-3 py-1 fw-bold transition-all hover-shadow"
                    style={{ fontSize: '0.75rem' }}
                    onClick={() => handleViewPDF(receipt)}
                  >
                    <Download size={14} className="me-1" /> PDF
                  </Button>
                </td>
                <td>
                  <div className="d-flex flex-column" style={{ lineHeight: 1.2 }}>
                    <span className="fw-bold text-enterprise" style={{ fontSize: '0.85rem' }}>
                      {receipt.creator_first_name} {receipt.creator_last_name}
                    </span>
                    <span className="text-muted mt-1" style={{ fontSize: '0.7rem' }}>
                      {receipt.creator_phone || '-'}
                    </span>
                  </div>
                </td>
                {isAdmin && (
                  <td className="text-end">
                    <Button
                      variant="link"
                      size="sm"
                      className="text-muted p-2 hover-bg-danger-subtle hover-text-danger transition-all rounded-3"
                      onClick={() => handleDelete(receipt.id, receipt.receipt_number)}
                    >
                      <Trash2 size={18} />
                    </Button>
                  </td>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <ConfirmDeleteModal
        show={showDeleteModal}
        onHide={() => {
          setShowDeleteModal(false)
          setDeleteTarget(null)
        }}
        onConfirm={confirmDelete}
        title="ลบข้อมูลใบเสร็จ"
        message="ยืนยันการลบข้อมูลถาวร? ข้อมูลนี้จะไม่สามารถกู้คืนกลับมาได้"
        itemName={deleteTarget?.receiptNumber}
      />
    </div>
  )
}

export default ReceiptTable