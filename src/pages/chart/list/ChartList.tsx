import { useEffect, useState, useCallback } from 'react'
import { Link } from 'react-router-dom'
import {
  Card,
  Table,
  Button,
  Input,
  Space,
  Typography,
  Result,
  Popconfirm,
  message,
  Tag,
} from 'antd'
import {
  SearchOutlined,
  ReloadOutlined,
  DeleteOutlined,
  FileTextOutlined,
} from '@ant-design/icons'
import type { ColumnsType } from 'antd/es/table'
import { useAuth } from '@/auth/AuthContext.tsx'
import { fetchCharts, deleteChart } from '@/api/chartmuseum.ts'
import type { ChartsMap, ChartVersion } from '@/types/chartmuseum.ts'

const { Title, Text } = Typography

interface ChartRow {
  key: string
  name: string
  version: string
  appVersion: string
  description: string
  versionData: ChartVersion
}

export default function ChartList() {
  const { token } = useAuth()
  const getToken = useCallback(() => token, [token])
  const [charts, setCharts] = useState<ChartsMap | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [search, setSearch] = useState('')
  const [deletingKeys, setDeletingKeys] = useState<Set<string>>(new Set())

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

  const handleDelete = async (name: string, version: string) => {
    const key = `${name}-${version}`
    setDeletingKeys((prev) => new Set(prev).add(key))
    try {
      await deleteChart(name, version, getToken)
      message.success(`已删除 ${name} @ ${version}`)
      load()
    } catch {
      message.error('删除失败，请稍后重试')
    } finally {
      setDeletingKeys((prev) => {
        const next = new Set(prev)
        next.delete(key)
        return next
      })
    }
  }

  if (error) {
    return (
      <Card style={{ background: '#141414', border: '1px solid #303030' }}>
        <Result
          status="error"
          title="无法连接 ChartMuseum"
          subTitle={error}
          extra={[
            <Button key="settings" type="default">
              <Link to="/settings">前往设置</Link>
            </Button>,
            <Button key="retry" type="primary" onClick={load}>
              重试
            </Button>,
          ]}
        />
      </Card>
    )
  }

  const entries = charts ? Object.entries(charts) : []
  const totalVersions = entries.reduce((acc, [, versions]) => acc + versions.length, 0)
  const searchLower = search.trim().toLowerCase()
  const filteredEntries = searchLower
    ? entries.filter(([name]) => name.toLowerCase().includes(searchLower))
    : entries

  const dataSource: ChartRow[] = filteredEntries.flatMap(([name, versions]) =>
    versions.map((v) => ({
      key: `${name}-${v.version}`,
      name,
      version: v.version,
      appVersion: v.appVersion ?? '—',
      description: v.description ?? '—',
      versionData: v,
    })),
  )

  const columns: ColumnsType<ChartRow> = [
    {
      title: 'Chart 名称',
      dataIndex: 'name',
      key: 'name',
      render: (name: string, record: ChartRow) => (
        <Link
          to={`/charts/${encodeURIComponent(name)}/${encodeURIComponent(record.version)}`}
          style={{ fontWeight: 500 }}
        >
          <Space>
            <FileTextOutlined />
            {name}
          </Space>
        </Link>
      ),
    },
    {
      title: '版本',
      dataIndex: 'version',
      key: 'version',
      width: 120,
      render: (version: string) => <Tag color="blue">{version}</Tag>,
    },
    {
      title: 'App 版本',
      dataIndex: 'appVersion',
      key: 'appVersion',
      width: 120,
      render: (appVersion: string) =>
        appVersion !== '—' ? <Tag color="green">{appVersion}</Tag> : <Text type="secondary">—</Text>,
    },
    {
      title: '描述',
      dataIndex: 'description',
      key: 'description',
      ellipsis: true,
      render: (desc: string) =>
        desc !== '—' ? desc : <Text type="secondary">—</Text>,
    },
    {
      title: '操作',
      key: 'action',
      width: 100,
      render: (_: unknown, record: ChartRow) => (
        <Popconfirm
          title="确认删除"
          description={`确定要删除 ${record.name} @ ${record.version} 吗？`}
          onConfirm={() => handleDelete(record.name, record.version)}
          okText="确认"
          cancelText="取消"
          okButtonProps={{ danger: true }}
        >
          <Button
            type="text"
            danger
            icon={<DeleteOutlined />}
            loading={deletingKeys.has(record.key)}
          >
            删除
          </Button>
        </Popconfirm>
      ),
    },
  ]

  return (
    <Card
      style={{ background: '#141414', border: '1px solid #303030' }}
      styles={{ body: { padding: 0 } }}
    >
      <div style={{ padding: '20px 24px', borderBottom: '1px solid #303030' }}>
        <Space
          style={{
            width: '100%',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
          }}
        >
          <Space direction="vertical" size={4}>
            <Title level={4} style={{ margin: 0 }}>
              Chart 列表
            </Title>
            <Text type="secondary">
              {entries.length} 个 Chart，共 {totalVersions} 个版本
            </Text>
          </Space>

          <Space>
            <Input
              placeholder="搜索 Chart 名称"
              prefix={<SearchOutlined style={{ color: '#666' }} />}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              style={{ width: 200 }}
              allowClear
            />
            <Button icon={<ReloadOutlined />} onClick={load} loading={loading}>
              刷新
            </Button>
          </Space>
        </Space>
      </div>

      <Table
        columns={columns}
        dataSource={dataSource}
        loading={loading}
        pagination={{
          pageSize: 10,
          showSizeChanger: true,
          showQuickJumper: true,
          showTotal: (total) => `共 ${total} 条`,
        }}
        locale={{
          emptyText: entries.length === 0 ? (
            <Result
              icon={<FileTextOutlined style={{ color: '#666' }} />}
              title="暂无 Chart"
              subTitle="请前往上传页面添加 Chart"
              extra={
                <Button type="primary">
                  <Link to="/upload">上传 Chart</Link>
                </Button>
              }
            />
          ) : (
            '没有匹配的 Chart 名称'
          ),
        }}
      />
    </Card>
  )
}
