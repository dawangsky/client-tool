# 模块 4：交易

## 目标

申购、赎回、截点前撤单；`trade_order` 状态机；`order_no` 全链路主键。

## 订单类型（V1）

| type | 说明 |
|------|------|
| `PURCHASE` | 申购 |
| `REDEEM` | 赎回 |

## API（V1）

| 方法 | 路径 | 说明 |
|------|------|------|
| POST | `/api/v1/trade-orders/purchase` | 申购受理 |
| POST | `/api/v1/trade-orders/redeem` | 赎回受理 |
| POST | `/api/v1/trade-orders/{orderNo}/cancel` | 撤单（仅截点前） |
| GET | `/api/v1/trade-orders/{orderNo}` | 订单详情 |
| GET | `/api/v1/trade-orders` | 交易查询（分页） |

### 申购请求

```json
POST /api/v1/trade-orders/purchase
Headers: Idempotency-Key: <uuid>
{
  "tradeAccountId": "ta_xxx",
  "fundCode": "000001",
  "amountCent": 100000,
  "bankCardId": "bc_xxx",
  "suitabilityLogId": "sl_xxx"
}
```

### 赎回请求

```json
POST /api/v1/trade-orders/redeem
{
  "tradeAccountId": "ta_xxx",
  "fundCode": "000001",
  "share": "1000.0000",
  "bankCardId": "bc_xxx"
}
```

## 状态机

见 `backend/order-state-machine.md`。

| status | 说明 |
|--------|------|
| `ACCEPTED` | 已受理 |
| `PAYING` | 申购扣款中 |
| `PAID` | 扣款成功，待报 TA |
| `REPORTING` | 已报盘 |
| `CONFIRMED` | TA 确认成功 |
| `FAILED` | 确认失败（触发退款） |
| `CANCELLED` | 已撤单 |
| `REFUNDING` / `REFUNDED` | 退款中/已退款 |

赎回路径：`ACCEPTED` → `FROZEN` → `REPORTING` → `CONFIRMED` → `PAYING_OUT` → `COMPLETED`。

## 业务规则

- 下单前校验：适当性、产品可交易、限额、绑卡有效
- 撤单：仅 `ACCEPTED`/`PAYING` 且未过 `cutOffTime`
- 所有写操作必须幂等

## 验收

- [ ] `order_no` 可关联支付、清算记录
- [ ] 截点后撤单返回 `42204`
- [ ] 状态迁移有 `order_event` 审计
