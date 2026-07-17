/** 多端会话（对齐后端 WOR-7 / session 契约预留） */

export type DeviceType = 'web' | 'mac' | 'ios' | 'android' | string

export interface DeviceSession {
  sessionId: string
  deviceId: string
  deviceType: DeviceType
  deviceName?: string
  userAgent?: string
  appVersion?: string
  loginAt: string
  lastActiveAt: string
  current?: boolean
}
