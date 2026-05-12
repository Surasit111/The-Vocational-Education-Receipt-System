import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import { AuthProvider } from './contexts/AuthContext'
import ProtectedRoute from './components/ProtectedRoute'
import Navbar from './components/Navbar'
import LoginPage from './pages/LoginPage'
import RegisterPage from './pages/RegisterPage'
import FormPage from './pages/FormPage'
import StatisticsPage from './pages/StatisticsPage'
import CategoryPage from './pages/CategoryPage'
import UserManagePage from './pages/UserManagePage'
import './App.css'

function App() {
  return (
    <AuthProvider>
      <Toaster position="top-right" />
      <Router>
        <Routes>
          {/* Public Routes */}
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />

          {/* ⭐ หน้าฟอร์ม - ไม่ต้องล็อกอิน (Public) */}
          <Route
            path="/form"
            element={
              <div className="App">
                <Navbar />
                <FormPage />
              </div>
            }
          />

          {/* ⭐ เปลี่ยน default route เป็นหน้าฟอร์ม */}
          <Route path="/" element={<Navigate to="/form" replace />} />

          {/* ⭐ Protected Routes - ต้องล็อกอิน */}
          <Route
            path="/statistics"
            element={
              <ProtectedRoute>
                <div className="App">
                  <Navbar />
                  <StatisticsPage />
                </div>
              </ProtectedRoute>
            }
          />

          {/* ⭐ หน้าจัดการหมวดหมู่ - ต้องล็อกอิน */}
          <Route
            path="/categories"
            element={
              <ProtectedRoute>
                <div className="App">
                  <Navbar />
                  <CategoryPage />
                </div>
              </ProtectedRoute>
            }
          />

          {/* ⭐ หน้าจัดการผู้ใช้งาน - เฉพาะแอดมิน */}
          <Route
            path="/users"
            element={
              <ProtectedRoute adminOnly={true}>
                <div className="App">
                  <Navbar />
                  <UserManagePage />
                </div>
              </ProtectedRoute>
            }
          />
        </Routes>
      </Router>
    </AuthProvider>
  )
}

export default App