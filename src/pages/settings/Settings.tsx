import { useState, useEffect, useCallback } from 'react'
import { Link } from 'react-router-dom'
import { Card, Form, Input, Button, Space, Typography, Alert, Divider } from 'antd'
import {
  SettingOutlined,
  SaveOutlined,
  ApiOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
  ArrowLeftOutlined,
} from '@ant-design/icons'
import { getApiBase, setApiBase } from '@/config.ts'
import { useAuth } from '@/auth/AuthContext.tsx'
import { healthCheck, fetchCharts } from '@/api/chartmuseum.ts'

const { Title, Text, Paragraph } = Typography

export default function Settings() {
  const { isAuthenticated, token } = useAuth()
  const getToken = useCallback(() => token, [token])
  const [form] = Form.useForm()
  const [saved, setSaved] = useState(false)
  const [checking, setChecking] = useState(false)
  const [health, setHealth] = useState<'ok' | 'fail' | null>(null)

  useEffect(() => {
    form.setFieldsValue({ apiBase: getApiBase() })
  }, [form])

  const handleSave = (values: { apiBase: string }) => {
    setApiBase(values.apiBase)
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
    <Card
      style={{
        maxWidth: 600,
        margin: '0 auto',
        background: '#141414',
        border: '1px solid #303030',
      }}
    >
      <Space direction="vertical" size="large" style={{ width: '100%' }}>
        {isAuthenticated && (
          <Link to="/">
            <Button type="link" icon={<ArrowLeftOutlined />} style={{ padding: 0 }}>
              返回控制台
            </Button>
          </Link>
        )}

        <div>
          <Title level={4} style={{ marginBottom: 8 }}>
            <SettingOutlined style={{ marginRight: 8 }} />
            设置
          </Title>
          <Paragraph type="secondary" style={{ marginBottom: 0 }}>
            配置 ChartMuseum 服务地址。当 ChartMuseum 部署在 K8s 中时，请填写其 Ingress 或
            Service 的访问地址（例如 <Text code>https://chartmuseum.example.com</Text>
            ）。生产环境请使用 HTTPS。
          </Paragraph>
        </div>

        <Divider style={{ margin: '8px 0' }} />

        <Form
          form={form}
          layout="vertical"
          onFinish={handleSave}
          autoComplete="off"
        >
          <Form.Item
            name="apiBase"
            label="ChartMuseum API 根地址"
            rules={[
              { required: true, message: '请输入 API 地址' },
              { type: 'url', message: '请输入有效的 URL 地址' },
            ]}
          >
            <Input
              prefix={<ApiOutlined style={{ color: '#666' }} />}
              placeholder="https://your-chartmuseum.example.com"
              size="large"
            />
          </Form.Item>

          <Form.Item>
            <Space>
              <Button
                type="primary"
                htmlType="submit"
                icon={<SaveOutlined />}
              >
                保存
              </Button>
              <Button
                onClick={handleTest}
                loading={checking}
                icon={<ApiOutlined />}
              >
                {checking ? '检测中...' : '检测连接'}
              </Button>
            </Space>
          </Form.Item>

          {saved && (
            <Alert
              message="配置已保存"
              type="success"
              showIcon
              icon={<CheckCircleOutlined />}
              style={{ marginBottom: 16 }}
            />
          )}

          {health === 'ok' && (
            <Alert
              message="连接正常"
              description="ChartMuseum 服务可正常访问"
              type="success"
              showIcon
              icon={<CheckCircleOutlined />}
            />
          )}

          {health === 'fail' && (
            <Alert
              message="连接失败"
              description="请检查地址与网络（若跨域需在 ChartMuseum 侧配置 CORS）"
              type="error"
              showIcon
              icon={<CloseCircleOutlined />}
            />
          )}
        </Form>
      </Space>
    </Card>
  )
}
