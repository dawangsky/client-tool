# 模块 8：对账

## 目标

支付通道对账 + TA 确认对账 + 衔接监控（已扣款未报盘、确认失败未退款）。

## API（运营后台 V1）

| 方法 | 路径 | 说明 |
|------|------|------|
| POST | `/api/v1/admin/recon-tasks` | 触发对账任务 |
| GET | `/api/v1/admin/recon-tasks` | 对账任务列表 |
| GET | `/api/v1/admin/recon-diffs` | 差异明细 |
| PATCH | `/api/v1/admin/recon-diffs/{id}` | 差错处理（备注/状态） |

## 对账类型

| type | 说明 |
|------|------|
| `PAY_CHANNEL` | 支付通道 vs `pay_order`/`capital_flow` |
| `TA_CONFIRM` | TA 确认 vs 本地 `confirm_result`/`trade_order` |
| `BRIDGE` | 衔接：扣款成功未报盘、失败未退款等 |

## 验收

- [ ] 日终可产出对账结果与差异清单
- [ ] 差异可关联 `order_no` 追溯
