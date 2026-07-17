import type { OrderStatus, OrderType } from '@/types/trade'

export const ORDER_TYPE_LABEL: Record<OrderType, string> = {
  PURCHASE: '申购',
  REDEEM: '赎回',
}

export const ORDER_STATUS_LABEL: Record<OrderStatus, string> = {
  ACCEPTED: '已受理',
  PAYING: '支付中',
  PAID: '已支付',
  REPORTING: '上报中',
  CONFIRMED: '已确认',
  FAILED: '失败',
  CANCELLED: '已撤单',
  REFUNDING: '退款中',
  REFUNDED: '已退款',
  FROZEN: '冻结',
  PAYING_OUT: '出款中',
  COMPLETED: '已完成',
}

/** 状态色：success / warning / danger / info / muted */
export function orderStatusTone(status: OrderStatus): 'ok' | 'warn' | 'danger' | 'info' | 'muted' {
  if (['CONFIRMED', 'COMPLETED', 'PAID', 'REFUNDED'].includes(status)) return 'ok'
  if (['FAILED', 'CANCELLED'].includes(status)) return 'danger'
  if (['ACCEPTED', 'PAYING', 'REPORTING', 'REFUNDING', 'PAYING_OUT', 'FROZEN'].includes(status))
    return 'warn'
  return 'info'
}
