# 模块 7：持仓

## 目标

确认后加/减仓、可用份额、交易明细；客户资产视图。

## API（V1）

| 方法 | 路径 | 说明 |
|------|------|------|
| GET | `/api/v1/positions` | 持仓列表（按交易账户） |
| GET | `/api/v1/positions/{fundCode}` | 单基金持仓 |
| GET | `/api/v1/position-flows` | 份额变动明细 |

### 持仓响应示例

```json
{
  "code": "0",
  "data": {
    "fundCode": "000001",
    "fundName": "示例混合",
    "totalShare": "5000.0000",
    "availableShare": "4500.0000",
    "frozenShare": "500.0000",
    "nav": "1.2345",
    "marketValueCent": 6172500
  }
}
```

## 业务规则

- 份额权威来源：TA `confirm_result` 过账后更新
- 赎回受理时冻结 `frozen_detail`，确认后扣减
- `availableShare = totalShare - frozenShare`

## 验收

- [ ] 申购确认后持仓增加正确
- [ ] 赎回冻结/扣减与订单状态一致
