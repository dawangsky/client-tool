/** 操作审计事件（客户端上报；契约见后端 WOR-7） */

export type AuditAction =
  | 'LOGIN_SUCCESS'
  | 'LOGIN_FAIL'
  | 'LOGOUT'
  | 'PURCHASE'
  | 'REDEEM'
  | 'CANCEL_ORDER'
  | string

export interface AuditEvent {
  action: AuditAction
  objectId?: string
  result?: 'SUCCESS' | 'FAIL'
  detail?: Record<string, unknown>
  clientTs?: string
}
