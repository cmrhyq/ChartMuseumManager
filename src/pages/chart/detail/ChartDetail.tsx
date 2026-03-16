import { useEffect, useState, useCallback } from 'react'
import { useParams, Link } from 'react-router-dom'
import { useAuth } from '@/auth/AuthContext.tsx'
import { fetchChartDetail } from '@/api/chartmuseum.ts'
import type { ChartDetail as ChartDetailType } from '@/types/chartmuseum.ts'
import './ChartDetail.css'

export default function ChartDetail() {
  const { name, version } = useParams<{ name: string; version: string }>()
  const { token } = useAuth()
  const getToken = useCallback(() => token, [token])
  const [detail, setDetail] = useState<ChartDetailType | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!name || !version) return
    let cancelled = false
    setLoading(true)
    setError(null)
    fetchChartDetail(name, version, getToken)
      .then((data) => {
        if (!cancelled) setDetail(data)
      })
      .catch(() => {
        if (!cancelled) setError('加载失败，请稍后重试')
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })
    return () => {
      cancelled = true
    }
  }, [name, version, getToken])

  if (!name || !version) {
    return (
      <div className="page-card">
        <p className="text-secondary">缺少Chart名称或版本参数</p>
        <Link to="/">返回Chart列表</Link>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="page-card">
        <p className="text-secondary">加载中…</p>
      </div>
    )
  }

  if (error || !detail) {
    return (
      <div className="page-card card-error">
        <p className="text-secondary">{error ?? '未找到该Chart版本'}</p>
        <Link to="/">返回Chart列表</Link>
      </div>
    )
  }

  return (
    <div className="page-card chart-detail-card">
      <div className="card-header">
        <h2 className="card-title">
          {detail.name} <span className="chart-detail-version">{detail.version}</span>
        </h2>
        <Link to="/" className="btn btn-outline btn-sm">
          返回列表
        </Link>
      </div>
      <dl className="chart-detail-dl">
        {detail.description && (
          <>
            <dt>描述</dt>
            <dd>{detail.description}</dd>
          </>
        )}
        {detail.appVersion != null && detail.appVersion !== '' && (
          <>
            <dt>App 版本</dt>
            <dd>{detail.appVersion}</dd>
          </>
        )}
        {detail.apiVersion != null && detail.apiVersion !== '' && (
          <>
            <dt>API 版本</dt>
            <dd>{detail.apiVersion}</dd>
          </>
        )}
        {detail.maintainers != null && detail.maintainers.length > 0 && (
          <>
            <dt>维护者</dt>
            <dd>
              <ul className="chart-detail-list">
                {detail.maintainers.map((m, i) => (
                  <li key={i}>
                    {m.name}
                    {m.email ? ` (${m.email})` : ''}
                  </li>
                ))}
              </ul>
            </dd>
          </>
        )}
        {detail.urls != null && detail.urls.length > 0 && (
          <>
            <dt>下载链接</dt>
            <dd>
              <ul className="chart-detail-list">
                {detail.urls.map((u, i) => (
                  <li key={i}>
                    <a href={u} rel="noopener noreferrer" target="_blank">
                      {u}
                    </a>
                  </li>
                ))}
              </ul>
            </dd>
          </>
        )}
      </dl>
    </div>
  )
}
