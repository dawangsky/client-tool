/**
 * 记住登录账号/密码（本地存储，仅便于重复登录；非安全加密）。
 * 密码做简单可逆编码，避免明文直接出现在 localStorage。
 */

const KEY = 'fund_remember_login'
const FLAG_KEY = 'fund_remember_login_enabled'

export interface RememberedLogin {
  mobile: string
  password: string
}

function encodePassword(password: string): string {
  try {
    return btoa(unescape(encodeURIComponent(password)))
  } catch {
    return password
  }
}

function decodePassword(encoded: string): string {
  try {
    return decodeURIComponent(escape(atob(encoded)))
  } catch {
    return encoded
  }
}

export function isRememberLoginEnabled(): boolean {
  return localStorage.getItem(FLAG_KEY) === '1'
}

export function loadRememberedLogin(): RememberedLogin | null {
  if (!isRememberLoginEnabled()) return null
  const raw = localStorage.getItem(KEY)
  if (!raw) return null
  try {
    const parsed = JSON.parse(raw) as { mobile?: string; passwordEnc?: string }
    if (!parsed.mobile) return null
    return {
      mobile: parsed.mobile,
      password: parsed.passwordEnc ? decodePassword(parsed.passwordEnc) : '',
    }
  } catch {
    return null
  }
}

/** 勾选记住：保存；取消勾选：清除 */
export function persistRememberLogin(enabled: boolean, mobile: string, password: string) {
  if (!enabled) {
    clearRememberedLogin()
    return
  }
  localStorage.setItem(FLAG_KEY, '1')
  localStorage.setItem(
    KEY,
    JSON.stringify({
      mobile: mobile.trim(),
      passwordEnc: encodePassword(password),
    }),
  )
}

export function clearRememberedLogin() {
  localStorage.removeItem(FLAG_KEY)
  localStorage.removeItem(KEY)
}
