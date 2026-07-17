import { api } from '@/api/http'
import type { PageQuery, PageResult } from '@/types/api'
import type { PurchaseRequest, RedeemRequest, TradeOrder } from '@/types/trade'

export function purchase(data: PurchaseRequest, idempotencyKey?: string) {
  return api.post<TradeOrder>('/trade-orders/purchase', data, { idempotencyKey })
}

export function redeem(data: RedeemRequest, idempotencyKey?: string) {
  return api.post<TradeOrder>('/trade-orders/redeem', data, { idempotencyKey })
}

export function cancelOrder(orderNo: string) {
  return api.post<TradeOrder>(`/trade-orders/${orderNo}/cancel`)
}

export function getOrder(orderNo: string) {
  return api.get<TradeOrder>(`/trade-orders/${orderNo}`)
}

export function listOrders(query?: PageQuery) {
  const qs = new URLSearchParams()
  if (query?.page) qs.set('page', String(query.page))
  if (query?.pageSize) qs.set('pageSize', String(query.pageSize))
  const suffix = qs.toString() ? `?${qs}` : ''
  return api.get<PageResult<TradeOrder>>(`/trade-orders${suffix}`)
}
