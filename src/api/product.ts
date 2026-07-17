import { api } from '@/api/http'
import type { PageQuery, PageResult } from '@/types/api'
import type { FeeRate, Fund, FundLimits, FundNav } from '@/types/product'

export function listFunds(query?: PageQuery & { keyword?: string }) {
  const qs = new URLSearchParams()
  if (query?.page) qs.set('page', String(query.page))
  if (query?.pageSize) qs.set('pageSize', String(query.pageSize))
  if (query?.keyword) qs.set('keyword', query.keyword)
  const suffix = qs.toString() ? `?${qs}` : ''
  return api.get<PageResult<Fund>>(`/funds${suffix}`)
}

export function getFund(fundCode: string) {
  return api.get<Fund>(`/funds/${fundCode}`)
}

export function getFundNav(fundCode: string) {
  return api.get<FundNav>(`/funds/${fundCode}/nav`)
}

export function getFeeRates(fundCode: string) {
  return api.get<FeeRate[]>(`/funds/${fundCode}/fee-rates`)
}

export function getFundLimits(fundCode: string) {
  return api.get<FundLimits>(`/funds/${fundCode}/limits`)
}
