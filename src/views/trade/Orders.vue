<template>
  <div>
    <p class="page-sub">查看申购 / 赎回订单状态。</p>
    <div v-if="error" class="alert alert-error">{{ error }}</div>
    <div class="panel table-wrap">
      <table class="data-table" v-if="list.length">
        <thead>
          <tr>
            <th>订单号</th>
            <th>类型</th>
            <th>基金</th>
            <th class="num">金额/份额</th>
            <th>状态</th>
            <th>时间</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="o in list" :key="o.orderNo">
            <td>
              <router-link :to="`/orders/${o.orderNo}`">{{ o.orderNo }}</router-link>
            </td>
            <td>{{ ORDER_TYPE_LABEL[o.type] }}</td>
            <td>{{ o.fundName || o.fundCode }}</td>
            <td class="num">
              {{
                o.type === 'PURCHASE'
                  ? `¥${((o.amountCent || 0) / 100).toFixed(2)}`
                  : o.share
              }}
            </td>
            <td :class="`tone-${orderStatusTone(o.status)}`">
              {{ ORDER_STATUS_LABEL[o.status] || o.status }}
            </td>
            <td>{{ formatTime(o.createdAt) }}</td>
          </tr>
        </tbody>
      </table>
      <p v-else class="empty">暂无订单 · 可先在产品详情发起申购</p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { listOrders } from '@/api/trade'
import type { TradeOrder } from '@/types/trade'
import { ORDER_STATUS_LABEL, ORDER_TYPE_LABEL, orderStatusTone } from '@/utils/labels'

const list = ref<TradeOrder[]>([])
const error = ref('')

function formatTime(iso: string) {
  try {
    return new Date(iso).toLocaleString('zh-CN', { hour12: false })
  } catch {
    return iso
  }
}

onMounted(async () => {
  try {
    const page = await listOrders({ page: 1, pageSize: 50 })
    list.value = page.list
  } catch (e) {
    error.value = e instanceof Error ? e.message : '加载失败'
  }
})
</script>

<style scoped>
.table-wrap {
  overflow: auto;
}
</style>
