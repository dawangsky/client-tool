/**
 * Mock 适配层：VITE_USE_MOCK=true 时拦截 /api/v1 请求。
 * 字段与 openspec/contracts/modules/* 对齐，便于切真实后端。
 */
import type { ApiResponse, PageResult } from '@/types/api'
import type {
  AuthToken,
  BankCard,
  Customer,
  TaFundAccount,
  TradeAccount,
} from '@/types/account'
import type { FeeRate, Fund, FundLimits, FundNav } from '@/types/product'
import type {
  DisclosureConfirmResult,
  MatchCheckResult,
  QuizQuestion,
  QuizSubmitResult,
  RiskLevelInfo,
} from '@/types/suitability'
import type { TradeOrder } from '@/types/trade'
import type { Position, PositionFlow } from '@/types/position'
import type { UserMessage } from '@/types/document'
import type { DeviceSession } from '@/types/session'
import { ApiError } from '@/types/api'

export const useMock = import.meta.env.VITE_USE_MOCK === 'true'

const delay = (ms = 200) => new Promise((r) => setTimeout(r, ms))

function ok<T>(data: T): ApiResponse<T> {
  return { code: '0', message: 'ok', data, traceId: crypto.randomUUID() }
}

const mockFunds: Fund[] = [
  {
    fundCode: '000001',
    fundName: '示例混合基金',
    taCode: '99',
    status: 'NORMAL',
    riskLevel: 'R3',
    minPurchaseAmount: 10000,
    minAdditionalAmount: 10000,
    purchaseAmountStep: 100,
    cutOffTime: '15:00:00',
  },
  {
    fundCode: '000002',
    fundName: '示例债券基金',
    taCode: '99',
    status: 'NORMAL',
    riskLevel: 'R2',
    minPurchaseAmount: 100000,
    minAdditionalAmount: 10000,
    purchaseAmountStep: 100,
    cutOffTime: '15:00:00',
  },
  {
    fundCode: '110011',
    fundName: '暂停申购示例',
    taCode: '01',
    status: 'SUSPEND_PURCHASE',
    riskLevel: 'R4',
    minPurchaseAmount: 10000,
    minAdditionalAmount: 10000,
    purchaseAmountStep: 100,
    cutOffTime: '15:00:00',
  },
]

const mockOrders: TradeOrder[] = []

let mockCustomer: Customer = {
  customerId: 'c_demo',
  mobile: '138****8888',
  name: '演示用户',
  idNo: '1101**********1234',
  kycStatus: 'NONE',
}

let mockTradeAccount: TradeAccount | null = null
let mockCards: BankCard[] = []
let mockRisk: RiskLevelInfo | null = null
const mockUserMessages: UserMessage[] = [
  {
    messageId: 'm1',
    title: '申购已受理',
    content: '您申购示例混合基金的订单已受理，等待确认。',
    read: false,
    createdAt: '2026-07-15T14:20:00+08:00',
    category: 'TRADE',
  },
  {
    messageId: 'm2',
    title: '风险测评有效期提醒',
    content: '请定期复核风险承受能力，测评过期将影响交易。',
    read: true,
    createdAt: '2026-07-01T09:00:00+08:00',
    category: 'SUITABILITY',
  },
]

