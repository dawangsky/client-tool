import { api } from '@/api/http'
import type {
  DisclosureConfirmRequest,
  DisclosureConfirmResult,
  MatchCheckRequest,
  MatchCheckResult,
  QuizPayload,
  QuizSubmitRequest,
  QuizSubmitResult,
  RiskLevelInfo,
} from '@/types/suitability'

export function getQuiz() {
  return api.get<QuizPayload>('/suitability/quiz')
}

export function submitQuiz(data: QuizSubmitRequest) {
  return api.post<QuizSubmitResult>('/suitability/quiz/submit', data)
}

export function getRiskLevel() {
  return api.get<RiskLevelInfo>('/suitability/risk-level')
}

export function matchCheck(data: MatchCheckRequest) {
  return api.post<MatchCheckResult>('/suitability/match-check', data)
}

export function confirmDisclosure(data: DisclosureConfirmRequest) {
  return api.post<DisclosureConfirmResult>('/suitability/disclosure/confirm', data)
}
