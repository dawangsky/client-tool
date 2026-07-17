import { api } from '@/api/http'
import type { PageQuery, PageResult } from '@/types/api'
import type { UserMessage } from '@/types/document'

export function listMessages(query?: PageQuery) {
  const qs = new URLSearchParams()
  if (query?.page) qs.set('page', String(query.page))
  if (query?.pageSize) qs.set('pageSize', String(query.pageSize))
  const suffix = qs.toString() ? `?${qs}` : ''
  return api.get<PageResult<UserMessage>>(`/messages${suffix}`)
}

export function markMessageRead(messageId: string) {
  return api.post<UserMessage>(`/messages/${messageId}/read`)
}
