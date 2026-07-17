<template>
  <div>
    <p class="page-sub">持仓份额与市值（按最新净值估算）。</p>
    <div v-if="error" class="alert alert-error">{{ error }}</div>
    <div class="summary panel" v-if="list.length">
      <span>合计市值</span>
      <strong>¥{{ centToYuan(totalCent) }}</strong>
    </div>
    <div class="panel table-wrap">
      <table class="data-table" v-if="list.length">
        <thead>
          <tr>
            <th>基金</th>
            <th class="num">总份额</th>
            <th class="num">可用</th>
            <th class="num">冻结</th>
            <th class="num">净值</th>
            <th class="num">市值(元)</th>
            <th></th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="p in list" :key="p.fundCode">
            <td>
              <div>{{ p.fundName }}</div>
              <div class="code">{{ p.fundCode }}</div>
            </td>
            <td class="num">{{ p.totalShare }}</td>
            <td class="num">{{ p.availableShare }}</td>
            <td class="num">{{ p.frozenShare }}</td>
            <td class="num">{{ p.nav }}</td>
            <td class="num">{{ centToYuan(p.marketValueCent) }}</td>
            <td>
              <router-link :to="`/positions/${p.fundCode}`">明细</router-link>
              ·
              <router-link :to="`/redeem/${p.fundCode}`">赎回</router-link>
            </td>
          </tr>
        </tbody>
      </table>
      <p v-else class="empty">暂无持仓</p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { listPositions } from '@/api/position'
import type { Position } from '@/types/position'
import { centToYuan } from '@/utils/money'

const list = ref<Position[]>([])
const error = ref('')
const totalCent = computed(() => list.value.reduce((s, p) => s + p.marketValueCent, 0))

onMounted(async () => {
  try {
    list.value = await listPositions()
  } catch (e) {
    error.value = e instanceof Error ? e.message : '加载失败'
  }
})
</script>

<style scoped>
.summary {
  display: flex;
  justify-content: space-between;
  align-items: baseline;
  padding: 1rem 1.25rem;
  margin-bottom: 1rem;
  color: var(--text-secondary);
}
.summary strong {
  font-family: var(--font-display);
  font-size: 1.5rem;
  color: var(--brand-navy);
}
.code {
  font-size: 0.75rem;
  color: var(--text-muted);
  font-family: var(--font-mono);
}
.table-wrap {
  overflow: auto;
}
</style>
