// components/ConfirmDeleteModal.jsx
import { Modal, Button } from 'react-bootstrap'

function ConfirmDeleteModal({ show, onHide, onConfirm, title, message, itemName }) {
  return (
    <Modal show={show} onHide={onHide} centered>
      <Modal.Header closeButton className="border-0">
        <Modal.Title>
          <span style={{ fontSize: '2rem' }}>⚠️</span>
        </Modal.Title>
      </Modal.Header>
      <Modal.Body className="text-center pb-4">
        <h5 className="mb-3">{title || 'ยืนยันการลบ'}</h5>
        <p className="text-muted mb-2">
          {message || 'คุณแน่ใจหรือไม่ที่จะลบรายการนี้?'}
        </p>
        {itemName && (
          <div className="alert alert-danger d-inline-block px-4 py-2">
            <strong>{itemName}</strong>
          </div>
        )}
        <p className="text-danger mt-3 mb-0">
          <small>⚠️ การลบจะไม่สามารถกู้คืนได้</small>
        </p>
      </Modal.Body>
      <Modal.Footer className="border-0 justify-content-center">
        <Button variant="secondary" onClick={onHide}>
          ❌ ยกเลิก
        </Button>
        <Button variant="danger" onClick={onConfirm}>
          🗑️ ยืนยันการลบ
        </Button>
      </Modal.Footer>
    </Modal>
  )
}

export default ConfirmDeleteModal