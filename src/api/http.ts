import axios, { type AxiosInstance, type AxiosRequestConfig } from 'axios'
import { ApiError, type ApiResponse } from '@/types/api'
import { createIdempotencyKey } from '@/utils/idempotency'
import { useMock, handleMockRequest } from '@/api/mock'
import { getOrCreateDeviceId } from '@/utils/device'

const TOKEN_KEY = 'fund_access_token'
const REFRESH_KEY = 'fund_refresh_token'

export function getAccessToken(): string | null {
  return localStorage.getItem(TOKEN_KEY)
}

export function setAccessToken(token: string | null): void {
  if (token) localStorage.setItem(TOKEN_KEY, token)
  else localStorage.removeItem(TOKEN_KEY)
}

export function getRefreshToken(): string | null {
  return localStorage.getItem(REFRESH_KEY)
}

export function setRefreshToken(token: string | null): void {
  if (token) localStorage.setItem(REFRESH_KEY, token)
  else localStorage.removeItem(REFRESH_KEY)
}

/** 生产包无 Vite 代理；相对路径会导致请求打到 asset 源，响应无 data */
export function resolveApiBase(): string {
  const configured = (import.meta.env.VITE_API_BASE_URL || '').trim()
  if (configured.startsWith('http://') || configured.startsWith('https://')) {
    return configured.replace(/\/$/, '')
  }
  if (import.meta.env.PROD) {
    return 'http://127.0.0.1:8080/api/v1'
  }
  return configured || '/api/v1'
}

function isTauriRuntime(): boolean {
  return typeof window !== 'undefined' && '__TAURI_INTERNALS__' in window
}

/**
 * 打包版走 Tauri HTTP 插件（Rust 出站，无 WebView CORS）。
 * 开发版仍用 axios + Vite 代理，便于 Chrome 抓包。
 */
function useTauriHttp(): boolean {
  return import.meta.env.PROD && isTauriRuntime()
}

function joinUrl(base: string, path: string): string {
  const b = base.replace(/\/$/, '')
  const p = path.startsWith('/') ? path : `/${path}`
  return `${b}${p}`
}

function redirectToLogin() {
  setAccessToken(null)
  setRefreshToken(null)
  if (!window.location.hash.includes('/login') && !window.location.pathname.startsWith('/login')) {
    window.location.hash = `#/login?redirect=${encodeURIComponent(window.location.hash.slice(1) || '/')}`
  }
}

async function buildHeaders(
  method: string,
  extra?: Record<string, string>,
  idempotencyKey?: string,
): Promise<Record<string, string>> {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...extra,
  }
  const token = getAccessToken()
  if (token) headers.Authorization = `Bearer ${token}`

  try {
    const deviceId = await getOrCreateDeviceId()
    headers['X-Device-Id'] = deviceId
    headers['X-Device-Type'] = import.meta.env.VITE_DEVICE_TYPE || 'mac'
  } catch {
    /* ignore */
  }

  const m = method.toLowerCase()
  if (['post', 'put', 'patch', 'delete'].includes(m)) {
    headers['Idempotency-Key'] = idempotencyKey || createIdempotencyKey()
  }
  return headers
}

function unwrapApiBody<T>(body: unknown, httpStatus?: number): T {
  if (!body || typeof body !== 'object' || !('code' in body)) {
    throw new ApiError(
      '50001',
      `接口响应格式异常（当前 baseURL=${resolveApiBase()}）。打包环境请直连 http://127.0.0.1:8080/api/v1`,
      httpStatus,
    )
  }
  const api = body as ApiResponse<T>
  if (typeof api.code === 'string' && api.code !== '0') {
    // 不在此处跳登录：交给 request() 统一处理刷新重试或最终跳转
    throw new ApiError(api.code, api.message || '业务错误', httpStatus, api.traceId)
  }
  return api.data as T
}

async function requestViaTauriHttp<T>(
  method: string,
  url: string,
  data?: unknown,
  options?: RequestOptions,
): Promise<T> {
  const { fetch } = await import('@tauri-apps/plugin-http')
  const headers = await buildHeaders(
    method,
    options?.config?.headers as Record<string, string> | undefined,
    options?.idempotencyKey,
  )
  const fullUrl = joinUrl(resolveApiBase(), url)

  let response: Response
  try {
    response = await fetch(fullUrl, {
      method: method.toUpperCase(),
      headers,
      body: data === undefined ? undefined : JSON.stringify(data),
    })
  } catch (e) {
    throw new ApiError(
      'NETWORK',
      `无法连接后端（${resolveApiBase()}）。请确认服务可达；打包版还需在 Tauri http 权限中放行该域名。${
        e instanceof Error ? ` ${e.message}` : ''
      }`,
    )
  }

  let json: unknown
  try {
    json = await response.json()
  } catch {
    throw new ApiError(
      '50001',
      `后端返回非 JSON（HTTP ${response.status}），baseURL=${resolveApiBase()}`,
      response.status,
    )
  }

  if (!response.ok) {
    const api = json as ApiResponse | undefined
    if (api?.code) {
      throw new ApiError(api.code, api.message || response.statusText, response.status, api.traceId)
    }
    throw new ApiError('HTTP', `HTTP ${response.status}`, response.status)
  }

  return unwrapApiBody<T>(json, response.status)
}

