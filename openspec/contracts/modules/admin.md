# 模块 10：运营后台

## 目标

参数配置、查单、差错处理入口。路由前缀 `/api/v1/admin`，需 `ADMIN`/`OPS` 角色。

## API（V1 节选）

| 方法 | 路径 | 说明 |
|------|------|------|
| GET | `/api/v1/admin/trade-orders` | 全量订单查询 |
| GET | `/api/v1/admin/trade-orders/{orderNo}` | 订单全链路视图（交易+支付+清算） |
| GET | `/api/v1/admin/funds` | 产品维护列表 |
| PUT | `/api/v1/admin/funds/{fundCode}/status` | 上下架/暂停交易 |
| GET | `/api/v1/admin/system-params` | 系统参数（截点时间等） |
| PUT | `/api/v1/admin/system-params/{key}` | 更新参数 |

## 前端

见 `specs/pages.md` — `Admin*` 路由。

## 验收

- [ ] 运营可按 `order_no` 查看三域数据
- [ ] 差错处理入口可关联 `recon_diff`
