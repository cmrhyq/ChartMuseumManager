import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react'

const SESSION_KEY = 'chartmuseum-basic-auth'

/** 仅存 Base64 令牌于 sessionStorage，不存明文密码；刷新即失效 */
function getStoredToken(): string | null {
  try {
    return sessionStorage.getItem(SESSION_KEY)
  } catch {
    return null
  }
}

function setStoredToken(token: string | null): void {
  try {
    if (token) {
      sessionStorage.setItem(SESSION_KEY, token)
    } else {
      sessionStorage.removeItem(SESSION_KEY)
    }
  } catch {
    // ignore
  }
}

interface AuthState {
  isAuthenticated: boolean
  /** 当前 Basic 令牌（不含 "Basic " 前缀），供 API 客户端使用 */
  token: string | null
  login: (username: string, password: string) => Promise<void>
  logout: () => void
  setToken: (token: string | null) => void
}

const AuthContext = createContext<AuthState | null>(null)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [token, setTokenState] = useState<string | null>(() => getStoredToken())

  useEffect(() => {
    const t = getStoredToken()
    setTokenState(t)
  }, [])

  const setToken = useCallback((t: string | null) => {
    setTokenState(t)
    setStoredToken(t)
  }, [])

  const login = useCallback(async (username: string, password: string) => {
    const encoded = btoa(unescape(encodeURIComponent(`${username}:${password}`)))
    setStoredToken(encoded)
    setTokenState(encoded)
  }, [])

  const logout = useCallback(() => {
    setTokenState(null)
    setStoredToken(null)
  }, [])

  const isAuthenticated = !!token

  const value = useMemo<AuthState>(
    () => ({
      isAuthenticated,
      token,
      login,
      logout,
      setToken,
    }),
    [isAuthenticated, token, login, logout, setToken],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth(): AuthState {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}
