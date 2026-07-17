<template>
  <div class="home">
    <section class="asset panel">
      <div class="asset-head">
        <div>
          <p class="eyebrow">总资产估值（演示）</p>
          <p class="amount">
            <span class="currency">¥</span>
            {{ auth.isLoggedIn ? totalYuan : '—' }}
          </p>
          <p class="sub">按最新净值估算 · 非实时行情</p>
        </div>
        <div class="actions">
          <router-link class="btn btn-primary" to="/funds">去选基</router-link>
          <router-link v-if="auth.isLoggedIn" class="btn btn-ghost" to="/positions">查看持仓</router-link>
          <router-link v-else class="btn btn-ghost" to="/login">登录账户</router-link>
        </div>
      </div>
      <div class="quick">
        <router-link to="/purchase/000001" class="q">申购</router-link>
        <router-link to="/redeem/000001" class="q">赎回</router-link>
        <router-link to="/orders" class="q">订单</router-link>
        <router-link to="/risk-quiz" class="q">风测</router-link>
      </div>
    </section>

    <section class="grid">
      <div class="panel block">
        <div class="block-head">
          <h2>热门产品</h2>
          <router-link to="/funds">全部</router-link>
        </div>
        <table class="data-table" v-if="funds.length">
          <thead>
            <tr>
              <th>基金</th>
              <th>风险</th>
              <th class="num">起购(元)</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="f in funds" :key="f.fundCode">
              <td>
                <div class="fund-name">{{ f.fundName }}</div>
                <div class="fund-code">{{ f.fundCode }}</div>
              </td>
              <td>{{ f.riskLevel }}</td>
              <td class="num">{{ (f.minPurchaseAmount / 100).toFixed(2) }}</td>
              <td><router-link :to="`/funds/${f.fundCode}`">详情</router-link></td>
            </tr>
          </tbody>
        </table>
        <p v-else class="empty">加载中…</p>
      </div>

      <div class="panel block">
        <div class="block-head">
          <h2>开户进度</h2>
        </div>
        <ol class="steps">
          <li><router-link to="/register">注册 / 登录</router-link></li>
          <li><router-link to="/kyc">实名认证 (KYC)</router-link></li>
          <li><router-link to="/open-account">账户</router-link></li>
          <li><router-link to="/bind-card">绑定银行卡</router-link></li>
          <li><router-link to="/risk-quiz">完成风险测评</router-link></li>
        </ol>
      </div>
    </section>
  </div>
</template>

<script setup lang="ts">
import { onMounted, ref, computed } from 'vue'
import { listFunds } from '@/api/product'
import { listPositions } from '@/api/position'
import type { Fund } from '@/types/product'
import { useAuthStore } from '@/stores/auth'
import { centToYuan } from '@/utils/money'

const auth = useAuthStore()
const funds = ref<Fund[]>([])
const marketValueCent = ref(0)

const totalYuan = computed(() => centToYuan(marketValueCent.value))

onMounted(async () => {
  try {
    const page = await listFunds({ page: 1, pageSize: 5 })
    funds.value = page.list.slice(0, 5)
  } catch {
    funds.value = []
  }
  if (auth.isLoggedIn) {
    try {
      const pos = await listPositions()
      marketValueCent.value = pos.reduce((s, p) => s + p.marketValueCent, 0)
    } catch {
      marketValueCent.value = 0
    }
  }
})
</script>

<style scoped>
.home {
  display: flex;
  flex-direction: column;
  gap: 1.25rem;
  max-width: 1100px;
}

.asset {
  padding: 1.5rem 1.75rem;
  background:
    linear-gradient(120deg, rgba(26, 107, 92, 0.08), transparent 40%),
    var(--surface-panel);
}

.asset-head {
  display: flex;
  justify-content: space-between;
  gap: 1.5rem;
  align-items: flex-start;
}

.eyebrow {
  margin: 0;
  font-size: 0.8rem;
  color: var(--text-secondary);
}

.amount {
  margin: 0.35rem 0;
  font-family: var(--font-display);
  font-size: 2.4rem;
  font-weight: 700;
  color: var(--brand-navy);
  letter-spacing: -0.03em;
  font-variant-numeric: tabular-nums;
}

.currency {
  font-size: 1.25rem;
  margin-right: 0.25rem;
  color: var(--text-secondary);
}

.sub {
  margin: 0;
  color: var(--text-muted);
  font-size: 0.8rem;
}

.actions {
  display: flex;
  gap: 0.5rem;
}

.quick {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 0.5rem;
  margin-top: 1.25rem;
  padding-top: 1.1rem;
  border-top: 1px solid var(--border-subtle);
}

.q {
  text-align: center;
  padding: 0.7rem 0.5rem;
  border-radius: var(--radius-sm);
  background: var(--surface-muted);
  color: var(--brand-navy);
  font-weight: 500;
  font-size: 0.9rem;
  transition: background 0.15s ease;
}

.q:hover {
  background: #dce7e4;
}

.grid {
  display: grid;
  grid-template-columns: 1.6fr 1fr;
  gap: 1.25rem;
}

.block {
  padding: 0;
  overflow: hidden;
}

.block-head {
  display: flex;
  justify-content: space-between;
  align-items: baseline;
  padding: 1rem 1.1rem 0.75rem;
}

.block-head h2 {
  margin: 0;
  font-size: 1rem;
  color: var(--brand-navy);
}

.block-head a {
  font-size: 0.85rem;
  color: var(--brand-accent);
}

.fund-name {
  font-weight: 500;
}
.fund-code {
  color: var(--text-muted);
  font-size: 0.75rem;
  font-family: var(--font-mono);
}

.steps {
  margin: 0;
  padding: 0 1.25rem 1.25rem 2rem;
  color: var(--text-secondary);
  line-height: 1.9;
  font-size: 0.9rem;
}

.steps a:hover {
  color: var(--brand-accent);
}

@media (max-width: 900px) {
  .grid,
  .quick {
    grid-template-columns: 1fr;
  }
  .asset-head {
    flex-direction: column;
  }
}
</style>
