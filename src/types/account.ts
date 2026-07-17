/** 与后端 /api/v1 账户模块实际字段对齐（见 fund-back DTO） */

export interface Customer {
  customerId: string
  mobile: string
  name?: string
  idType?: string
  /** 脱敏证件号 */
  idNo?: string
  idNoMasked?: string
  kycStatus: 'NONE' | 'PENDING' | 'PASSED' | 'REJECTED'
}

export interface DeviceAuthFields {
  deviceId?: string
  deviceType?: string
  userAgent?: string
  appVersion?: string
}

export interface LoginRequest extends DeviceAuthFields {
  mobile: string
  password: string
}

export interface RegisterRequest extends DeviceAuthFields {
  mobile: string
  password: string
  smsCode: string
}

export interface AuthToken {
  accessToken: string
  expiresIn: number
  /** 刷新令牌（长期），access 过期后静默续期 */
  refreshToken?: string
  refreshExpiresIn?: number
  sessionId?: string
  deviceType?: string
  customer: Customer
}

export interface KycRequest {
  name: string
  idType: string
  idNo: string
  mobile: string
}

export interface TradeAccount {
  tradeAccountId: string
  status: 'ACTIVE' | 'FROZEN' | 'CLOSED'
  customerId?: string
}

export interface BankCard {
  bankCardId: string
  bankCode?: string
  cardNoMask: string
  status: 'ACTIVE' | 'UNBOUND' | string
  channelAgreeNo?: string
}

export interface BindCardRequest {
  cardNo: string
  bankCode?: string
}

export interface TaFundAccount {
  fundAccountNo: string
  taCode: string
  status: string
  taFundAccountId?: string
}

export interface TaFundAccountApplyRequest {
  taCode: string
  tradeAccountId?: string
}
