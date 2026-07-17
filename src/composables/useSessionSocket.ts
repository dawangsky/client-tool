import { onMounted, onUnmounted, watch } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { useSessionsStore } from '@/stores/sessions'
import { connectSessionSocket } from '@/api/sessionWs'

/**
 * 全局唯一会话 WebSocket（App 级挂载）：
 * - SESSION_REVOKED → 本端强制下线
 * - SESSIONS_CHANGED → 刷新全局设备列表（Web 登录增 / 退出删）
 */
export function useSessionSocket() {
  const auth = useAuthStore()
  const sessions = useSessionsStore()
  const router = useRouter()
  let ws: WebSocket | null = null

  function disconnect() {
    if (ws) {
      ws.close()
      ws = null
    }
  }

  function connect() {
    disconnect()
    if (!auth.token) return
    ws = connectSessionSocket({
      accessToken: auth.token,
      onMessage: (msg) => {
        sessions.handleWsMessage(msg)
        if (msg.type === 'SESSION_REVOKED') {
          sessions.clear()
          auth.clearLocalSession()
          router.replace({ name: 'login' })
        }
      },
    })
    void sessions.refresh().catch(() => {
      /* 首屏拉列表失败不阻断 WS */
    })
  }

  onMounted(() => {
    if (auth.isLoggedIn) connect()
  })

  watch(
    () => auth.token,
    (token) => {
      if (token) connect()
      else {
        disconnect()
        sessions.clear()
      }
    },
  )

  onUnmounted(disconnect)
}
