import { api } from '@/api/http'
import type {
  AuthToken,
  BankCard,
  BindCardRequest,
  Customer,
  KycRequest,
  LoginRequest,
  RegisterRequest,
  TaFundAccount,
  TaFundAccountApplyRequest,
  TradeAccount,
} from '@/types/account'

/** 登录/注册为 Sprint1 脚手架约定，contracts/account 未列路径时以后端为准同步 */
export function login(data: LoginRequest) {
  return api.post<AuthToken>('/auth/login', data)
}

export function register(data: RegisterRequest) {
  return api.post<AuthToken>('/auth/register', data)
}

export function getCustomerMe() {
  return api.get<Customer>('/customers/me')
}

export function submitKyc(data: KycRequest) {
  return api.post<Customer>('/customers/kyc', data)
}

/** 后端从鉴权上下文取客户，无需 body */
export function openTradeAccount() {
  return api.post<TradeAccount>('/trade-accounts', {})
}

export function getCurrentTradeAccount() {
  return api.get<TradeAccount>('/trade-accounts/current')
}

export function bindBankCard(data: BindCardRequest) {
  return api.post<BankCard>('/bank-cards', data)
}

export function listBankCards() {
  return api.get<BankCard[]>('/bank-cards')
}

export function applyTaFundAccount(data: TaFundAccountApplyRequest) {
  return api.post<TaFundAccount>('/ta-fund-accounts/apply', data)
}

export function listTaFundAccounts() {
  return api.get<TaFundAccount[]>('/ta-fund-accounts')
}
