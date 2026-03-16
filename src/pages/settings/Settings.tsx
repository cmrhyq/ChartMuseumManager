import { useState, useEffect, useCallback } from 'react'
import { Link } from 'react-router-dom'
import { getApiBase, setApiBase } from '@/config.ts'
import { useAuth } from '@/auth/AuthContext.tsx'
import { healthCheck, fetchCharts } from '@/api/chartmuseum.ts'
import './Settings.css'

export default function Settings() {
  const { isAuthenticated, token } = useAuth()
  const getToken = useCallback(() => token, [token])
  const [base, setBase] = useState('')
  const [saved, setSaved] = useState(false)
  const [checking, setChecking] = useState(false)
  const [health, setHealth] = useState<'ok' | 'fail' | null>(null)

  useEffect(() => {
    setBase(getApiBase())
  }, [])

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault()
    setApiBase(base)
    setSaved(true)
    setHealth(null)
    setTimeout(() => setSaved(false), 2000)
  }

  const handleTest = async () => {
    setChecking(true)
    setHealth(null)
    try {
      if (isAuthenticated && token) {
        await fetchCharts(getToken)
      } else {
        await healthCheck()
      }
      setHealth('ok')
    } catch {
      setHealth('fail')
    } finally {
      setChecking(false)
    }
  }

  return (
    <div className="page-card settings-card">
      {isAuthenticated && (
        <p className="settings-back">
          <Link to="/">← 返回控制台</Link>
        </p>
      )}
      <h2 className="card-title">设置</h2>
      <p className="text-secondary settings-desc">
        配置 ChartMuseum 服务地址。当 ChartMuseum 部署在 K8s 中时，请填写其 Ingress 或
        Service 的访问地址（例如 https://chartmuseum.example.com）。生产环境请使用 HTTPS。
      </p>
      <form onSubmit={handleSave} className="settings-form">
        <label htmlFor="api-base" className="settings-label">
          ChartMuseum API 根地址
        </label>
        <input
          id="api-base"
          type="url"
          value={base}
          onChange={(e) => setBase(e.target.value)}
          placeholder="https://your-chartmuseum.example.com"
          className="settings-input"
          autoComplete="url"
        />
        <div className="settings-actions">
          <button type="submit" className="btn btn-primary">
            保存
          </button>
          <button
            type="button"
            className="btn btn-outline"
            onClick={handleTest}
            disabled={checking}
          >
            {checking ? '检测中…' : '检测连接'}
          </button>
        </div>
        {saved && <p className="settings-msg settings-msg-success">已保存</p>}
        {health === 'ok' && (
          <p className="settings-msg settings-msg-success">连接正常</p>
        )}
        {health === 'fail' && (
          <p className="settings-msg settings-msg-error">
            连接失败，请检查地址与网络（若跨域需在 ChartMuseum 侧配置 CORS）
          </p>
        )}
      </form>
    </div>
  )
}
