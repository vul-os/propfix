import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react'
import { authApi, ApiError } from './api'

const AuthContext = createContext(null)

// status: 'loading' | 'anonymous' | 'authenticated'
export function AuthProvider({ children }) {
  const [status, setStatus] = useState('loading')
  const [user, setUser] = useState(null)
  const [org, setOrg] = useState(null)

  const refresh = useCallback(async () => {
    try {
      const data = await authApi.me()
      setUser(data.user)
      setOrg(data.organisation)
      setStatus('authenticated')
    } catch {
      setUser(null)
      setOrg(null)
      setStatus('anonymous')
    }
  }, [])

  useEffect(() => {
    refresh()
  }, [refresh])

  const login = useCallback(async (email, password) => {
    const data = await authApi.login({ email, password })
    setUser(data.user)
    setStatus('authenticated')
    // /auth/login does not return the organisation, only the user + token;
    // fetch it so the shell has an org name to show immediately.
    await refresh()
    return data
  }, [refresh])

  const register = useCallback(async ({ organisation, email, password, name }) => {
    try {
      const data = await authApi.register({ organisation, email, password, name })
      setUser(data.user)
      setStatus('authenticated')
      await refresh()
      return data
    } catch (err) {
      if (err instanceof ApiError && err.status === 403) {
        // "registration is closed on this node" — a first-run-only state,
        // not a generic failure. Let the caller render it distinctly.
        throw Object.assign(err, { registrationClosed: true })
      }
      throw err
    }
  }, [refresh])

  const logout = useCallback(async () => {
    try {
      await authApi.logout()
    } finally {
      setUser(null)
      setOrg(null)
      setStatus('anonymous')
    }
  }, [])

  const value = useMemo(
    () => ({ status, user, org, login, register, logout, refresh }),
    [status, user, org, login, register, logout, refresh],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}
