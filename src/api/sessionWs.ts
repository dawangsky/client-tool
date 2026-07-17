/**
 * 会话 WebSocket（后端 Netty，默认 8081；开发态经 Vite 代理 `/ws`）。
 * 定时 PING 心跳；断线宽限后由服务端从登录设备列表移除。
 */
export type SessionWsMessage =
  | { type: 'CONNECTED'; ok?: boolean; heartbeatIntervalSeconds?: number }
  | { type: 'SESSION_REVOKED'; sessionId: string; reason?: string }
  | { type: 'SESSIONS_CHANGED'; sessionId?: string; reason?: string }
  | { type: 'PONG'; version?: number }
  | { type: string; [k: string]: unknown }

const DEFAULT_HEARTBEAT_MS = 25_000

function wsBaseUrl(): string {
  const explicit = import.meta.env.VITE_WS_BASE_URL as string | undefined
  if (explicit) return explicit.replace(/\/$/, '')

  if (import.meta.env.PROD) {
    const api = (import.meta.env.VITE_API_BASE_URL || '').trim()
    if (api.startsWith('http://') || api.startsWith('https://')) {
      try {
        const u = new URL(api)
        const proto = u.protocol === 'https:' ? 'wss:' : 'ws:'
        return `${proto}//${u.hostname}:8081`
      } catch {
        /* fall through */
      }
    }
    return 'ws://127.0.0.1:8081'
  }

  const proto = window.location.protocol === 'https:' ? 'wss:' : 'ws:'
  return `${proto}//${window.location.host}`
}

export function connectSessionSocket(opts: {
  accessToken?: string
  onMessage: (msg: SessionWsMessage) => void
  onClose?: () => void
}): WebSocket | null {
  const q = new URLSearchParams()
  if (opts.accessToken) q.set('accessToken', opts.accessToken)
  if (![...q.keys()].length) return null

  const url = `${wsBaseUrl()}/ws/session?${q.toString()}`
  const ws = new WebSocket(url)
  let heartbeatTimer: ReturnType<typeof setInterval> | null = null
  let heartbeatMs = DEFAULT_HEARTBEAT_MS

  function clearHeartbeat() {
    if (heartbeatTimer) {
      clearInterval(heartbeatTimer)
      heartbeatTimer = null
    }
  }

  function startHeartbeat() {
    clearHeartbeat()
    heartbeatTimer = setInterval(() => {
      if (ws.readyState === WebSocket.OPEN) {
        ws.send(JSON.stringify({ type: 'PING', version: 1 }))
      }
    }, heartbeatMs)
  }

  ws.onopen = () => {
    startHeartbeat()
  }

  ws.onmessage = (ev) => {
    try {
      const msg = JSON.parse(String(ev.data)) as SessionWsMessage
      if (msg.type === 'CONNECTED' && typeof msg.heartbeatIntervalSeconds === 'number' && msg.heartbeatIntervalSeconds > 0) {
        heartbeatMs = msg.heartbeatIntervalSeconds * 1000
        startHeartbeat()
      }
      if (msg.type === 'PONG') {
        return
      }
      opts.onMessage(msg)
    } catch {
      /* ignore */
    }
  }
  ws.onclose = () => {
    clearHeartbeat()
    opts.onClose?.()
  }
  return ws
}
