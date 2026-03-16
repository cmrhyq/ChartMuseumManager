/** ChartMuseum 单个图表版本信息 */
export interface ChartVersion {
  name: string
  version: string
  description?: string
  apiVersion?: string
  appVersion?: string
  created?: string
  digest?: string
  urls?: string[]
  maintainers?: Array<{ name: string; email?: string }>
}

/** API 返回的图表列表结构：chartName -> ChartVersion[] */
export type ChartsMap = Record<string, ChartVersion[]>

/** 健康检查响应 */
export interface HealthResponse {
  healthy: boolean
}

/** 单版本详情（GET /api/charts/:name/:version） */
export interface ChartDetail extends ChartVersion {
  urls?: string[]
}