function pathOf(url: string): string {
  return url.replace(/^\/api\/v1/, '').replace(/^\//, '')
}

export async function handleMockRequest<T>(
  method: string,
  url: string,
  data?: unknown,
): Promise<T> {
  await delay()
  const m = method.toLowerCase()
  const path = pathOf(url)
  const body = (data || {}) as Record<string, unknown>

  // —— auth（contracts 未列登录注册，Sprint1 脚手架约定）——
  if (m === 'post' && path === 'auth/login') {
    mockCustomer = { ...mockCustomer, mobile: String(body.mobile || mockCustomer.mobile) }
    const token: AuthToken = {
      accessToken: 'mock_token_' + Date.now(),
      expiresIn: 7200,
      refreshToken: 'mock_refresh_' + Date.now(),
      refreshExpiresIn: 2592000,
      customer: mockCustomer,
    }
    return ok(token).data as T
  }
  if (m === 'post' && path === 'auth/refresh') {
    const token: AuthToken = {
      accessToken: 'mock_token_' + Date.now(),
      expiresIn: 7200,
      refreshToken: 'mock_refresh_' + Date.now(),
      refreshExpiresIn: 2592000,
      customer: mockCustomer,
    }
    return ok(token).data as T
  }
  if (m === 'post' && path === 'auth/register') {
    mockCustomer = {
      customerId: 'c_' + Date.now(),
      mobile: String(body.mobile),
      kycStatus: 'NONE',
    }
    const token: AuthToken = {
      accessToken: 'mock_token_' + Date.now(),
      expiresIn: 7200,
      refreshToken: 'mock_refresh_' + Date.now(),
      refreshExpiresIn: 2592000,
      customer: mockCustomer,
    }
    return ok(token).data as T
  }

  // —— account ——
  if (m === 'get' && path === 'customers/me') {
    return ok(mockCustomer).data as T
  }
  if (m === 'post' && path === 'customers/kyc') {
    if (mockCustomer.kycStatus === 'PASSED') {
      return ok(mockCustomer).data as T
    }
    mockCustomer = {
      ...mockCustomer,
      name: String(body.name),
      idType: String(body.idType || 'ID_CARD'),
      idNo: String(body.idNo).replace(/^(.{4}).*(.{4})$/, '$1**********$2'),
      mobile: String(body.mobile || mockCustomer.mobile),
      kycStatus: 'PASSED',
    }
    return ok(mockCustomer).data as T
  }
  if (m === 'post' && path === 'trade-accounts') {
    if (mockCustomer.kycStatus !== 'PASSED') {
      throw new ApiError('40001', '未 KYC 通过不可开通交易账户', 400)
    }
    if (mockTradeAccount) {
      return ok(mockTradeAccount).data as T
    }
    mockTradeAccount = { tradeAccountId: 'ta_demo', status: 'ACTIVE' }
    return ok(mockTradeAccount).data as T
  }
  if (m === 'get' && path === 'trade-accounts/current') {
    if (!mockTradeAccount) throw new ApiError('40401', '交易账户不存在，请先开通', 404)
    return ok(mockTradeAccount).data as T
  }
  if (m === 'post' && path === 'bank-cards') {
    if (!mockTradeAccount) throw new ApiError('40401', '交易账户不存在，请先开通', 404)
    const cardNo = String(body.cardNo || '').replace(/\s/g, '')
    const cardNoMask = cardNo.replace(/^(.{4}).*(.{4})$/, '$1****$2')
    const existing = mockCards.find((c) => c.cardNoMask === cardNoMask && c.status === 'ACTIVE')
    if (existing) {
      return ok(existing).data as T
    }
    const card: BankCard = {
      bankCardId: 'bc_' + Date.now(),
      bankCode: String(body.bankCode || 'MOCK'),
      cardNoMask,
      status: 'ACTIVE',
    }
    mockCards.push(card)
    return ok(card).data as T
  }
  if (m === 'get' && path === 'bank-cards') {
    return ok(mockCards).data as T
  }
  if (m === 'post' && path === 'ta-fund-accounts/apply') {
    const acc: TaFundAccount = {
      fundAccountNo: 'fa_' + String(body.taCode),
      taCode: String(body.taCode),
      status: 'ACTIVE',
    }
    return ok(acc).data as T
  }
  if (m === 'get' && path === 'ta-fund-accounts') {
    return ok([] as TaFundAccount[]).data as T
  }

  // —— product ——
  if (m === 'get' && path === 'funds') {
    const page: PageResult<Fund> = {
      list: mockFunds,
      total: mockFunds.length,
      page: 1,
      pageSize: 20,
    }
    return ok(page).data as T
  }
  if (m === 'get' && /^funds\/[^/]+$/.test(path)) {
    const code = path.split('/')[1]
    const fund = mockFunds.find((f) => f.fundCode === code)
    if (!fund) throw new ApiError('40401', '基金不存在', 404)
    return ok(fund).data as T
  }
  if (m === 'get' && /^funds\/[^/]+\/nav$/.test(path)) {
    const code = path.split('/')[1]
    const nav: FundNav = {
      fundCode: code,
      navDate: '2026-07-15',
      nav: '1.2345',
      accumNav: '2.3456',
    }
    return ok(nav).data as T
  }
  if (m === 'get' && /^funds\/[^/]+\/fee-rates$/.test(path)) {
    const rates: FeeRate[] = [
      { feeType: 'PURCHASE', rate: '0.0150', description: '申购费率' },
      { feeType: 'REDEEM', rate: '0.0050', description: '赎回费率' },
    ]
    return ok(rates).data as T
  }
  if (m === 'get' && /^funds\/[^/]+\/limits$/.test(path)) {
    const code = path.split('/')[1]
    const limits: FundLimits = {
      fundCode: code,
      minPurchaseCent: 10000,
      maxPurchaseCent: 500000000,
      minRedeemShare: '1.0000',
      maxRedeemShare: '9999999.0000',
    }
    return ok(limits).data as T
  }

  // —— suitability ——
  if (m === 'get' && path === 'suitability/quiz') {
    const questions: QuizQuestion[] = [
      {
        id: 'q1',
        title: '您的年龄区间？',
        options: [
          { key: 'A', text: '60岁以上', score: 1 },
          { key: 'B', text: '40-60', score: 3 },
          { key: 'C', text: '40岁以下', score: 5 },
        ],
      },
      {
        id: 'q2',
        title: '您的投资经验？',
        options: [
          { key: 'A', text: '无经验', score: 1 },
          { key: 'B', text: '1-3年', score: 3 },
          { key: 'C', text: '3年以上', score: 5 },
        ],
      },
      {
        id: 'q3',
        title: '可承受的最大亏损？',
        options: [
          { key: 'A', text: '5%以内', score: 1 },
          { key: 'B', text: '10%-20%', score: 3 },
          { key: 'C', text: '20%以上', score: 5 },
        ],
      },
    ]
    return ok({ version: 'v1.0', questions }).data as T
  }
  if (m === 'post' && path === 'suitability/quiz/submit') {
    if (mockRisk && mockRisk.expireAt && new Date(mockRisk.expireAt).getTime() > Date.now()) {
      throw new ApiError('40901', '距上次测评未满15天，请查看当前测评结果', 409)
    }
    const answers = (body.answers || {}) as Record<string, string>
    const expire = new Date()
    expire.setDate(expire.getDate() + 15)
    mockRisk = {
      customerRiskLevel: 'C3',
      quizVersion: 'v1.0',
      score: Object.keys(answers).length * 3,
      expireAt: expire.toISOString(),
      assessedAt: new Date().toISOString(),
      validityDays: 15,
    }
    const result: QuizSubmitResult = { ...mockRisk }
    return ok(result).data as T
  }
  if (m === 'get' && path === 'suitability/risk-level') {
    if (!mockRisk) throw new ApiError('40001', '请先完成风险测评', 400)
    return ok(mockRisk).data as T
  }
  if (m === 'post' && path === 'suitability/match-check') {
    const fund = mockFunds.find((f) => f.fundCode === body.fundCode)
    if (!mockRisk) throw new ApiError('40001', '请先完成风险测评', 400)
    const result: MatchCheckResult = {
      matched: true,
      customerRiskLevel: mockRisk.customerRiskLevel,
      fundRiskLevel: fund?.riskLevel || 'R3',
      needDisclosure: true,
      suitabilityLogId: 'sl_' + Date.now(),
    }
    return ok(result).data as T
  }
  if (m === 'post' && path === 'suitability/disclosure/confirm') {
    const result: DisclosureConfirmResult = {
      suitabilityLogId: 'sl_' + Date.now(),
      disclosureVersion: String(body.disclosureVersion || 'v1.0'),
    }
    return ok(result).data as T
  }

  // —— trade ——
  if (m === 'post' && path === 'trade-orders/purchase') {
    const order: TradeOrder = {
      orderNo: 'PO' + Date.now(),
      type: 'PURCHASE',
      fundCode: String(body.fundCode),
      fundName: mockFunds.find((f) => f.fundCode === body.fundCode)?.fundName,
      amountCent: Number(body.amountCent),
      status: 'ACCEPTED',
      createdAt: new Date().toISOString(),
      cutOffTime: '15:00:00',
      canCancel: true,
    }
    mockOrders.unshift(order)
    return ok(order).data as T
  }
  if (m === 'post' && path === 'trade-orders/redeem') {
    const order: TradeOrder = {
      orderNo: 'RO' + Date.now(),
      type: 'REDEEM',
      fundCode: String(body.fundCode),
      share: String(body.share),
      status: 'ACCEPTED',
      createdAt: new Date().toISOString(),
      canCancel: true,
    }
    mockOrders.unshift(order)
    return ok(order).data as T
  }
  if (m === 'post' && /^trade-orders\/[^/]+\/cancel$/.test(path)) {
    const orderNo = path.split('/')[1]
    const order = mockOrders.find((o) => o.orderNo === orderNo)
    if (!order) throw new ApiError('40401', '订单不存在', 404)
    if (!order.canCancel) throw new ApiError('42204', '已过截点不可撤单', 422)
    order.status = 'CANCELLED'
    order.canCancel = false
    return ok(order).data as T
  }
  if (m === 'get' && /^trade-orders\/[^/]+$/.test(path)) {
    const orderNo = path.split('/')[1]
    const order = mockOrders.find((o) => o.orderNo === orderNo)
    if (!order) throw new ApiError('40401', '订单不存在', 404)
    return ok(order).data as T
  }
  if (m === 'get' && path === 'trade-orders') {
    const page: PageResult<TradeOrder> = {
      list: mockOrders,
      total: mockOrders.length,
      page: 1,
      pageSize: 20,
    }
    return ok(page).data as T
  }

  // —— position ——
  if (m === 'get' && path === 'positions') {
    const list: Position[] = [
      {
        fundCode: '000001',
        fundName: '示例混合基金',
        totalShare: '5000.0000',
        availableShare: '4500.0000',
        frozenShare: '500.0000',
        nav: '1.2345',
        marketValueCent: 6172500,
      },
      {
        fundCode: '000002',
        fundName: '示例债券基金',
        totalShare: '12000.0000',
        availableShare: '12000.0000',
        frozenShare: '0.0000',
        nav: '1.0520',
        marketValueCent: 12624000,
      },
    ]
    return ok(list).data as T
  }
  if (m === 'get' && /^positions\/[^/]+$/.test(path)) {
    const code = path.split('/')[1]
    const demo: Position[] = [
      {
        fundCode: '000001',
        fundName: '示例混合基金',
        totalShare: '5000.0000',
        availableShare: '4500.0000',
        frozenShare: '500.0000',
        nav: '1.2345',
        marketValueCent: 6172500,
      },
      {
        fundCode: '000002',
        fundName: '示例债券基金',
        totalShare: '12000.0000',
        availableShare: '12000.0000',
        frozenShare: '0.0000',
        nav: '1.0520',
        marketValueCent: 12624000,
      },
    ]
    const pos = demo.find((p) => p.fundCode === code)
    if (!pos) throw new ApiError('40401', '持仓不存在', 404)
    return ok(pos).data as T
  }
  if (m === 'get' && path.startsWith('position-flows')) {
    const flows: PositionFlow[] = [
      {
        flowId: 'pf1',
        fundCode: '000001',
        fundName: '示例混合基金',
        changeShare: '5000.0000',
        bizType: 'PURCHASE_CONFIRM',
        createdAt: '2026-07-10T10:00:00+08:00',
        orderNo: 'PO_DEMO_1',
      },
    ]
    const page: PageResult<PositionFlow> = {
      list: flows,
      total: flows.length,
      page: 1,
      pageSize: 20,
    }
    return ok(page).data as T
  }

  // —— messages ——
  if (m === 'get' && (path === 'messages' || path.startsWith('messages?'))) {
    const page: PageResult<UserMessage> = {
      list: mockUserMessages,
      total: mockUserMessages.length,
      page: 1,
      pageSize: 20,
    }
    return ok(page).data as T
  }
  if (m === 'post' && /^messages\/[^/]+\/read$/.test(path)) {
    const id = path.split('/')[1]
    const msg = mockUserMessages.find((x) => x.messageId === id)
    if (!msg) throw new ApiError('40401', '消息不存在', 404)
    msg.read = true
    return ok(msg).data as T
  }

  // —— sessions（对齐后端 /sessions · /auth/logout）——
  if (m === 'get' && path === 'sessions') {
    const list: DeviceSession[] = [
      {
        sessionId: 'sess_mac_current',
        deviceId: 'mac_demo',
        deviceType: 'mac',
        deviceName: '本机 Mac',
        appVersion: '0.1.0',
        loginAt: new Date().toISOString(),
        lastActiveAt: new Date().toISOString(),
        current: true,
      },
      {
        sessionId: 'sess_web_1',
        deviceId: 'web_demo',
        deviceType: 'web',
        deviceName: 'Chrome · macOS',
        appVersion: 'web',
        loginAt: '2026-07-14T08:00:00+08:00',
        lastActiveAt: '2026-07-15T18:00:00+08:00',
        current: false,
      },
    ]
    return ok(list).data as T
  }
  if (m === 'post' && path === 'auth/logout') {
    return ok(undefined).data as T
  }
  if (m === 'delete' && /^sessions\/[^/]+$/.test(path)) {
    return ok(undefined).data as T
  }

  // —— audit（客户端补报；mock 吞掉）——
  if (m === 'post' && path === 'audit/events') {
    return ok(undefined).data as T
  }

  throw new ApiError('40401', `Mock 未实现: ${m.toUpperCase()} ${path}`, 404)
}
