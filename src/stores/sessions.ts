import { defineStore } from 'pinia'
import { ref } from 'vue'
import { listMySessions, revokeSession as revokeSessionApi } from '@/api/session'
import type { DeviceSession } from '@/types/session'
import type { SessionWsMessage } from '@/api/sessionWs'

/**
 * 全局设备会话列表：由唯一 WebSocket 的 SESSIONS_CHANGED 驱动增删刷新，
 * 不依赖是否停留在「登录设备」页。
 */
export const useSessionsStore = defineStore('sessions', () => {
  const sessions = ref<DeviceSession[]>([])
  const loading = ref(false)
  const error = ref('')
  let refreshSeq = 0

  async function refresh() {
    const seq = ++refreshSeq
    loading.value = true
    error.value = ''
    try {
      const list = await listMySessions()
      if (seq === refreshSeq) {
        sessions.value = list
      }
    } catch (e) {
      if (seq === refreshSeq) {
        error.value = e instanceof Error ? e.message : '加载设备列表失败'
      }
      throw e
    } finally {
      if (seq === refreshSeq) {
        loading.value = false
      }
    }
  }

  /** 全局 WS 分发：按 type 执行对应逻辑 */
  function handleWsMessage(msg: SessionWsMessage) {
    if (msg.type === 'SESSIONS_CHANGED') {
      // LOGIN → 列表应多一条；LOGOUT/KICKED → 少一条。统一拉全量保证一致。
      void refresh().catch(() => {
        /* 保留旧列表 */
      })
    }
  }

  async function revoke(sessionId: string) {
    await revokeSessionApi(sessionId)
    await refresh()
  }

  function clear() {
    sessions.value = []
    error.value = ''
  }

  return { sessions, loading, error, refresh, handleWsMessage, revoke, clear }
})
