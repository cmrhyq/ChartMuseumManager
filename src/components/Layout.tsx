import { NavLink, Outlet, useNavigate } from 'react-router-dom'
import { Layout as AntLayout, Menu, Button, Typography, Space } from 'antd'
import {
  AppstoreOutlined,
  UploadOutlined,
  SettingOutlined,
  LogoutOutlined,
} from '@ant-design/icons'
import { useAuth } from '@/auth/AuthContext'

const { Header, Content } = AntLayout
const { Title } = Typography

export default function Layout() {
  const { logout } = useAuth()
  const navigate = useNavigate()

  const handleLogout = () => {
    logout()
    navigate('/login', { replace: true })
  }

  const menuItems = [
    {
      key: '/',
      icon: <AppstoreOutlined />,
      label: <NavLink to="/">Chart 列表</NavLink>,
    },
    {
      key: '/upload',
      icon: <UploadOutlined />,
      label: <NavLink to="/upload">上传Chart</NavLink>,
    },
    {
      key: '/settings',
      icon: <SettingOutlined />,
      label: <NavLink to="/settings">设置</NavLink>,
    },
  ]

  return (
    <AntLayout style={{ minHeight: '100vh' }}>
      <Header
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '0 24px',
          borderBottom: '1px solid #303030',
        }}
      >
        <Space align="center">
          <span style={{ fontSize: 24, color: '#1668dc' }}>◈</span>
          <Title level={4} style={{ margin: 0, color: '#fff' }}>
            ChartMuseum 管理控制台
          </Title>
        </Space>

        <Space>
          <Menu
            theme="dark"
            mode="horizontal"
            items={menuItems}
            style={{
              flex: 1,
              minWidth: 0,
              background: 'transparent',
              borderBottom: 'none',
            }}
            selectedKeys={[window.location.pathname]}
          />
          <Button
            type="text"
            icon={<LogoutOutlined />}
            onClick={handleLogout}
            style={{ color: '#fff' }}
          >
            退出
          </Button>
        </Space>
      </Header>

      <Content style={{ padding: '24px', background: '#0a0a0a' }}>
        <Outlet />
      </Content>
    </AntLayout>
  )
}
