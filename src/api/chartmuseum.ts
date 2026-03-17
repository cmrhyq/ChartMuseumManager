import { getApiBase } from '@/config'
import type { ChartsMap, ChartDetail, HealthResponse } from '@/types/chartmuseum'

function apiUrl(path: string): string {
  const base = getApiBase()
  const normalized = base.replace(/\/+$/, '')
  const p = path.startsWith('/') ? path : `/${path}`
  return `${normalized}${p}`
}

function buildAuthHeader(token: string | null): Record<string, string> {
  if (!token) return {}
  return { Authorization: `Basic ${token}` }
}

async function handleResponse<T>(res: Response): Promise<T> {
  const text = await res.text()
  if (!res.ok) {
    throw new Error(text || `HTTP ${res.status}`)
  }
  if (!text) return undefined as T
  try {
    return JSON.parse(text) as T
  } catch {
    return undefined as T
  }
}

/** 使用指定账号密码校验 ChartMuseum 认证（GET /api/charts）；失败抛错，成功无返回值。不暴露 401/403 等细节。 */
export async function validateChartMuseumAuth(username: string, password: string): Promise<void> {
  const encoded = btoa(unescape(encodeURIComponent(`${username}:${password}`)))
  const url = apiUrl('/api/charts')
  const res = await fetch(url, {
    method: 'GET',
    headers: { Authorization: `Basic ${encoded}` },
  })
  if (!res.ok) {
    throw new Error('LOGIN_FAILED')
  }
}

/** 获取当前认证头（从外部注入 token，避免 api 依赖 auth 造成循环） */
export function getAuthHeaders(getToken: () => string | null): Record<string, string> {
  return buildAuthHeader(getToken())
}

/** 获取所有图表 */
export async function fetchCharts(getToken: () => string | null): Promise<ChartsMap> {
  const res = await fetch(apiUrl('/api/charts'), {
    headers: getAuthHeaders(getToken),
  })
  return handleResponse<ChartsMap>(res)
}

/** 删除指定图表版本 */
export async function deleteChart(
  name: string,
  version: string,
  getToken: () => string | null,
): Promise<void> {
  const encodedName = encodeURIComponent(name)
  const encodedVersion = encodeURIComponent(version)
  const res = await fetch(apiUrl(`/api/charts/${encodedName}/${encodedVersion}`), {
    method: 'DELETE',
    headers: getAuthHeaders(getToken),
  })
  if (!res.ok) {
    const text = await res.text()
    throw new Error(text || `HTTP ${res.status}`)
  }
}

/** 上传 Helm Chart（.tgz 文件） */
export async function uploadChart(
  file: File,
  getToken: () => string | null,
): Promise<{ saved: boolean }> {
  const form = new FormData()
  form.append('chart', file)
  const res = await fetch(apiUrl('/api/charts'), {
    method: 'POST',
    headers: getAuthHeaders(getToken),
    body: form,
  })
  return handleResponse<{ saved: boolean }>(res)
}

/** 健康检查（无需认证） */
export async function healthCheck(): Promise<HealthResponse> {
  const res = await fetch(apiUrl('/health'))
  return handleResponse<HealthResponse>(res)
}

/** 获取单版本详情 */
export async function fetchChartDetail(
  name: string,
  version: string,
  getToken: () => string | null,
): Promise<ChartDetail> {
  const encodedName = encodeURIComponent(name)
  const encodedVersion = encodeURIComponent(version)
  const res = await fetch(apiUrl(`/api/charts/${encodedName}/${encodedVersion}`), {
    headers: getAuthHeaders(getToken),
  })
  return handleResponse<ChartDetail>(res)
}

/** 下载 Chart 文件，返回 blob 与解析出的文件名（带认证） */
export async function downloadChartFile(
  url: string,
  getToken: () => string | null,
  fallbackFilename: string,
): Promise<{ blob: Blob; filename: string }> {
  const res = await fetch(url, {
    headers: getAuthHeaders(getToken),
  })
  if (!res.ok) {
    const text = await res.text()
    throw new Error(text || `HTTP ${res.status}`)
  }

  const blob = await res.blob()
  const disposition = res.headers.get('Content-Disposition') || ''
  let filename = fallbackFilename
  const match = disposition.match(/filename="?([^"]+)"?/i)
  if (match && match[1]) {
    filename = match[1]
  }

  return { blob, filename }
}
