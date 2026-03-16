/** 仅存储 API 根 URL，不存储任何密码或凭据 */
const STORAGE_KEY = 'chartmuseum-api-base'

function getDefaultBase(): string {
  const base = import.meta.env.VITE_CHARTMUSEUM_API ?? ''
  if (base) return base
  if (typeof window !== 'undefined') {
    return window.location.origin
  }
  return ''
}

let cachedBase = ''

export function getApiBase(): string {
  if (cachedBase) return cachedBase
  try {
    const stored = localStorage.getItem(STORAGE_KEY)
    cachedBase = stored ?? getDefaultBase()
    if (!cachedBase && typeof window !== 'undefined') {
      cachedBase = window.location.origin
    }
    return cachedBase
  } catch {
    return getDefaultBase() || (typeof window !== 'undefined' ? window.location.origin : '')
  }
}

export function setApiBase(base: string): void {
  const normalized = base.replace(/\/+$/, '')
  cachedBase = normalized
  try {
    if (normalized) {
      localStorage.setItem(STORAGE_KEY, normalized)
    } else {
      localStorage.removeItem(STORAGE_KEY)
    }
  } catch {
    // ignore
  }
}
