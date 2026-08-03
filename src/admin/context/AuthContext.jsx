import { createContext, useContext, useState, useEffect, useCallback } from 'react'
import { authApi } from '../../lib/adminApi.js'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true) // initial /me check

  const refresh = useCallback(async () => {
    const res = await authApi.me()
    if (res.ok) setUser(res.data.data)
    else setUser(null)
    setLoading(false)
    return res.ok
  }, [])

  useEffect(() => { refresh() }, [refresh])

  const login = useCallback(async (email_or_username, password) => {
    // Login endpoint is CSRF-exempt (see bootstrap/app.php). The session cookie
    // is set by the server on success and used by all subsequent admin calls.
    const res = await authApi.login(email_or_username, password)
    if (res.ok) setUser(res.data.data)
    return res
  }, [])

  const logout = useCallback(async () => {
    await authApi.logout()
    setUser(null)
  }, [])

  return (
    <AuthContext.Provider value={{ user, loading, login, logout, refresh }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used inside <AuthProvider>')
  return ctx
}
