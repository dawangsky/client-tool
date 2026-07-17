/** 与 openspec/contracts/api-conventions.md 对齐 */

export interface ApiResponse<T = unknown> {
  code: string
  message: string
  data: T
  traceId: string
}

export interface PageResult<T> {
  list: T[]
  total: number
  page: number
  pageSize: number
}

export interface PageQuery {
  page?: number
  pageSize?: number
}

export class ApiError extends Error {
  code: string
  httpStatus?: number
  traceId?: string

  constructor(code: string, message: string, httpStatus?: number, traceId?: string) {
    super(message)
    this.name = 'ApiError'
    this.code = code
    this.httpStatus = httpStatus
    this.traceId = traceId
  }
}
