import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type { Customer } from '@/types/account'
import { login as loginApi, register as registerApi, getCustomerMe } from '@/api/account'
import { logoutCurrentSession } from '@/api/session'
import { getAccessToken, setAccessToken, setRefreshToken } from '@/api/http'
import { reportAudit, flushAuditQueue } from '@/api/audit'
import { getOrCreateDeviceId } from '@/utils/device'

const APP_VERSION = '0.1.0'

async function devicePayload() {
  const deviceId = await getOrCreateDeviceId()
  return {
    deviceId,
    deviceType: import.meta.env.VITE_DEVICE_TYPE || 'mac',
    userAgent: `fund-mac/${APP_VERSION}`,
    appVersion: APP_VERSION,
  }
}

export const useAuthStore = defineStore('auth', () => {
  const token = ref<string | null>(getAccessToken())
  const customer = ref<Customer | null>(null)

  const isLoggedIn = computed(() => !!token.value)

  async function login(mobile: string, password: string) {
    try {
      const data = await loginApi({
        mobile,
        password,
        ...(await devicePayload()),
      })
      if (!data?.accessToken) {
        throw new Error('登录响应缺少 accessToken，请检查 API 是否指向 Java 后端')
      }
      token.value = data.accessToken
      customer.value = data.customer
      setAccessToken(data.accessToken)
      setRefreshToken(data.refreshToken ?? null)
      await reportAudit({ action: 'LOGIN_SUCCESS', result: 'SUCCESS', objectId: mobile })
      void flushAuditQueue()
    } catch (e) {
      await reportAudit({
        action: 'LOGIN_FAIL',
        result: 'FAIL',
        objectId: mobile,
        detail: { message: e instanceof Error ? e.message : String(e) },
      })
      throw e
    }
  }

  async function register(mobile: string, password: string, smsCode: string) {
    const data = await registerApi({
      mobile,
      password,
      smsCode,
      ...(await devicePayload()),
    })
    if (!data?.accessToken) {
      throw new Error('注册响应缺少 accessToken，请检查 API 是否指向 Java 后端')
    }
    token.value = data.accessToken
    customer.value = data.customer
    setAccessToken(data.accessToken)
    setRefreshToken(data.refreshToken ?? null)
    await reportAudit({ action: 'LOGIN_SUCCESS', result: 'SUCCESS', objectId: mobile })
  }

  async function fetchMe() {
    if (!token.value) return
    customer.value = await getCustomerMe()
  }

  async function logout() {
    try {
      await logoutCurrentSession()
    } catch {
      /* 忽略登出接口失败，仍清本地态 */
    }
    await reportAudit({ action: 'LOGOUT', result: 'SUCCESS' })
    clearLocalSession()
  }

  /** 仅清本地（SESSION_REVOKED / 被踢时用） */
  function clearLocalSession() {
    token.value = null
    customer.value = null
    setAccessToken(null)
    setRefreshToken(null)
  }

  return { token, customer, isLoggedIn, login, register, fetchMe, logout, clearLocalSession }
})
