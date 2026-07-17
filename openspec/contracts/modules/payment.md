# 模块 5：支付/资金

## 目标

申购扣款、赎回出款、确认失败退款；`pay_order` + `capital_flow`。

## API（V1）

| 方法 | 路径 | 说明 |
|------|------|------|
| POST | `/api/v1/pay-orders/purchase` | 发起申购扣款（通常由交易服务内部调用） |
| GET | `/api/v1/pay-orders/{payOrderNo}` | 支付单详情 |
| POST | `/api/v1/pay-orders/callback` | 支付通道异步回调（内网） |
| POST | `/api/v1/refund-orders` | 发起退款 |
| GET | `/api/v1/capital-flows` | 资金流水查询 |

## 关联键

- `order_no` ← 关联交易订单
- `pay_order_no` / `refund_order_no` ← 支付域主键

## 状态

| pay_status | 说明 |
|------------|------|
| `INIT` | 已创建 |
| `PROCESSING` | 扣款/出款中 |
| `SUCCESS` | 成功 |
| `FAILED` | 失败 |

## 业务规则

- **申购**：`trade_order` 进入 `PAYING` 后创建 `pay_order`
- **支付成功 ≠ 申购成功**：仅表示可进入报 TA 流程
- **确认失败**：自动创建 `refund_order`，全额退回原卡
- 所有资金变动写 `capital_flow`（借贷方向、金额、关联单号）

## 验收

- [ ] 扣款成功/失败与 `order_no` 可追溯
- [ ] 确认失败自动退款且订单终态 `REFUNDED`
- [ ] 回调幂等、防重复记账
