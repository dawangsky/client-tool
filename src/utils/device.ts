/**
 * 设备标识：Tauri 下由 Rust 持久化；纯 Vite 浏览器开发用 localStorage 降级。
 */
const WEB_FALLBACK_KEY = 'fund_device_id'

function webFallbackId(): string {
  let id = localStorage.getItem(WEB_FALLBACK_KEY)
  if (!id) {
    id = `web_${crypto.randomUUID()}`
    localStorage.setItem(WEB_FALLBACK_KEY, id)
  }
  return id
}

export async function getOrCreateDeviceId(): Promise<string> {
  try {
    const { invoke } = await import('@tauri-apps/api/core')
    const id = await invoke<string>('get_device_id')
    if (id) return id
  } catch {
    /* 非 Tauri 环境（vite only） */
  }
  return webFallbackId()
}
