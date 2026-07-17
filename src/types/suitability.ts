/** 与后端 /api/v1 适当性模块实际字段对齐 */

export type CustomerRiskLevel = 'C1' | 'C2' | 'C3' | 'C4' | 'C5'
export type TradeType = 'PURCHASE' | 'REDEEM'

export interface QuizOption {
  key: string
  text: string
  score: number
}

export interface QuizQuestion {
  id: string
  title: string
  options: QuizOption[]
}

export interface QuizPayload {
  version: string
  questions: QuizQuestion[]
}

/** 答案：questionId → optionKey，如 { q1: "B", q2: "C" } */
export interface QuizSubmitRequest {
  answers: Record<string, string>
}

export interface QuizSubmitResult {
  customerRiskLevel: CustomerRiskLevel
  score: number
  quizVersion: string
  expireAt: string
  assessedAt?: string
  validityDays?: number
}

export interface RiskLevelInfo {
  customerRiskLevel: CustomerRiskLevel
  quizVersion: string
  score: number
  expireAt: string
  assessedAt?: string
  validityDays?: number
}

export interface MatchCheckRequest {
  fundCode: string
  tradeType: TradeType
}

export interface MatchCheckResult {
  matched: boolean
  customerRiskLevel: CustomerRiskLevel
  fundRiskLevel: string
  needDisclosure: boolean
  suitabilityLogId?: string
}

export interface DisclosureConfirmRequest {
  fundCode: string
  tradeType: TradeType
  disclosureVersion?: string
}

export interface DisclosureConfirmResult {
  suitabilityLogId: string
  disclosureVersion?: string
}
