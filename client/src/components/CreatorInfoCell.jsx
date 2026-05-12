// components/CreatorInfoCell.jsx
import { Badge } from 'react-bootstrap'

function CreatorInfoCell({ creator }) {
  // ถ้าไม่มีข้อมูลผู้สร้าง
  if (!creator?.first_name) {
    return (
      <div className="text-muted small">
        <div>ไม่ระบุผู้สร้าง</div>
      </div>
    )
  }

  return (
    <div className="small">
      {/* ชื่อ-นามสกุล */}
      <div className="fw-bold text-dark mb-1">
        {creator.first_name} {creator.last_name}
      </div>
      
      {/* Badge สถานะ */}
      <div className="mb-1">
        {creator.role === 'admin' ? (
          <Badge bg="warning" text="dark">
            🎖️ ผู้ดูแลระบบ
          </Badge>
        ) : (
          <Badge bg="primary">
            👤 ผู้ใช้งาน
          </Badge>
        )}
      </div>
      
      {/* เบอร์โทร */}
      <div className="text-primary mb-1">
        📱 {creator.phone || 'ไม่ระบุ'}
      </div>
      
      {/* อีเมล */}
      <div className="text-muted" style={{ fontSize: '0.75rem', wordBreak: 'break-word' }}>
        📧 {creator.email}
      </div>
    </div>
  )
}

export default CreatorInfoCell