/** 与 openspec/contracts/modules/trade.md 对齐 */

export type OrderType = 'PURCHASE' | 'REDEEM'

export type OrderStatus =
  | 'ACCEPTED'
  | 'PAYING'
  | 'PAID'
  | 'REPORTING'
  | 'CONFIRMED'
  | 'FAILED'
  | 'CANCELLED'
  | 'REFUNDING'
  | 'REFUNDED'
  | 'FROZEN'
  | 'PAYING_OUT'
  | 'COMPLETED'

export interface PurchaseRequest {
  tradeAccountId: string
  fundCode: string
  amountCent: number
  bankCardId: string
  suitabilityLogId: string
}

export interface RedeemRequest {
  tradeAccountId: string
  fundCode: string
  share: string
  bankCardId: string
}

export interface TradeOrder {
  orderNo: string
  type: OrderType
  fundCode: string
  fundName?: string
  amountCent?: number
  share?: string
  status: OrderStatus
  createdAt: string
  cutOffTime?: string
  canCancel?: boolean
}
