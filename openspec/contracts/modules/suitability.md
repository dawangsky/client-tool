# 模块 3：适当性

## 目标

风险测评、产品风险匹配、揭示确认留痕。

## API（V1）

| 方法 | 路径 | 说明 |
|------|------|------|
| GET | `/api/v1/suitability/quiz` | 风测题目 |
| POST | `/api/v1/suitability/quiz/submit` | 提交风测 |
| GET | `/api/v1/suitability/risk-level` | 当前客户风险等级 |
| POST | `/api/v1/suitability/match-check` | 下单前匹配校验 |
| POST | `/api/v1/suitability/disclosure/confirm` | 揭示书确认留痕 |

## 匹配校验请求

```json
POST /api/v1/suitability/match-check
{
  "fundCode": "000001",
  "tradeType": "PURCHASE"
}
```

## 响应

```json
{
  "code": "0",
  "data": {
    "matched": true,
    "customerRiskLevel": "C3",
    "fundRiskLevel": "R3",
    "needDisclosure": true
  }
}
```

不匹配时 `code=42201`，`matched=false`。

## 业务规则

1. 风测过期（如 1 年）需重新测评。
2. 不匹配 **禁止** 创建交易订单。
3. 每次交易前揭示确认写入 `suitability_log`（含 IP、时间、协议版本）。

## 验收

- [ ] 不匹配产品阻断下单并留痕
- [ ] 揭示确认记录可审计查询
