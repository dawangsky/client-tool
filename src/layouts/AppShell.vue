<template>
  <div class="shell">
    <aside class="sidebar">
      <div class="brand">
        <img class="brand-logo" src="/logo.png" width="40" height="40" alt="财富基金" />
        <div class="brand-copy">
          <strong>财富基金</strong>
          <span>客户端</span>
        </div>
      </div>

      <nav class="nav">
        <p class="nav-label">总览</p>
        <router-link to="/">资产首页</router-link>
        <router-link to="/funds">产品</router-link>

        <p class="nav-label">交易</p>
        <router-link to="/positions">持仓</router-link>
        <router-link to="/orders">订单</router-link>
        <router-link to="/messages">消息</router-link>

        <p class="nav-label">账户</p>
        <router-link to="/risk-quiz">风险测评</router-link>
        <router-link to="/kyc">实名认证</router-link>
        <router-link to="/open-account">账户</router-link>
        <router-link to="/bind-card">绑定银行卡</router-link>
        <router-link to="/devices">登录设备</router-link>
      </nav>

      <div class="sidebar-foot">
        <p class="user-line">{{ auth.customer?.name || auth.customer?.mobile || '已登录' }}</p>
        <button type="button" class="btn btn-ghost logout" @click="onLogout">退出登录</button>
      </div>
    </aside>

    <div class="main">
      <header class="topbar">
        <h1 class="top-title">{{ title }}</h1>
        <div class="top-meta">
          <span class="pill">{{ mockLabel }}</span>
          <span class="clock">{{ clock }}</span>
        </div>
      </header>
      <main class="content">
        <router-view />
      </main>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, onUnmounted, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { useMock } from '@/api/mock'

const auth = useAuthStore()
const route = useRoute()
const router = useRouter()

const title = computed(() => (route.meta.title as string) || '财富基金')
const mockLabel = useMock ? 'Mock 模式' : '当前时间'
const clock = ref('')
let timer: number | undefined

function tick() {
  const now = new Date()
  clock.value = now.toLocaleString('zh-CN', { hour12: false })
}

async function onLogout() {
  await auth.logout()
  router.push('/login')
}

onMounted(() => {
  tick()
  timer = window.setInterval(tick, 1000)
  if (auth.isLoggedIn) void auth.fetchMe()
})

onUnmounted(() => {
  if (timer) clearInterval(timer)
})
</script>

<style scoped>
.shell {
  display: grid;
  grid-template-columns: var(--sidebar-width) 1fr;
  height: 100%;
  min-height: 100vh;
  background: var(--surface-page);
}

.sidebar {
  background:
    linear-gradient(180deg, rgba(26, 107, 92, 0.12) 0%, transparent 28%),
    linear-gradient(165deg, var(--brand-navy) 0%, var(--brand-navy-mid) 100%);
  color: var(--text-inverse);
  display: flex;
  flex-direction: column;
  padding: 1.25rem 0.9rem 1rem;
  border-right: 1px solid rgba(255, 255, 255, 0.06);
}

.brand {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.35rem 0.5rem 1.25rem;
}

.brand-logo {
  width: 40px;
  height: 40px;
  border-radius: 10px;
  object-fit: cover;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.35);
}

.brand-copy {
  display: flex;
  flex-direction: column;
  gap: 0.1rem;
}

.brand-copy strong {
  font-family: 'Noto Serif SC', 'Songti SC', serif;
  font-size: 1.05rem;
  letter-spacing: 0.06em;
}

.brand-copy span {
  font-size: 0.7rem;
  opacity: 0.65;
}

.nav {
  display: flex;
  flex-direction: column;
  gap: 0.15rem;
  flex: 1;
  overflow: auto;
  padding: 0 0.25rem;
}

.nav-label {
  margin: 0.85rem 0.55rem 0.35rem;
  font-size: 0.68rem;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  opacity: 0.45;
}

.nav a {
  padding: 0.55rem 0.7rem;
  border-radius: 6px;
  font-size: 0.9rem;
  color: rgba(245, 247, 250, 0.78);
  transition: background 0.15s ease, color 0.15s ease;
}

.nav a:hover {
  background: rgba(255, 255, 255, 0.06);
  color: #fff;
}

.nav a.router-link-active {
  background: rgba(26, 107, 92, 0.35);
  color: #fff;
  box-shadow: inset 3px 0 0 var(--brand-gold);
}

.sidebar-foot {
  padding: 0.75rem 0.5rem 0.25rem;
  border-top: 1px solid rgba(255, 255, 255, 0.08);
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.user-line {
  margin: 0;
  font-size: 0.8rem;
  opacity: 0.8;
  padding: 0 0.25rem;
}

.logout {
  color: #fff !important;
  border-color: rgba(255, 255, 255, 0.25) !important;
}

.main {
  display: flex;
  flex-direction: column;
  min-width: 0;
  min-height: 0;
}

.topbar {
  height: 56px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 1.5rem;
  background: rgba(255, 255, 255, 0.86);
  border-bottom: 1px solid var(--border-subtle);
  backdrop-filter: blur(8px);
}

.top-title {
  margin: 0;
  font-size: 1rem;
  font-weight: 600;
  color: var(--brand-navy);
}

.top-meta {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  color: var(--text-secondary);
  font-size: 0.8rem;
}

.pill {
  padding: 0.2rem 0.55rem;
  border-radius: 999px;
  background: var(--surface-muted);
  border: 1px solid var(--border-subtle);
  font-size: 0.72rem;
}

.clock {
  font-family: var(--font-mono);
  font-variant-numeric: tabular-nums;
}

.content {
  flex: 1;
  overflow: auto;
  padding: 1.5rem;
}
</style>
