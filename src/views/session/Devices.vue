<template>
  <div>
    <p class="page-sub">
      同一账号可多端登录。Web 登录/退出会经 WebSocket 实时同步到本列表，无需切换菜单重拉。
    </p>
    <div v-if="sessionsStore.error" class="alert alert-error">{{ sessionsStore.error }}</div>
    <div v-if="error" class="alert alert-error">{{ error }}</div>
    <div v-if="msg" class="alert alert-ok">{{ msg }}</div>
    <p class="device-id">本机 deviceId：<code>{{ deviceId || '…' }}</code></p>

    <div class="panel auth-box">
      <h3>授权 Web 登录</h3>
      <p class="hint">在 Web 登录页点击「授权登录」后，将 6 位授权码填入此处确认。</p>
      <div class="field-row">
        <input
          v-model="ticketCode"
          class="code-input"
          maxlength="6"
          placeholder="授权码"
          @keyup.enter="onAuthorize"
        />
        <button class="btn btn-primary" type="button" :disabled="authLoading" @click="onAuthorize">
          {{ authLoading ? '授权中…' : '授权登录' }}
        </button>
      </div>
    </div>

    <div class="panel table-wrap">
      <table class="data-table" v-if="sessionsStore.sessions.length">
        <thead>
          <tr>
            <th>设备</th>
            <th>类型</th>
            <th>登录时间</th>
            <th>最后活跃</th>
            <th></th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="s in sessionsStore.sessions" :key="s.sessionId">
            <td>
              <span :title="s.userAgent || undefined">{{ s.deviceName || s.deviceId }}</span>
              <span v-if="s.current" class="cur">当前</span>
            </td>
            <td>{{ s.deviceType }}</td>
            <td>{{ s.loginAt }}</td>
            <td>{{ s.lastActiveAt }}</td>
            <td>
              <button
                v-if="!s.current"
                class="btn btn-danger"
                type="button"
                @click="onRevoke(s.sessionId)"
              >
                下线
              </button>
              <span v-else>—</span>
            </td>
          </tr>
        </tbody>
      </table>
      <p v-else class="empty">{{ sessionsStore.loading ? '加载中…' : '暂无会话' }}</p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { authorizeWebLogin } from '@/api/authTicket'
import { useSessionsStore } from '@/stores/sessions'
import { getOrCreateDeviceId } from '@/utils/device'

const sessionsStore = useSessionsStore()
const deviceId = ref('')
const error = ref('')
const msg = ref('')
const ticketCode = ref('')
const authLoading = ref(false)

async function onRevoke(sessionId: string) {
  error.value = ''
  msg.value = ''
  try {
    await sessionsStore.revoke(sessionId)
    msg.value = '已请求下线该设备（对方将通过 WebSocket 实时退出）'
  } catch (e) {
    error.value = e instanceof Error ? e.message : '操作失败'
  }
}

async function onAuthorize() {
  error.value = ''
  msg.value = ''
  if (!ticketCode.value.trim()) {
    error.value = '请输入授权码'
    return
  }
  authLoading.value = true
  try {
    await authorizeWebLogin(ticketCode.value.trim())
    msg.value = '已授权 Web 登录'
    ticketCode.value = ''
    // 授权成功后服务端会推 SESSIONS_CHANGED(LOGIN)；此处再拉一次兜底
    await sessionsStore.refresh()
  } catch (e) {
    error.value = e instanceof Error ? e.message : '授权失败'
  } finally {
    authLoading.value = false
  }
}

onMounted(async () => {
  deviceId.value = await getOrCreateDeviceId()
  try {
    await sessionsStore.refresh()
  } catch {
    /* store.error 已记录 */
  }
})
</script>

<style scoped>
.device-id {
  font-size: 0.85rem;
  color: var(--text-secondary);
  margin: 0 0 1rem;
}
.device-id code {
  font-family: var(--font-mono);
  font-size: 0.8rem;
  background: var(--surface-muted);
  padding: 0.15rem 0.4rem;
  border-radius: 4px;
}
.cur {
  margin-left: 0.4rem;
  font-size: 0.7rem;
  color: var(--brand-accent);
  border: 1px solid var(--brand-accent);
  padding: 0.05rem 0.35rem;
  border-radius: 3px;
}
.auth-box {
  padding: 1.25rem 1.5rem;
  margin-bottom: 1rem;
  max-width: 520px;
}
.auth-box h3 {
  margin: 0 0 0.5rem;
  font-size: 1rem;
}
.hint {
  margin: 0 0 0.85rem;
  font-size: 0.85rem;
  color: var(--text-secondary);
}
.field-row {
  display: flex;
  gap: 0.5rem;
}
.code-input {
  flex: 1;
  letter-spacing: 0.2em;
  text-transform: uppercase;
  font-family: var(--font-mono);
  font-size: 1.1rem;
  padding: 0.5rem 0.75rem;
  border: 1px solid var(--border-subtle);
  border-radius: 6px;
}
</style>