const http: AxiosInstance = axios.create({
  baseURL: resolveApiBase(),
  timeout: 30000,
  headers: { 'Content-Type': 'application/json' },
})

http.interceptors.request.use(async (config) => {
  const headers = await buildHeaders(
    config.method || 'get',
    config.headers as Record<string, string> | undefined,
  )
  Object.assign(config.headers, headers)
  return config
})

http.interceptors.response.use(
  (response) => {
    const body = response.data as ApiResponse
    if (body && typeof body === 'object' && typeof body.code === 'string' && body.code !== '0') {
      throw new ApiError(body.code, body.message || '业务错误', response.status, body.traceId)
    }
    return response
  },
  (error) => {
    const body = error.response?.data as ApiResponse | undefined
    if (body?.code) {
      throw new ApiError(body.code, body.message || error.message, error.response?.status, body.traceId)
    }
    if (!error.response) {
      throw new ApiError(
        'NETWORK',
        `无法连接后端（${resolveApiBase()}）。请确认 fund-back 已启动，且打包版使用绝对 API 地址。`,
      )
    }
    throw error
  },
)

export interface RequestOptions {
  idempotencyKey?: string
  config?: AxiosRequestConfig
}

function isAuthError(e: unknown): boolean {
  return e instanceof ApiError && (e.code === '40101' || e.httpStatus === 401)
}

/** 单飞刷新：并发 401 只发一次 /auth/refresh */
let refreshPromise: Promise<string | null> | null = null

async function postRefresh(): Promise<string | null> {
  const refreshToken = getRefreshToken()
  if (!refreshToken) return null
  const url = joinUrl(resolveApiBase(), '/auth/refresh')
  try {
    if (useTauriHttp()) {
      const { fetch } = await import('@tauri-apps/plugin-http')
      const resp = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ refreshToken }),
      })
      if (!resp.ok) return null
      const json = (await resp.json()) as ApiResponse<{ accessToken?: string; refreshToken?: string }>
      if (json.code !== '0' || !json.data?.accessToken) return null
      setAccessToken(json.data.accessToken)
      setRefreshToken(json.data.refreshToken ?? null)
      return json.data.accessToken
    }
    const resp = await axios.post(
      url,
      { refreshToken },
      { headers: { 'Content-Type': 'application/json' } },
    )
    const json = resp.data as ApiResponse<{ accessToken?: string; refreshToken?: string }>
    if (json.code !== '0' || !json.data?.accessToken) return null
    setAccessToken(json.data.accessToken)
    setRefreshToken(json.data.refreshToken ?? null)
    return json.data.accessToken
  } catch {
    return null
  }
}

async function ensureRefreshed(): Promise<string | null> {
  if (!refreshPromise) {
    refreshPromise = postRefresh().finally(() => {
      refreshPromise = null
    })
  }
  return refreshPromise
}

async function doTransport<T>(
  method: string,
  url: string,
  data?: unknown,
  options?: RequestOptions,
): Promise<T> {
  if (useTauriHttp()) {
    return requestViaTauriHttp<T>(method, url, data, options)
  }

  const config: AxiosRequestConfig = {
    ...options?.config,
    method,
    url,
    data,
    headers: {
      ...options?.config?.headers,
      ...(options?.idempotencyKey ? { 'Idempotency-Key': options.idempotencyKey } : {}),
    },
  }

  const res = await http.request<ApiResponse<T>>(config)
  return unwrapApiBody<T>(res.data, res.status)
}

async function request<T>(
  method: string,
  url: string,
  data?: unknown,
  options?: RequestOptions,
): Promise<T> {
  if (useMock) {
    return handleMockRequest<T>(method, url, data)
  }

  try {
    return await doTransport<T>(method, url, data, options)
  } catch (e) {
    const isRefreshCall = url.includes('/auth/refresh')
    if (isAuthError(e) && !isRefreshCall) {
      const newToken = await ensureRefreshed()
      if (newToken) {
        // access 过期后静默续期成功，重放一次原请求
        return await doTransport<T>(method, url, data, options)
      }
      redirectToLogin()
    }
    throw e
  }
}

export const api = {
  get: <T>(url: string, options?: RequestOptions) => request<T>('get', url, undefined, options),
  post: <T>(url: string, data?: unknown, options?: RequestOptions) =>
    request<T>('post', url, data, options),
  put: <T>(url: string, data?: unknown, options?: RequestOptions) =>
    request<T>('put', url, data, options),
  delete: <T>(url: string, options?: RequestOptions) =>
    request<T>('delete', url, undefined, options),
}

export default http
