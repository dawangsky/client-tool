# 模块 6：清算 + TA 网关

## 目标

组文件/报盘、收确认、回写订单与持仓。主要供 **后端批处理 + 运营后台**；C 端不直接调用。

## 内部 API / 任务（V1）

| 类型 | 说明 |
|------|------|
| Job | `ClearBatchSubmitJob` — 日切后组 `clear_detail` 报 TA |
| Job | `ConfirmResultPollJob` — 拉取/接收 TA 确认文件 |
| Job | `ConfirmWriteBackJob` — 回写 `trade_order`、触发持仓过账 |
| GET | `/api/v1/admin/clear-batches` | 运营查批次 |
| GET | `/api/v1/admin/clear-batches/{batchNo}` | 批次明细 |

## 主表

- `clear_batch` — 清算批次（交易日、TA、状态）
- `clear_detail` — 明细（关联 `order_no`）
- `ta_file` — 报盘/回盘文件元数据
- `confirm_result` — TA 确认结果（份额、金额、费用、失败原因）

## 业务规则

- 仅 `PAID`（申购）或已冻结份额（赎回）的订单进入报盘
- 确认成功 → 订单 `CONFIRMED` → 持仓过账
- 确认失败 → 订单 `FAILED` → 触发退款（申购）
- `ta_code` 路由：产品中心提供

## 验收

- [ ] 确认结果与 `order_no` 一一对应
- [ ] 监控：已扣款未报盘、报盘未回确认超时告警
