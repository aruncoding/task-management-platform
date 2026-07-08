import { createContext, useContext, useEffect, useState, useCallback } from 'react'
import { setAccessToken } from '../api/client'
import { registerRequest, loginRequest, refreshRequest, meRequest, logoutRequest } from '../services/auth.service'

const AuthContext = createContext(null)

export function AuthProvider ({ children }) {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  const clearSession = useCallback(() => {
    setAccessToken(null)
    setUser(null)
  }, [])

  useEffect(() => {
    // try to restore a session from the refresh cookie on first load
    async function bootstrap () {
      try {
        const { accessToken } = await refreshRequest()
        setAccessToken(accessToken)
        const { user } = await meRequest()
        setUser(user)
      } catch (err) {
        clearSession()
      } finally {
        setLoading(false)
      }
    }
    bootstrap()

    window.addEventListener('auth:logout', clearSession)
    return () => window.removeEventListener('auth:logout', clearSession)
  }, [clearSession])

  async function login (email, password) {
    const { accessToken, user } = await loginRequest(email, password)
    setAccessToken(accessToken)
    setUser(user)
  }

  async function register (name, email, password) {
    const { accessToken, user } = await registerRequest(name, email, password)
    setAccessToken(accessToken)
    setUser(user)
  }

  async function logout () {
    try {
      await logoutRequest()
    } catch (err) {
      // ignore - we're clearing local state regardless
    }
    clearSession()
  }

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth () {
  return useContext(AuthContext)
}
