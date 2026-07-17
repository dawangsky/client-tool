/**
 * 多端会话 API（对齐后端 openspec/contracts/modules/session.md）
 */
import { api } from '@/api/http'
import type { DeviceSession } from '@/types/session'

export function listMySessions() {
  return api.get<DeviceSession[]>('/sessions')
}

/** 登出当前设备 */
export function logoutCurrentSession() {
  return api.post<void>('/auth/logout', {})
}

/** 踢下线指定设备会话 */
export function revokeSession(sessionId: string) {
  return api.delete<void>(`/sessions/${sessionId}`)
}
