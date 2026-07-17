/** 写操作幂等键（openspec/contracts/api-conventions.md） */

export function createIdempotencyKey(): string {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) {
    return crypto.randomUUID()
  }
  return `idem_${Date.now()}_${Math.random().toString(36).slice(2, 11)}`
}
