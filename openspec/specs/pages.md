# 前端路由与页面（V1）

## C 端路由

| 路径 | 页面 | 契约模块 |
|------|------|----------|
| `/login` | 登录 | account |
| `/register` | 注册 | account |
| `/kyc` | 实名认证 | account |
| `/open-account` | 开户 | account |
| `/bind-card` | 绑卡 | account |
| `/risk-quiz` | 风险测评 | suitability |
| `/funds` | 产品列表 | product |
| `/funds/:fundCode` | 产品详情（含适当性校验入口） | product + suitability |
| `/purchase/:fundCode` | 申购 | trade + payment |
| `/redeem/:fundCode` | 赎回 | trade |
| `/orders` | 交易记录 | trade |
| `/orders/:orderNo` | 订单详情 | trade + document |
| `/positions` | 我的持仓 | position |
| `/positions/:fundCode` | 持仓详情 | position |
| `/messages` | 消息中心 | document |

## 运营后台路由（`fund-admin`）

| 路径 | 页面 | 契约模块 |
|------|------|----------|
| `/admin/login` | 运营登录 | admin |
| `/admin/orders` | 订单查询 | admin + trade |
| `/admin/orders/:orderNo` | 全链路视图 | admin |
| `/admin/funds` | 产品管理 | admin + product |
| `/admin/recon` | 对账与差错 | reconciliation |
| `/admin/clear-batches` | 清算批次 | clearing |
| `/admin/params` | 系统参数 | admin |

## 关键交互流

### 申购

```text
产品详情 → 适当性/揭示确认 → 输入金额选卡 → 提交订单
→ 支付结果 → 订单详情（状态轮询至确认）
```

### 赎回

```text
持仓详情 → 输入份额 → 确认 → 订单详情 → 出款结果
```

## 验收（前端）

- [ ] 适当性未通过不可进入申购页
- [ ] 订单详情展示状态与 `contracts/modules/trade.md` 一致
- [ ] 截点后撤单按钮禁用并提示
