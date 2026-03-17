import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import { ConfigProvider, theme } from 'antd'
import zhCN from 'antd/locale/zh_CN'
import { AuthProvider } from '@/auth/AuthContext'
import App from './App'
import './index.css'

// TODO 最新版本部署到k8s
// TODO Github Actions 自动打镜像推送到腾讯云
// TODO k8s 配置 /manager/chartmuseum 替换为 /index

// 从 Vite 配置中获取 base 路径，用于 React Router 的 basename
// 生产环境部署在 /manager/chartmuseum/ 路径下
const basename = import.meta.env.BASE_URL

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ConfigProvider
      locale={zhCN}
      theme={{
        algorithm: theme.darkAlgorithm,
        token: {
          colorPrimary: '#1668dc',
          colorBgContainer: '#141414',
          colorBgElevated: '#1f1f1f',
          colorBgLayout: '#0a0a0a',
          colorBorder: '#303030',
          borderRadius: 6,
          fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
        },
        components: {
          Layout: {
            headerBg: '#141414',
            siderBg: '#141414',
            bodyBg: '#0a0a0a',
          },
          Menu: {
            darkItemBg: '#141414',
            darkSubMenuItemBg: '#141414',
          },
        },
      }}
    >
      <BrowserRouter basename={basename}>
        <AuthProvider>
          <App />
        </AuthProvider>
      </BrowserRouter>
    </ConfigProvider>
  </StrictMode>,
)
