import { useEffect, useState, useCallback } from 'react'
import { useParams, Link } from 'react-router-dom'
import {
  Card,
  Descriptions,
  Button,
  Typography,
  Spin,
  Result,
  Tag,
  Space,
  List,
  message,
} from 'antd'
import {
  ArrowLeftOutlined,
  FileTextOutlined,
  UserOutlined,
  DownloadOutlined,
  InfoCircleOutlined,
} from '@ant-design/icons'
import { useAuth } from '@/auth/AuthContext.tsx'
import { fetchChartDetail, downloadChartFile } from '@/api/chartmuseum.ts'
import type { ChartDetail as ChartDetailType } from '@/types/chartmuseum.ts'

const { Title, Text } = Typography

export default function ChartDetail() {
  const { name, version } = useParams<{ name: string; version: string }>()
  const { token } = useAuth()
  const getToken = useCallback(() => token, [token])
  const [detail, setDetail] = useState<ChartDetailType | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const handleDownload = useCallback(
    async (url: string) => {
      try {
        const fallback = `${detail?.name ?? 'chart'}-${detail?.version ?? ''}.tgz`
        const { blob, filename } = await downloadChartFile(url, getToken, fallback)

        const blobUrl = URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = blobUrl
        a.download = filename
        document.body.appendChild(a)
        a.click()
        a.remove()
        URL.revokeObjectURL(blobUrl)
      } catch {
        message.error('下载失败，请检查网络与权限配置后重试')
      }
    },
    [getToken, detail],
  )

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
      <Card style={{ background: '#141414', border: '1px solid #303030' }}>
        <Result
          status="warning"
          title="缺少参数"
          subTitle="缺少 Chart 名称或版本参数"
          extra={
            <Button type="primary">
              <Link to="/">返回 Chart 列表</Link>
            </Button>
          }
        />
      </Card>
    )
  }

  if (loading) {
    return (
      <Card style={{ background: '#141414', border: '1px solid #303030' }}>
        <div style={{ textAlign: 'center', padding: '60px 0' }}>
          <Spin size="large" />
          <div style={{ marginTop: 16 }}>
            <Text type="secondary">加载中...</Text>
          </div>
        </div>
      </Card>
    )
  }

  if (error || !detail) {
    return (
      <Card style={{ background: '#141414', border: '1px solid #303030' }}>
        <Result
          status="error"
          title="加载失败"
          subTitle={error ?? '未找到该 Chart 版本'}
          extra={
            <Button type="primary">
              <Link to="/">返回 Chart 列表</Link>
            </Button>
          }
        />
      </Card>
    )
  }

  return (
    <Card
      style={{ background: '#141414', border: '1px solid #303030' }}
      styles={{ body: { padding: 0 } }}
    >
      <div
        style={{
          padding: '20px 24px',
          borderBottom: '1px solid #303030',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: 16,
        }}
      >
        <Space align="center">
          <FileTextOutlined style={{ fontSize: 24, color: '#1668dc' }} />
          <div>
            <Title level={4} style={{ margin: 0 }}>
              {detail.name}
            </Title>
            <Space size={8} style={{ marginTop: 4 }}>
              <Tag color="blue">{detail.version}</Tag>
              {detail.appVersion && <Tag color="green">App: {detail.appVersion}</Tag>}
            </Space>
          </div>
        </Space>

        <Link to="/">
          <Button icon={<ArrowLeftOutlined />}>返回列表</Button>
        </Link>
      </div>

      <div style={{ padding: 24 }}>
        <Descriptions
          column={{ xs: 1, sm: 1, md: 2 }}
          bordered
          size="middle"
          labelStyle={{ background: '#1f1f1f', width: 140 }}
          contentStyle={{ background: '#141414' }}
        >
          {detail.description && (
            <Descriptions.Item
              label={
                <Space>
                  <InfoCircleOutlined />
                  描述
                </Space>
              }
              span={2}
            >
              {detail.description}
            </Descriptions.Item>
          )}

          <Descriptions.Item label="Chart 版本">{detail.version}</Descriptions.Item>

          {detail.appVersion != null && detail.appVersion !== '' && (
            <Descriptions.Item label="App 版本">{detail.appVersion}</Descriptions.Item>
          )}

          {detail.apiVersion != null && detail.apiVersion !== '' && (
            <Descriptions.Item label="API 版本">{detail.apiVersion}</Descriptions.Item>
          )}
        </Descriptions>

        {detail.maintainers != null && detail.maintainers.length > 0 && (
          <Card
            title={
              <Space>
                <UserOutlined />
                维护者
              </Space>
            }
            size="small"
            style={{ marginTop: 24, background: '#1f1f1f', border: '1px solid #303030' }}
            styles={{ body: { padding: 0 } }}
          >
            <List
              dataSource={detail.maintainers}
              renderItem={(m) => (
                <List.Item style={{ padding: '12px 16px' }}>
                  <Text>
                    {m.name}
                    {m.email && (
                      <Text type="secondary" style={{ marginLeft: 8 }}>
                        ({m.email})
                      </Text>
                    )}
                  </Text>
                </List.Item>
              )}
            />
          </Card>
        )}

        {detail.urls != null && detail.urls.length > 0 && (
          <Card
            title={
              <Space>
                <DownloadOutlined />
                下载链接
              </Space>
            }
            size="small"
            style={{ marginTop: 24, background: '#1f1f1f', border: '1px solid #303030' }}
            styles={{ body: { padding: 0 } }}
          >
            <List
              dataSource={detail.urls}
              renderItem={(url) => (
                <List.Item style={{ padding: '12px 16px' }}>
                  <Button type="link" style={{ padding: 0 }} onClick={() => handleDownload(url)}>
                    {url}
                  </Button>
                </List.Item>
              )}
            />
          </Card>
        )}
      </div>
    </Card>
  )
}
