/** 与 openspec/contracts/modules/position.md 对齐 */

export interface Position {
  fundCode: string
  fundName: string
  totalShare: string
  availableShare: string
  frozenShare: string
  nav: string
  marketValueCent: number
}

export interface PositionFlow {
  flowId: string
  fundCode: string
  fundName?: string
  changeShare: string
  bizType: string
  createdAt: string
  orderNo?: string
}
