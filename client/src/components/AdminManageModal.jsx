// components/AdminManageModal.jsx
import { useState, useEffect } from 'react'
import { Modal, Button, Form, ListGroup, Badge, Spinner } from 'react-bootstrap'
import { toast } from 'react-hot-toast'
import { adminService } from '../services/adminService'
import ConfirmDeleteModal from './ConfirmDeleteModal'

function AdminManageModal({ show, onHide }) {
    const [admins, setAdmins] = useState([])
    const [loading, setLoading] = useState(false)

    // Form state
    const [showAddForm, setShowAddForm] = useState(false)
    const [editingId, setEditingId] = useState(null)
    const [formData, setFormData] = useState({
        email: '',
        password: '',
        first_name: '',
        last_name: '',
        phone: ''
    })

    // Delete modal state
    const [showDeleteModal, setShowDeleteModal] = useState(false)
    const [deleteTarget, setDeleteTarget] = useState(null)

    useEffect(() => {
        if (show) {
            fetchAdmins()
        }
    }, [show])

    const fetchAdmins = async () => {
        setLoading(true)
        try {
            const response = await adminService.getAll()
            setAdmins(response.data)
        } catch (error) {
            toast.error(error.message)
        } finally {
            setLoading(false)
        }
    }

    const resetForm = () => {
        setFormData({
            email: '',
            password: '',
            first_name: '',
            last_name: '',
            phone: ''
        })
    }

    const handleAdd = async (e) => {
        e.preventDefault()
        if (!formData.email || !formData.password || !formData.first_name || !formData.last_name) {
            toast.error('กรุณากรอกข้อมูลที่จำเป็นให้ครบ')
            return
        }

        try {
            await adminService.create(formData)
            toast.success('เพิ่มผู้ใช้สำเร็จ')
            resetForm()
            setShowAddForm(false)
            fetchAdmins()
        } catch (error) {
            toast.error(error.message)
        }
    }

    const handleEdit = async (e) => {
        e.preventDefault()
        if (!formData.first_name || !formData.last_name) {
            toast.error('กรุณากรอกชื่อและนามสกุล')
            return
        }

        try {
            await adminService.update(editingId, {
                first_name: formData.first_name,
                last_name: formData.last_name,
                phone: formData.phone,
                email: formData.email
            })
            toast.success('แก้ไขผู้ใช้สำเร็จ')
            resetForm()
            setEditingId(null)
            fetchAdmins()
        } catch (error) {
            toast.error(error.message)
        }
    }

    const handleDelete = (admin) => {
        setDeleteTarget(admin)
        setShowDeleteModal(true)
    }

    const confirmDelete = async () => {
        if (!deleteTarget) return

        try {
            await adminService.delete(deleteTarget.id)
            toast.success('ลบผู้ใช้สำเร็จ (เปลี่ยนเป็นผู้ใช้ปกติ)')
            setShowDeleteModal(false)
            setDeleteTarget(null)
            fetchAdmins()
        } catch (error) {
            toast.error(error.message)
        }
    }

    const startEdit = (admin) => {
        setEditingId(admin.id)
        setFormData({
            email: admin.email,
            password: '',
            first_name: admin.first_name,
            last_name: admin.last_name,
            phone: admin.phone || ''
        })
        setShowAddForm(false)
    }

    const cancelEdit = () => {
        setEditingId(null)
        resetForm()
    }

    return (
        <>
            <Modal show={show} onHide={onHide} size="lg" centered>
                <Modal.Header closeButton>
                    <Modal.Title>👥 จัดการผู้ใช้</Modal.Title>
                </Modal.Header>
                <Modal.Body style={{ maxHeight: '70vh', overflowY: 'auto' }}>
                    {loading ? (
                        <div className="text-center py-5">
                            <Spinner animation="border" variant="primary" />
                            <p className="mt-2">กำลังโหลดข้อมูล...</p>
                        </div>
                    ) : (
                        <>
                            {/* Header with Add button */}
                            <div className="d-flex justify-content-between align-items-center mb-3">
                                <h6 className="mb-0">
                                    🛡️ รายชื่อผู้ใช้
                                    <Badge bg="secondary" className="ms-2">{admins.length}</Badge>
                                </h6>
                                <Button
                                    size="sm"
                                    variant="primary"
                                    onClick={() => {
                                        setShowAddForm(true)
                                        setEditingId(null)
                                        resetForm()
                                    }}
                                >
                                    ➕ เพิ่มผู้ใช้
                                </Button>
                            </div>

                            {/* Add Form */}
                            {showAddForm && (
                                <div className="border rounded p-3 mb-3 bg-light">
                                    <h6 className="mb-3">เพิ่มผู้ใช้ใหม่</h6>
                                    <Form onSubmit={handleAdd}>
                                        <div className="row">
                                            <div className="col-md-6">
                                                <Form.Group className="mb-2">
                                                    <Form.Label>อีเมล <span className="text-danger">*</span></Form.Label>
                                                    <Form.Control
                                                        type="email"
                                                        value={formData.email}
                                                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                                        placeholder="example@lru.ac.th"
                                                        required
                                                    />
                                                </Form.Group>
                                            </div>
                                            <div className="col-md-6">
                                                <Form.Group className="mb-2">
                                                    <Form.Label>รหัสผ่าน <span className="text-danger">*</span></Form.Label>
                                                    <Form.Control
                                                        type="password"
                                                        value={formData.password}
                                                        onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                                                        placeholder="กรอกรหัสผ่าน"
                                                        required
                                                    />
                                                </Form.Group>
                                            </div>
                                        </div>
                                        <div className="row">
                                            <div className="col-md-4">
                                                <Form.Group className="mb-2">
                                                    <Form.Label>ชื่อ <span className="text-danger">*</span></Form.Label>
                                                    <Form.Control
                                                        type="text"
                                                        value={formData.first_name}
                                                        onChange={(e) => setFormData({ ...formData, first_name: e.target.value })}
                                                        placeholder="ชื่อ"
                                                        required
                                                    />
                                                </Form.Group>
                                            </div>
                                            <div className="col-md-4">
                                                <Form.Group className="mb-2">
                                                    <Form.Label>นามสกุล <span className="text-danger">*</span></Form.Label>
                                                    <Form.Control
                                                        type="text"
                                                        value={formData.last_name}
                                                        onChange={(e) => setFormData({ ...formData, last_name: e.target.value })}
                                                        placeholder="นามสกุล"
                                                        required
                                                    />
                                                </Form.Group>
                                            </div>
                                            <div className="col-md-4">
                                                <Form.Group className="mb-2">
                                                    <Form.Label>เบอร์โทร</Form.Label>
                                                    <Form.Control
                                                        type="text"
                                                        value={formData.phone}
                                                        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                                                        placeholder="เบอร์โทร (ไม่บังคับ)"
                                                    />
                                                </Form.Group>
                                            </div>
                                        </div>
                                        <div className="d-flex gap-2 mt-2">
                                            <Button size="sm" type="submit" variant="success">
                                                ✅ บันทึก
                                            </Button>
                                            <Button
                                                size="sm"
                                                variant="secondary"
                                                onClick={() => {
                                                    setShowAddForm(false)
                                                    resetForm()
                                                }}
                                            >
                                                ยกเลิก
                                            </Button>
                                        </div>
                                    </Form>
                                </div>
                            )}

                            {/* Admin List */}
                            <ListGroup>
                                {admins.length === 0 ? (
                                    <ListGroup.Item className="text-center text-muted">
                                        ไม่มีข้อมูลผู้ใช้
                                    </ListGroup.Item>
                                ) : (
                                    admins.map((admin) => (
                                        <ListGroup.Item key={admin.id}>
                                            {editingId === admin.id ? (
                                                // Edit Form (inline)
                                                <Form onSubmit={handleEdit}>
                                                    <div className="row align-items-end">
                                                        <div className="col-md-3">
                                                            <Form.Group className="mb-2">
                                                                <Form.Label className="small">ชื่อ</Form.Label>
                                                                <Form.Control
                                                                    size="sm"
                                                                    type="text"
                                                                    value={formData.first_name}
                                                                    onChange={(e) => setFormData({ ...formData, first_name: e.target.value })}
                                                                    required
                                                                />
                                                            </Form.Group>
                                                        </div>
                                                        <div className="col-md-3">
                                                            <Form.Group className="mb-2">
                                                                <Form.Label className="small">นามสกุล</Form.Label>
                                                                <Form.Control
                                                                    size="sm"
                                                                    type="text"
                                                                    value={formData.last_name}
                                                                    onChange={(e) => setFormData({ ...formData, last_name: e.target.value })}
                                                                    required
                                                                />
                                                            </Form.Group>
                                                        </div>
                                                        <div className="col-md-2">
                                                            <Form.Group className="mb-2">
                                                                <Form.Label className="small">โทร</Form.Label>
                                                                <Form.Control
                                                                    size="sm"
                                                                    type="text"
                                                                    value={formData.phone}
                                                                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                                                                />
                                                            </Form.Group>
                                                        </div>
                                                        <div className="col-md-4 mb-2">
                                                            <div className="d-flex gap-1">
                                                                <Button size="sm" type="submit" variant="success">💾</Button>
                                                                <Button size="sm" variant="secondary" onClick={cancelEdit}>❌</Button>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </Form>
                                            ) : (
                                                // Display
                                                <div className="d-flex justify-content-between align-items-center">
                                                    <div>
                                                        <strong>{admin.first_name} {admin.last_name}</strong>
                                                        {admin.is_primary && (
                                                            <Badge bg="warning" text="dark" className="ms-2">🛡️ ผู้ใช้หลัก</Badge>
                                                        )}
                                                        <br />
                                                        <small className="text-muted">
                                                            📧 {admin.email}
                                                            {admin.phone && <span className="ms-3">📱 {admin.phone}</span>}
                                                        </small>
                                                    </div>
                                                    <div className="d-flex gap-2">
                                                        {!admin.is_primary && (
                                                            <>
                                                                <Button
                                                                    size="sm"
                                                                    variant="outline-primary"
                                                                    onClick={() => startEdit(admin)}
                                                                >
                                                                    ✏️ แก้ไข
                                                                </Button>
                                                                <Button
                                                                    size="sm"
                                                                    variant="outline-danger"
                                                                    onClick={() => handleDelete(admin)}
                                                                >
                                                                    🗑️ ลบ
                                                                </Button>
                                                            </>
                                                        )}
                                                    </div>
                                                </div>
                                            )}
                                        </ListGroup.Item>
                                    ))
                                )}
                            </ListGroup>

                            <div className="alert alert-info mt-3">
                                <small>
                                    ℹ️ <strong>หมายเหตุ:</strong> การลบผู้ใช้จะเปลี่ยนสถานะเป็นผู้ใช้ปกติ
                                    ผู้ใช้หลัก (คนแรก) ไม่สามารถแก้ไขหรือลบได้
                                </small>
                            </div>
                        </>
                    )}
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={onHide}>
                        ปิด
                    </Button>
                </Modal.Footer>
            </Modal>

            {/* Confirm Delete Modal */}
            <ConfirmDeleteModal
                show={showDeleteModal}
                onHide={() => {
                    setShowDeleteModal(false)
                    setDeleteTarget(null)
                }}
                onConfirm={confirmDelete}
                title="ยืนยันการลบผู้ใช้"
                message="ผู้ใช้คนนี้จะถูกเปลี่ยนเป็นผู้ใช้ปกติ"
                itemName={deleteTarget ? `${deleteTarget.first_name} ${deleteTarget.last_name}` : ''}
            />
        </>
    )
}

export default AdminManageModal
