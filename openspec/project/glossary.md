# 术语表

| 术语 | 英文/字段 | 说明 |
|------|-----------|------|
| 客户 | `customer` | 实名/KYC 主体 |
| 交易账户 | `trade_account` / `trade_account_id` | 销售侧账户，下单主体 |
| 基金账户 | `fund_account_no` + `ta_code` | TA 侧账户，按 TA 复用或新建 |
| 绑卡 | `bank_card` | 扣款/出款银行卡 |
| TA | Transfer Agent | 登记过户机构 |
| 订单号 | `order_no` | 全链路主键：交易、支付、清算 |
| 申购 | subscribe / purchase | 买入基金份额 |
| 赎回 | redeem | 卖出基金份额 |
| 截点 | cut-off time | 交易日截单时间，前后撤单规则不同 |
| 适当性 | suitability | 风险测评与产品匹配 |
| 净值 | `nav` | 基金单位净值 |
| 可用份额 | available shares | 可赎回份额（扣除冻结） |
| 确认 | confirm | TA 回写的份额/金额权威结果 |
