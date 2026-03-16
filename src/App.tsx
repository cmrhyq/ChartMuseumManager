import { Routes, Route, Navigate } from 'react-router-dom'
import { ProtectedRoute } from '@/auth/ProtectedRoute'
import Layout from './components/Layout'
import Login from './pages/Login'
import ChartList from '@/pages/chart/list/ChartList.tsx'
import Upload from './pages/upload/Upload.tsx'
import ChartDetail from '@/pages/chart/detail/ChartDetail.tsx'
import Settings from './pages/settings/Settings.tsx'

function App() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route
        path="/"
        element={
          <ProtectedRoute>
            <Layout />
          </ProtectedRoute>
        }
      >
        <Route path="/settings" element={<Settings />} />
        <Route index element={<ChartList />} />
        <Route path="upload" element={<Upload />} />
        <Route path="charts/:name/:version" element={<ChartDetail />} />
      </Route>
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}

export default App
