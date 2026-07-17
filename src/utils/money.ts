/** 金额：分 ↔ 元；份额：4 位小数（openspec/specs/architecture.md） */

export function centToYuan(cent: number): string {
  return (cent / 100).toFixed(2)
}

export function yuanToCent(yuan: number | string): number {
  const n = typeof yuan === 'string' ? Number.parseFloat(yuan) : yuan
  return Math.round(n * 100)
}

export function formatShare(share: string | number): string {
  const n = typeof share === 'string' ? Number.parseFloat(share) : share
  return n.toFixed(4)
}
