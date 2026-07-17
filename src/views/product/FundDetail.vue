<template>
  <div v-if="fund" class="detail">
    <div class="panel head">
      <div>
        <p class="code">{{ fund.fundCode }} · TA {{ fund.taCode }}</p>
        <h2 class="name">{{ fund.fundName }}</h2>
        <p class="meta">风险 {{ fund.riskLevel }} · {{ fund.status }} · 截点 {{ fund.cutOffTime }}</p>
      </div>
      <div class="nav-box" v-if="nav">
        <p class="label">最新净值</p>
        <p class="nav-val">{{ nav.nav }}</p>
        <p class="nav-date">{{ nav.navDate }}</p>
      </div>
    </div>

    <div class="actions">
      <router-link class="btn btn-primary" :to="`/purchase/${fund.fundCode}`">申购</router-link>
      <router-link class="btn btn-ghost" :to="`/redeem/${fund.fundCode}`">赎回</router-link>
      <button class="btn btn-ghost" type="button" :disabled="checking" @click="onMatch">
        {{ checking ? '校验中…' : '适当性匹配检查' }}
      </button>
    </div>
    <div v-if="matchMsg" class="alert" :class="matchOk ? 'alert-ok' : 'alert-error'">{{ matchMsg }}</div>

    <div class="panel block" v-if="fees.length">
      <h3>费率</h3>
      <table class="data-table">
        <thead>
          <tr>
            <th>类型</th>
            <th class="num">费率</th>
            <th>说明</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="fee in fees" :key="fee.feeType">
            <td>{{ fee.feeType }}</td>
            <td class="num">{{ fee.rate }}</td>
            <td>{{ fee.description || '—' }}</td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
  <p v-else-if="error" class="alert alert-error">{{ error }}</p>
  <p v-else class="empty">加载中…</p>
</template>

<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { useRoute } from 'vue-router'
import { getFeeRates, getFund, getFundNav } from '@/api/product'
import { matchCheck } from '@/api/suitability'
import type { FeeRate, Fund, FundNav } from '@/types/product'

const route = useRoute()
const fund = ref<Fund | null>(null)
const nav = ref<FundNav | null>(null)
const fees = ref<FeeRate[]>([])
const error = ref('')
const checking = ref(false)
const matchMsg = ref('')
const matchOk = ref(false)

async function onMatch() {
  checking.value = true
  matchMsg.value = ''
  try {
    const r = await matchCheck({ fundCode: String(route.params.fundCode), tradeType: 'PURCHASE' })
    matchOk.value = r.matched
    matchMsg.value = r.matched
      ? `匹配通过（客户 ${r.customerRiskLevel} / 产品 ${r.fundRiskLevel}）`
      : `不匹配：客户 ${r.customerRiskLevel} vs 产品 ${r.fundRiskLevel}`
  } catch (e) {
    matchOk.value = false
    matchMsg.value = e instanceof Error ? e.message : '校验失败'
  } finally {
    checking.value = false
  }
}

onMounted(async () => {
  const code = String(route.params.fundCode)
  try {
    fund.value = await getFund(code)
    nav.value = await getFundNav(code)
    fees.value = await getFeeRates(code)
  } catch (e) {
    error.value = e instanceof Error ? e.message : '加载失败'
  }
})
</script>

<style scoped>
.head {
  display: flex;
  justify-content: space-between;
  gap: 1rem;
  padding: 1.25rem 1.5rem;
  margin-bottom: 1rem;
}
.code {
  margin: 0;
  color: var(--text-muted);
  font-size: 0.8rem;
  font-family: var(--font-mono);
}
.name {
  margin: 0.25rem 0;
  font-family: var(--font-display);
  font-size: 1.5rem;
  color: var(--brand-navy);
}
.meta {
  margin: 0;
  color: var(--text-secondary);
  font-size: 0.85rem;
}
.nav-box {
  text-align: right;
  min-width: 120px;
}
.label {
  margin: 0;
  font-size: 0.75rem;
  color: var(--text-secondary);
}
.nav-val {
  margin: 0.2rem 0;
  font-size: 1.6rem;
  font-family: var(--font-mono);
  font-weight: 600;
  color: var(--brand-navy);
}
.nav-date {
  margin: 0;
  font-size: 0.75rem;
  color: var(--text-muted);
}
.actions {
  display: flex;
  gap: 0.5rem;
  margin-bottom: 1rem;
}
.block {
  padding: 0.5rem 0 0;
  overflow: hidden;
}
.block h3 {
  margin: 0;
  padding: 0.85rem 1rem 0.35rem;
  font-size: 0.95rem;
}
</style>
