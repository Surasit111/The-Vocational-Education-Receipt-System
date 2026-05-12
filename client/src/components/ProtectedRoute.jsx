import { Navigate, useLocation } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { Spinner } from 'react-bootstrap'
import { useEffect, useState } from 'react'
import { toast } from 'react-hot-toast'

function ProtectedRoute({ children, adminOnly = false }) {
  const { isAuthenticated, isAdmin, loading, user } = useAuth()
  const location = useLocation()
  const [isReady, setIsReady] = useState(false)

  useEffect(() => {
    if (!loading) {
      setIsReady(true)
      if (!isAuthenticated()) {
        toast.error('กรุณาเข้าสู่ระบบก่อน', { id: 'auth-needed' })
      } else if (adminOnly && !isAdmin()) {
        toast.error('เฉพาะผู้ดูแลระบบเท่านั้น', { id: 'admin-needed' })
      }
    }
  }, [loading, isAuthenticated, isAdmin, adminOnly])

  if (loading || !isReady) {
    return (
      <div className="d-flex justify-content-center align-items-center bg-white" style={{ minHeight: '100vh', width: '100vw' }}>
        <div className="text-center">
          <Spinner animation="border" variant="primary" />
          <p className="mt-3 text-muted">กำลังตรวจสอบสิทธิ์...</p>
        </div>
      </div>
    )
  }

  if (!isAuthenticated()) {
    return <Navigate to="/login" state={{ from: location }} replace />
  }

  if (adminOnly && !isAdmin()) {
    return <Navigate to="/form" replace />
  }

  return children
}

export default ProtectedRoute