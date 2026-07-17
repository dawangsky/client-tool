import { api } from '@/api/http'
import type { PageQuery, PageResult } from '@/types/api'
import type { Position, PositionFlow } from '@/types/position'

export function listPositions() {
  return api.get<Position[]>('/positions')
}

export function getPosition(fundCode: string) {
  return api.get<Position>(`/positions/${fundCode}`)
}

export function listPositionFlows(query?: PageQuery & { fundCode?: string }) {
  const qs = new URLSearchParams()
  if (query?.page) qs.set('page', String(query.page))
  if (query?.pageSize) qs.set('pageSize', String(query.pageSize))
  if (query?.fundCode) qs.set('fundCode', query.fundCode)
  const suffix = qs.toString() ? `?${qs}` : ''
  return api.get<PageResult<PositionFlow>>(`/position-flows${suffix}`)
}
