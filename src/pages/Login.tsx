import { useState } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { useAuth } from '@/auth/AuthContext'
import { validateChartMuseumAuth } from '@/api/chartmuseum'
import './Login.css'

export default function Login() {
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const { login } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const from = (location.state as { from?: { pathname: string } })?.from?.pathname ?? '/'

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    if (!username.trim() || !password) {
      setError('请输入账号和密码')
      return
    }
    setLoading(true)
    try {
      await validateChartMuseumAuth(username.trim(), password)
      login(username.trim(), password)
      navigate(from, { replace: true })
    } catch {
      setError('登录失败，请检查账号密码')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="login-page">
      <div className="login-card">
        <h1 className="login-title">Charts管理控制台</h1>
        <form onSubmit={handleSubmit} className="login-form">
          <label htmlFor="username" className="login-label">
            用户名
          </label>
          <input
            id="username"
            type="text"
            autoComplete="username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            className="login-input"
            placeholder="请输入用户名"
            disabled={loading}
          />
          <label htmlFor="password" className="login-label">
            密码
          </label>
          <input
            id="password"
            type="password"
            autoComplete="current-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="login-input"
            placeholder="请输入密码"
            disabled={loading}
          />
          {error && <p className="login-error" role="alert">{error}</p>}
          <button type="submit" className="btn btn-primary login-submit" disabled={loading}>
            {loading ? '登录中…' : '登录'}
          </button>
        </form>
        {/*<p className="login-footer">*/}
        {/*  <a href="/settings/Settings">配置 ChartMuseum 地址</a>*/}
        {/*</p>*/}
      </div>
    </div>
  )
}
