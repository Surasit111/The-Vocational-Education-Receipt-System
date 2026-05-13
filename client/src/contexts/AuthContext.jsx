// contexts/AuthContext.jsx
import { createContext, useContext, useState, useEffect } from 'react'
import { authService } from '../services/authService'

const AuthContext = createContext()

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider')
  }
  return context
}

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const [token, setToken] = useState(localStorage.getItem('token'))

  // ตรวจสอบ authentication เมื่อ app โหลด
  useEffect(() => {
    const checkAuth = async () => {
      const storedToken = localStorage.getItem('token')
      
      if (storedToken) {
        try {
          const userData = await authService.getMe(storedToken)
          setUser(userData)
          setToken(storedToken)
        } catch (error) {
          console.error('Auth check failed:', error)
          localStorage.removeItem('token')
          setToken(null)
          setUser(null)
        }
      }
      
      setLoading(false)
    }

    checkAuth()
  }, [])

  // Login
  const login = async (email, password) => {
    try {
      const response = await authService.login(email, password)
      setUser(response.user)
      setToken(response.token)
      localStorage.setItem('token', response.token)
      return response
    } catch (error) {
      throw error
    }
  }

  // Register
  const register = async (userData) => {
    try {
      const response = await authService.register(userData)
      setUser(response.user)
      setToken(response.token)
      localStorage.setItem('token', response.token)
      return response
    } catch (error) {
      throw error
    }
  }

  // Logout
  const logout = () => {
    setUser(null)
    setToken(null)
    localStorage.removeItem('token')
    authService.logout()
  }

  // ตรวจสอบว่าเป็น admin
  const isAdmin = () => {
    return user?.role === 'admin'
  }

  // ตรวจสอบว่า login แล้ว
  const isAuthenticated = () => {
    return !!user && !!token
  }

  // ดึงชื่อระดับผู้ใช้งาน
  const getRoleLabel = (u = user) => {
    if (!u) return 'ผู้ใช้ทั่วไป'
    if (u.is_primary) return 'ผู้ดูแลระบบสูงสุด'
    if (u.role === 'admin') return 'ผู้ดูแลระบบ'
    return 'ผู้ใช้ทั่วไป'
  }

  const value = {
    user,
    token,
    loading,
    login,
    register,
    logout,
    isAdmin,
    isAuthenticated,
    getRoleLabel
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}