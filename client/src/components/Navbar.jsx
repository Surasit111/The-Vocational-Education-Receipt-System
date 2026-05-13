import { useState } from 'react'
import { Navbar, Container, Nav, Button, Dropdown } from 'react-bootstrap'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { LogOut, User, LayoutDashboard, FilePlus, ChevronDown, Users, PhoneCall, UserCircle, Settings2 } from 'lucide-react'

// Import Modals
import ContactModal from './ContactModal'
import ProfileModal from './ProfileModal'

function AppNavbar() {
  const { user, logout, isAdmin, loading, getRoleLabel } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()

  // Modal States
  const [showContact, setShowContact] = useState(false)
  const [showProfile, setShowProfile] = useState(false)

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  const isActive = (path) => location.pathname === path

  // ถ้ากำลังโหลดข้อมูล Auth ไม่ต้องแสดงอะไรที่เกี่ยวกับ User
  const showAdminMenu = !loading && user && typeof isAdmin === 'function' && isAdmin()

  return (
    <>
      <Navbar expand="lg" className="navbar sticky-top shadow-sm">
        <Container>
          <Navbar.Brand as={Link} to="/" className="d-flex align-items-center gap-2 py-0">
            <div className="bg-primary rounded-3 p-1 d-flex align-items-center justify-content-center shadow-premium">
              <LayoutDashboard size={20} className="text-white" />
            </div>
            <span className="fs-5 mb-0 text-enterprise">GSW <span className="fw-light text-muted">Receipt</span></span>
          </Navbar.Brand>

          <Navbar.Toggle aria-controls="basic-navbar-nav" className="border-0 shadow-none p-0" />

          <Navbar.Collapse id="basic-navbar-nav">
            <Nav className="mx-auto gap-1 py-3 py-lg-0">
              <Nav.Link 
                as={Link} 
                to="/form" 
                className={`px-3 py-2 rounded-3 small fw-semibold transition-all d-flex align-items-center ${isActive('/form') ? 'text-primary bg-primary-soft' : 'text-muted hover-bg-light'}`}
              >
                <FilePlus size={16} className="me-2" /> สร้างใบเสร็จ
              </Nav.Link>
              <Nav.Link 
                as={Link} 
                to="/statistics" 
                className={`px-3 py-2 rounded-3 small fw-semibold transition-all d-flex align-items-center ${isActive('/statistics') ? 'text-primary bg-primary-soft' : 'text-muted hover-bg-light'}`}
              >
                <LayoutDashboard size={16} className="me-2" /> รายงานสรุป
              </Nav.Link>

              {user && (
                <Nav.Link 
                  as={Link} 
                  to="/categories"
                  className={`px-3 py-2 rounded-3 small fw-semibold transition-all d-flex align-items-center ${isActive('/categories') ? 'text-primary bg-primary-soft' : 'text-muted hover-bg-light'}`}
                >
                  <Settings2 size={16} className="me-2" /> จัดการหมวดหมู่
                </Nav.Link>
              )}

              {showAdminMenu && (
                <Nav.Link 
                  as={Link} 
                  to="/users"
                  className={`px-3 py-2 rounded-3 small fw-semibold transition-all d-flex align-items-center ${isActive('/users') ? 'text-info bg-info-soft' : 'text-muted hover-bg-light'}`}
                  style={isActive('/users') ? { backgroundColor: 'rgba(13, 202, 240, 0.1)' } : {}}
                >
                  <Users size={16} className="me-2" /> จัดการผู้ใช้งาน
                </Nav.Link>
              )}

              <Nav.Link 
                onClick={() => setShowContact(true)}
                className="px-3 py-2 rounded-3 small fw-semibold text-muted hover-bg-light cursor-pointer d-flex align-items-center"
              >
                <PhoneCall size={16} className="me-2" /> ติดต่อเรา
              </Nav.Link>

              {/* เมนูสำหรับมือถือ (แสดงเฉพาะเมื่อหน้าจอเล็ก) */}
              {user && (
                <div className="d-lg-none mt-3 pt-3 border-top">
                  <div className="px-3 mb-3">
                    <div className="fw-bold text-enterprise small">{user?.first_name} {user?.last_name}</div>
                    <div className="text-muted" style={{ fontSize: '0.7rem' }}>{getRoleLabel()}</div>
                  </div>
                  <Nav.Link 
                    onClick={() => setShowProfile(true)}
                    className="px-3 py-2 rounded-3 small fw-semibold text-muted hover-bg-light d-flex align-items-center"
                  >
                    <UserCircle size={16} className="me-2" /> โปรไฟล์ของฉัน
                  </Nav.Link>
                  <Nav.Link 
                    onClick={handleLogout}
                    className="px-3 py-2 rounded-3 small fw-semibold text-danger hover-bg-danger-subtle d-flex align-items-center"
                  >
                    <LogOut size={16} className="me-2" /> ออกจากระบบ
                  </Nav.Link>
                </div>
              )}
            </Nav>

            <Nav className="align-items-center gap-3 d-none d-lg-flex">
              {user ? (
                <Dropdown align="end">
                  <Dropdown.Toggle 
                    variant="link" 
                    className="text-decoration-none p-2 border rounded-3 shadow-none d-flex align-items-center gap-2 bg-light-subtle hover-bg-light transition-all"
                  >
                    <div className="text-end d-none d-sm-block ps-1" style={{ lineHeight: 1.3 }}>
                      <div className="fw-bold text-enterprise small mb-1">{user?.first_name} {user?.last_name}</div>
                      <div className="text-muted small" style={{ fontSize: '0.65rem' }}>{getRoleLabel()}</div>
                    </div>
                    <ChevronDown size={14} className="text-muted me-1" />
                  </Dropdown.Toggle>

                  <Dropdown.Menu className="border-0 shadow-lg rounded-4 mt-2 py-2 p-2" style={{ minWidth: '240px' }}>
                    <Dropdown.Item onClick={() => setShowProfile(true)} className="rounded-3 d-flex align-items-center gap-2 py-2 mb-2 border hover-bg-light transition-all bg-light-subtle">
                      <div>
                        <div className="small fw-bold">โปรไฟล์ของฉัน</div>
                        <div className="text-muted" style={{ fontSize: '0.65rem' }}>จัดการข้อมูลส่วนตัว</div>
                      </div>
                    </Dropdown.Item>

                    <Dropdown.Item onClick={handleLogout} className="rounded-3 text-danger d-flex align-items-center gap-2 py-2 border border-danger-subtle transition-all" style={{ backgroundColor: 'rgba(239, 71, 111, 0.05)' }}>
                      <div className="bg-danger-soft p-1 rounded-2" style={{ backgroundColor: 'rgba(239, 71, 111, 0.1)' }}><LogOut size={16} /></div>
                      <span className="small fw-bold">ออกจากระบบ</span>
                    </Dropdown.Item>
                  </Dropdown.Menu>
                </Dropdown>
              ) : (
                <Button 
                  as={Link} 
                  to="/login" 
                  variant="primary" 
                  size="sm" 
                  className="px-4 py-2 rounded-pill shadow-premium fw-bold"
                >
                  เข้าสู่ระบบ
                </Button>
              )}
            </Nav>
          </Navbar.Collapse>
        </Container>
      </Navbar>

      <ContactModal show={showContact} onHide={() => setShowContact(false)} />
      <ProfileModal show={showProfile} onHide={() => setShowProfile(false)} />
    </>
  )
}

export default AppNavbar