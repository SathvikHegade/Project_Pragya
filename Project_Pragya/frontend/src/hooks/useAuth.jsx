import React, { createContext, useContext, useState, useEffect, useCallback } from 'react'
import { authAPI } from '../utils/api'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    const token = localStorage.getItem('pragya_token')
    const savedUser = localStorage.getItem('pragya_user')
    if (token && savedUser) {
      try {
        setUser(JSON.parse(savedUser))
      } catch {
        localStorage.removeItem('pragya_token')
        localStorage.removeItem('pragya_user')
      }
    }
    setLoading(false)
  }, [])

  const login = useCallback(async (email, password) => {
    setError(null)
    try {
      const data = await authAPI.login(email, password)
      localStorage.setItem('pragya_token', data.access_token)
      localStorage.setItem('pragya_user', JSON.stringify(data.user))
      setUser(data.user)
      return data.user
    } catch (err) {
      setError(err.message)
      throw err
    }
  }, [])

  const register = useCallback(async (payload) => {
    setError(null)
    try {
      const data = await authAPI.register(payload)
      localStorage.setItem('pragya_token', data.access_token)
      localStorage.setItem('pragya_user', JSON.stringify(data.user))
      setUser(data.user)
      return data.user
    } catch (err) {
      setError(err.message)
      throw err
    }
  }, [])

  const logout = useCallback(() => {
    localStorage.removeItem('pragya_token')
    localStorage.removeItem('pragya_user')
    setUser(null)
  }, [])

  const value = { user, loading, error, login, register, logout, isAuthenticated: !!user }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}
