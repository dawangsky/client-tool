# 模块 2：产品中心

## 目标

基金信息、交易状态、费率/限额、净值、`ta_code` 路由。

## API（V1）

| 方法 | 路径 | 说明 |
|------|------|------|
| GET | `/api/v1/funds` | 可售基金列表（分页、筛选） |
| GET | `/api/v1/funds/{fundCode}` | 基金详情 |
| GET | `/api/v1/funds/{fundCode}/nav` | 最新净值 |
| GET | `/api/v1/funds/{fundCode}/fee-rates` | 费率 |
| GET | `/api/v1/funds/{fundCode}/limits` | 申购/赎回限额 |

## 基金详情字段（节选）

```json
{
  "fundCode": "000001",
  "fundName": "示例混合",
  "taCode": "99",
  "status": "NORMAL",
  "riskLevel": "R3",
  "minPurchaseAmount": 10000,
  "minAdditionalAmount": 10000,
  "purchaseAmountStep": 100,
  "cutOffTime": "15:00:00"
}
```

金额单位均为**分**。列表返回 `minPurchaseAmount`；详情含 `minAdditionalAmount`、`purchaseAmountStep`。落库 `fund_info`，运营平台后续可配置。

`status` 枚举：`NORMAL` | `SUSPEND_PURCHASE` | `SUSPEND_REDEEM` | `CLOSED`

## 业务规则

1. 下单前校验：产品状态、起购金额、递增步长、限额、交易日、截点时间。
2. 申购金额须 `>= minPurchaseAmount`，且 `(amount - min) % purchaseAmountStep == 0`（步长为 0 时不校验步长）。
3. `ta_code` 用于路由 TA 网关与基金账户。

## 验收

- [ ] 暂停申购的基金不可提交申购单
- [ ] 低于起购金额的申购被拒绝
- [ ] 不符合递增步长的申购被拒绝
- [ ] 净值、费率与运营配置一致
