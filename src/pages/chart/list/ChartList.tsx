import { useEffect, useState, useCallback } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '@/auth/AuthContext.tsx'
import { fetchCharts, deleteChart } from '@/api/chartmuseum.ts'
import type { ChartsMap, ChartVersion } from '@/types/chartmuseum.ts'
import './ChartList.css'

function ChartTableRow({
  name,
  version,
  onDelete,
  getToken,
}: {
  name: string
  version: ChartVersion
  onDelete: () => void
  getToken: () => string | null
}) {
  const [deleting, setDeleting] = useState(false)
  const handleDelete = async () => {
    if (!window.confirm(`确定要删除 ${name} @ ${version.version} 吗？`)) return
    setDeleting(true)
    try {
      await deleteChart(name, version.version, getToken)
      onDelete()
    } catch {
      alert('删除失败，请稍后重试')
    } finally {
      setDeleting(false)
    }
  }

  return (
    <tr>
      <td className="chart-name">
        <Link to={`/charts/${encodeURIComponent(name)}/${encodeURIComponent(version.version)}`}>
          {name}
        </Link>
      </td>
      <td className="chart-version">{version.version}</td>
      <td className="chart-meta">{version.appVersion ?? '—'}</td>
      <td className="chart-meta">{version.description ?? '—'}</td>
      <td>
        <button
          type="button"
          className="btn btn-danger btn-sm"
          onClick={handleDelete}
          disabled={deleting}
        >
          {deleting ? '删除中…' : '删除'}
        </button>
      </td>
    </tr>
  )
}

export default function ChartList() {
  const { token } = useAuth()
  const getToken = useCallback(() => token, [token])
  const [charts, setCharts] = useState<ChartsMap | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [search, setSearch] = useState('')

  const load = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const data = await fetchCharts(getToken)
      setCharts(data)
    } catch {
      setError('无法连接 ChartMuseum，请检查设置中的 API 地址与网络')
      setCharts(null)
    } finally {
      setLoading(false)
    }
  }, [getToken])

  useEffect(() => {
    load()
  }, [load])

  if (loading) {
    return (
      <div className="page-card">
        <p className="text-secondary">加载中…</p>
      </div>
    )
  }

  if (error) {
    return (
      <div className="page-card card-error">
        <h2 className="card-title">无法连接 ChartMuseum</h2>
        <p className="text-secondary">{error}</p>
        <p className="text-secondary">
          请在 <Link to="/settings">设置</Link> 中配置正确的 API 地址（例如 K8s Ingress 或 Service URL）。
        </p>
        <button type="button" className="btn btn-primary" onClick={load}>
          重试
        </button>
      </div>
    )
  }

  const entries = charts ? Object.entries(charts) : []
  const totalVersions = entries.reduce((acc, [, versions]) => acc + versions.length, 0)
  const searchLower = search.trim().toLowerCase()
  const filteredEntries = searchLower
    ? entries.filter(([name]) => name.toLowerCase().includes(searchLower))
    : entries

  return (
    <div className="page-card">
      <div className="card-header">
        <h2 className="card-title">Chart列表</h2>
        <span className="text-secondary">
          {entries.length} 个Chart，共 {totalVersions} 个版本
        </span>
      </div>
      {entries.length > 0 && (
        <div className="chart-list-search">
          <input
            type="search"
            placeholder="按Chart名称筛选"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="search-input"
            aria-label="按Chart名称筛选"
          />
        </div>
      )}
      {filteredEntries.length === 0 ? (
        <p className="text-secondary">
          {entries.length === 0 ? (
          <>
            暂无Chart。请前往 <Link to="/upload">上传Chart</Link> 添加。
          </>
        ) : (
          '没有匹配的Chart名称'
        )}
        </p>
      ) : (
        <div className="table-wrap">
          <table className="chart-table">
            <thead>
              <tr>
                <th>Chart名称</th>
                <th>版本</th>
                <th>App 版本</th>
                <th>描述</th>
                <th>操作</th>
              </tr>
            </thead>
            <tbody>
              {filteredEntries.flatMap(([name, versions]) =>
                versions.map((v) => (
                  <ChartTableRow
                    key={`${name}-${v.version}`}
                    name={name}
                    version={v}
                    onDelete={load}
                    getToken={getToken}
                  />
                )),
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
