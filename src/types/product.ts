/** 与 openspec/contracts/modules/product.md 对齐 */

export type FundStatus =
  | 'NORMAL'
  | 'SUSPEND_PURCHASE'
  | 'SUSPEND_REDEEM'
  | 'CLOSED'

export type FundRiskLevel = 'R1' | 'R2' | 'R3' | 'R4' | 'R5'

export interface Fund {
  fundCode: string
  fundName: string
  taCode: string
  status: FundStatus
  riskLevel: FundRiskLevel
  /** 起购金额（分），运营可配置 */
  minPurchaseAmount: number
  minAdditionalAmount?: number
  purchaseAmountStep?: number
  cutOffTime: string
}

export interface FundNav {
  fundCode: string
  navDate: string
  nav: string
  accumNav: string
}

export interface FeeRate {
  feeType: string
  rate: string
  description?: string
}

export interface FundLimits {
  fundCode: string
  minPurchaseCent: number
  maxPurchaseCent: number
  minRedeemShare: string
  maxRedeemShare: string
}
