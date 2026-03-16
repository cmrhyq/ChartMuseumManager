import { useState, useRef, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '@/auth/AuthContext.tsx'
import { uploadChart } from '@/api/chartmuseum.ts'
import './Upload.css'

export default function Upload() {
  const { token } = useAuth()
  const getToken = useCallback(() => token, [token])
  const [file, setFile] = useState<File | null>(null)
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)
  const navigate = useNavigate()

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0]
    setFile(f ?? null)
    setError(null)
    setSuccess(false)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!file) {
      setError('请选择要上传的 .tgz 文件')
      return
    }
    if (!file.name.endsWith('.tgz')) {
      setError('仅支持 Helm Chart 打包文件（.tgz）')
      return
    }
    setUploading(true)
    setError(null)
    setSuccess(false)
    try {
      await uploadChart(file, getToken)
      setSuccess(true)
      setFile(null)
      if (inputRef.current) inputRef.current.value = ''
      setTimeout(() => navigate('/'), 1500)
    } catch {
      setError('上传失败，请检查网络与 ChartMuseum 配置后重试')
    } finally {
      setUploading(false)
    }
  }

  return (
    <div className="page-card upload-card">
      <h2 className="card-title">上传 Helm Chart</h2>
      <p className="text-secondary upload-desc">
        选择通过 <code>helm package</code> 打包的 .tgz 文件上传到 ChartMuseum 仓库。
      </p>
      <form onSubmit={handleSubmit} className="upload-form">
        <div className="upload-field">
          <input
            ref={inputRef}
            type="file"
            accept=".tgz"
            onChange={handleFileChange}
            className="upload-input"
            id="chart-file"
          />
          <label htmlFor="chart-file" className="upload-label">
            {file ? file.name : '选择 .tgz 文件'}
          </label>
        </div>
        {error && <p className="upload-error">{error}</p>}
        {success && <p className="upload-success">上传成功，正在跳转到Chart列表…</p>}
        <button type="submit" className="btn btn-primary" disabled={!file || uploading}>
          {uploading ? '上传中…' : '上传'}
        </button>
      </form>
    </div>
  )
}
