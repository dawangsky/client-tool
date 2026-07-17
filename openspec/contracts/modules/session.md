# 模块：多端会话（对齐后端 contracts/modules/session.md）

## API

| 方法 | 路径 | 说明 |
|------|------|------|
| GET | `/api/v1/sessions` | 当前用户会话列表 |
| POST | `/api/v1/auth/logout` | 登出当前设备 |
| DELETE | `/api/v1/sessions/{sessionId}` | 踢下线指定会话 |

登录 / 注册 body 附带：`deviceId`、`deviceType=mac`、`appVersion`。

## 客户端

- `src/utils/device.ts` · Rust `get_device_id`
- `src/api/session.ts` · `src/stores/auth.ts`
- `src/views/session/Devices.vue`
- `src/api/sessionWs.ts`：定时 `PING` 心跳；掉线后由服务端宽限撤销并从设备列表移除
