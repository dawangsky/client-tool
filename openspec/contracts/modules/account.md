# 模块 1：客户与账户

## 目标

实名/KYC、交易账户、绑卡、向 TA 开户/登记并绑定基金账号。

## API（V1）

### C 端

| 方法 | 路径 | 说明 |
|------|------|------|
| POST | `/api/v1/customers/kyc` | 提交实名信息 |
| GET | `/api/v1/customers/me` | 当前客户资料 |
| POST | `/api/v1/trade-accounts` | 开通交易账户 |
| GET | `/api/v1/trade-accounts/current` | 当前交易账户 |
| POST | `/api/v1/bank-cards` | 绑卡（四要素/通道回调） |
| GET | `/api/v1/bank-cards` | 已绑卡列表 |
| POST | `/api/v1/ta-fund-accounts/apply` | 代向 TA 申请基金账户 |
| GET | `/api/v1/ta-fund-accounts` | 已登记基金账户列表 |

### 请求示例：开通交易账户

```json
POST /api/v1/trade-accounts
{ "customerId": "c_xxx" }
```

### 响应示例

```json
{
  "code": "0",
  "data": {
    "tradeAccountId": "ta_xxx",
    "status": "ACTIVE"
  }
}
```

## 业务规则

1. 未 KYC 通过不可开通交易账户。
2. 未绑卡不可发起申购扣款。
3. 下单前若目标基金 `ta_code` 无基金账户，先走 `ta-fund-accounts/apply`。
4. 同客户同 `ta_code` 复用已有 `fund_account_no`。

## 验收

- [ ] 新客完成 KYC → 交易账户 → 绑卡 → 基金账户申请全流程
- [ ] 重复申请同 TA 基金账户返回已有记录，不重复开户
