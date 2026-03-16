import { NavLink, Outlet, useNavigate } from 'react-router-dom'
import { useAuth } from '@/auth/AuthContext'
import './Layout.css'

export default function Layout() {
  const { logout } = useAuth()
  const navigate = useNavigate()

  const handleLogout = () => {
    logout()
    navigate('/login', { replace: true })
  }

  return (
    <div className="layout">
      <header className="layout-header">
        <div className="layout-brand">
          <span className="layout-logo" aria-hidden>◈</span>
          <h1 className="layout-title">ChartMuseum 管理控制台</h1>
        </div>
        <nav className="app-nav">
          <NavLink to="/" end>图表列表</NavLink>
          <NavLink to="/upload">上传图表</NavLink>
          <NavLink to="/settings">设置</NavLink>
          <button type="button" className="btn btn-outline btn-sm" onClick={handleLogout}>
            退出
          </button>
        </nav>
      </header>
      <main className="layout-main">
        <Outlet />
      </main>
    </div>
  )
}
