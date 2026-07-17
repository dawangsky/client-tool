<template>
  <div v-if="pos">
    <div class="panel head">
      <h2>{{ pos.fundName }}</h2>
      <p>{{ pos.fundCode }} · 净值 {{ pos.nav }}</p>
    </div>
    <dl class="panel meta">
      <div><dt>总份额</dt><dd class="num">{{ pos.totalShare }}</dd></div>
      <div><dt>可用份额</dt><dd class="num">{{ pos.availableShare }}</dd></div>
      <div><dt>冻结份额</dt><dd class="num">{{ pos.frozenShare }}</dd></div>
      <div><dt>市值</dt><dd class="num">¥{{ centToYuan(pos.marketValueCent) }}</dd></div>
    </dl>
    <h3 class="section">份额变动</h3>
    <div class="panel table-wrap">
      <table class="data-table" v-if="flows.length">
        <thead>
          <tr>
            <th>时间</th>
            <th>类型</th>
            <th class="num">变动份额</th>
            <th>关联订单</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="f in flows" :key="f.flowId">
            <td>{{ f.createdAt }}</td>
            <td>{{ f.bizType }}</td>
            <td class="num">{{ f.changeShare }}</td>
            <td>{{ f.orderNo || '—' }}</td>
          </tr>
        </tbody>
      </table>
      <p v-else class="empty">暂无变动记录</p>
    </div>
  </div>
  <p v-else-if="error" class="alert alert-error">{{ error }}</p>
  <p v-else class="empty">加载中…</p>
</template>

<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { useRoute } from 'vue-router'
import { getPosition, listPositionFlows } from '@/api/position'
import type { Position, PositionFlow } from '@/types/position'
import { centToYuan } from '@/utils/money'

const route = useRoute()
const pos = ref<Position | null>(null)
const flows = ref<PositionFlow[]>([])
const error = ref('')

onMounted(async () => {
  const code = String(route.params.fundCode)
  try {
    pos.value = await getPosition(code)
    const page = await listPositionFlows({ fundCode: code })
    flows.value = page.list
  } catch (e) {
    error.value = e instanceof Error ? e.message : '加载失败'
  }
})
</script>

<style scoped>
.head {
  padding: 1.25rem 1.5rem;
  margin-bottom: 1rem;
}
.head h2 {
  margin: 0 0 0.25rem;
  font-family: var(--font-display);
  color: var(--brand-navy);
}
.head p {
  margin: 0;
  color: var(--text-secondary);
  font-size: 0.85rem;
}
.meta {
  padding: 1rem 1.5rem;
  margin-bottom: 1.25rem;
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 0.75rem;
}
.meta div {
  display: flex;
  justify-content: space-between;
  font-size: 0.9rem;
}
dt {
  margin: 0;
  color: var(--text-secondary);
}
dd {
  margin: 0;
}
.num {
  font-family: var(--font-mono);
}
.section {
  margin: 0 0 0.5rem;
  font-size: 0.95rem;
  color: var(--brand-navy);
}
</style>
