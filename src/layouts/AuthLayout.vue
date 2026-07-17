<template>
  <div class="auth">
    <div class="auth-panel panel">
      <div class="auth-brand">
        <img class="mark-img" src="/logo.png" width="48" height="48" alt="财富基金" />
        <div>
          <h1>财富基金</h1>
          <p>公募场外基金代销 · 桌面端</p>
        </div>
      </div>
      <router-view />
    </div>
    <p class="hint">支持多端登录</p>
  </div>
</template>

<style scoped>
.auth {
  min-height: 100%;
  display: grid;
  place-items: center;
  padding: 2rem;
  background:
    radial-gradient(ellipse 70% 50% at 20% 0%, rgba(26, 107, 92, 0.16), transparent 55%),
    linear-gradient(160deg, #0b1f33 0%, #14304a 45%, #1a3a52 100%);
}

.auth-panel {
  width: min(420px, 100%);
  padding: 2rem;
}

.auth-brand {
  display: flex;
  gap: 0.85rem;
  align-items: center;
  margin-bottom: 1.75rem;
}

.mark-img {
  width: 48px;
  height: 48px;
  border-radius: 12px;
  object-fit: cover;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.25);
}

.auth-brand h1 {
  margin: 0;
  font-family: 'Noto Serif SC', 'Songti SC', serif;
  font-size: 1.45rem;
  color: var(--brand-navy);
  letter-spacing: 0.06em;
}

.auth-brand p {
  margin: 0.15rem 0 0;
  color: var(--text-secondary);
  font-size: 0.85rem;
}

.hint {
  margin-top: 1rem;
  color: rgba(245, 247, 250, 0.55);
  font-size: 0.8rem;
}
</style>
