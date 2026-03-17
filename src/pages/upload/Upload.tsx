import { useState, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { Card, Upload as AntUpload, Button, Typography, Alert, Space, message } from 'antd'
import { InboxOutlined, CloudUploadOutlined } from '@ant-design/icons'
import type { UploadFile, UploadProps } from 'antd'
import type { RcFile } from 'antd/es/upload'
import { useAuth } from '@/auth/AuthContext.tsx'
import { uploadChart } from '@/api/chartmuseum.ts'

const { Title, Text, Paragraph } = Typography
const { Dragger } = AntUpload

export default function Upload() {
  const { token } = useAuth()
  const getToken = useCallback(() => token, [token])
  const [fileList, setFileList] = useState<UploadFile[]>([])
  const [rawFile, setRawFile] = useState<RcFile | null>(null)
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const navigate = useNavigate()

  const handleUpload = async () => {
    if (!rawFile) {
      setError('请选择要上传的 .tgz 文件')
      return
    }

    if (!rawFile.name.endsWith('.tgz')) {
      setError('仅支持 Helm Chart 打包文件（.tgz）')
      return
    }

    setUploading(true)
    setError(null)

    try {
      await uploadChart(rawFile as unknown as File, getToken)
      message.success('上传成功！')
      setFileList([])
      setRawFile(null)
      setTimeout(() => navigate('/'), 1500)
    } catch {
      setError('上传失败，请检查网络与 ChartMuseum 配置后重试')
    } finally {
      setUploading(false)
    }
  }

  const uploadProps: UploadProps = {
    name: 'file',
    multiple: false,
    accept: '.tgz',
    fileList,
    beforeUpload: (file) => {
      if (!file.name.endsWith('.tgz')) {
        message.error('仅支持 .tgz 文件')
        return AntUpload.LIST_IGNORE
      }
      setFileList([file as unknown as UploadFile])
      setRawFile(file as RcFile)
      setError(null)
      return false
    },
    onRemove: () => {
      setFileList([])
      setRawFile(null)
      setError(null)
    },
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
        <div>
          <Title level={4} style={{ marginBottom: 8 }}>
            <CloudUploadOutlined style={{ marginRight: 8 }} />
            上传 Helm Chart
          </Title>
          <Paragraph type="secondary" style={{ marginBottom: 0 }}>
            选择通过 <Text code>helm package</Text> 打包的 .tgz 文件上传到 ChartMuseum 仓库。
          </Paragraph>
        </div>

        <Dragger {...uploadProps} style={{ background: '#1f1f1f', borderColor: '#303030' }}>
          <p className="ant-upload-drag-icon">
            <InboxOutlined style={{ color: '#1668dc', fontSize: 48 }} />
          </p>
          <p className="ant-upload-text">点击或拖拽文件到此区域上传</p>
          <p className="ant-upload-hint">仅支持 .tgz 格式的 Helm Chart 包</p>
        </Dragger>

        {error && <Alert message={error} type="error" showIcon />}

        <Button
          type="primary"
          onClick={handleUpload}
          disabled={fileList.length === 0}
          loading={uploading}
          icon={<CloudUploadOutlined />}
          size="large"
          block
        >
          {uploading ? '上传中...' : '上传'}
        </Button>
      </Space>
    </Card>
  )
}
