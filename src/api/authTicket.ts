import { api } from '@/api/http'

export function authorizeWebLogin(ticketCode: string) {
  return api.post<{ ticketId: string; status: string; approved: boolean }>(
    '/auth/authorize-web-login',
    { ticketCode },
  )
}
