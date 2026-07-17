<template>
  <div v-if="order" class="detail">
    <div class="panel head">
      <h2>{{ order.orderNo }}</h2>
      <p>
        {{ ORDER_TYPE_LABEL[order.type] }} ·
        <span :class="`tone-${orderStatusTone(order.status)}`">
          {{ ORDER_STATUS_LABEL[order.status] }}
        </span>
      </p>
    </div>
    <div v-if="error" class="alert alert-error">{{ error }}</div>
    <div v-if="msg" class="alert alert-ok">{{ msg }}</div>
    <dl class="panel meta">
      <div><dt>基金</dt><dd>{{ order.fundName || order.fundCode }}</dd></div>
      <div>
        <dt>金额/份额</dt>
        <dd class="num">
          {{
            order.type === 'PURCHASE'
              ? `¥${((order.amountCent || 0) / 100).toFixed(2)}`
              : order.share
          }}
        </dd>
      </div>
      <div><dt>创建时间</dt><dd>{{ order.createdAt }}</dd></div>
      <div v-if="order.cutOffTime"><dt>截点</dt><dd>{{ order.cutOffTime }}</dd></div>
    </dl>
    <button
      v-if="order.canCancel"
      class="btn btn-danger"
      type="button"
      :disabled="loading"
      @click="onCancel"
    >
      {{ loading ? '撤单中…' : '撤单' }}
    </button>
    <router-link class="btn btn-ghost" to="/orders">返回列表</router-link>
  </div>
  <p v-else-if="error" class="alert alert-error">{{ error }}</p>
  <p v-else class="empty">加载中…</p>
</template>

<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { useRoute } from 'vue-router'
import { cancelOrder, getOrder } from '@/api/trade'
import { reportAudit } from '@/api/audit'
import type { TradeOrder } from '@/types/trade'
import { ORDER_STATUS_LABEL, ORDER_TYPE_LABEL, orderStatusTone } from '@/utils/labels'

const route = useRoute()
const order = ref<TradeOrder | null>(null)
const error = ref('')
const msg = ref('')
const loading = ref(false)

async function onCancel() {
  if (!order.value) return
  loading.value = true
  error.value = ''
  try {
    order.value = await cancelOrder(order.value.orderNo)
    await reportAudit({ action: 'CANCEL_ORDER', result: 'SUCCESS', objectId: order.value.orderNo })
    msg.value = '撤单成功'
  } catch (e) {
    await reportAudit({
      action: 'CANCEL_ORDER',
      result: 'FAIL',
      objectId: order.value.orderNo,
    })
    error.value = e instanceof Error ? e.message : '撤单失败'
  } finally {
    loading.value = false
  }
}

onMounted(async () => {
  try {
    order.value = await getOrder(String(route.params.orderNo))
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
  margin: 0 0 0.35rem;
  font-family: var(--font-mono);
  font-size: 1.15rem;
  color: var(--brand-navy);
}
.head p {
  margin: 0;
  color: var(--text-secondary);
}
.meta {
  padding: 1rem 1.5rem;
  margin-bottom: 1rem;
  display: grid;
  gap: 0.75rem;
}
.meta div {
  display: grid;
  grid-template-columns: 100px 1fr;
  gap: 0.5rem;
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
.btn {
  margin-right: 0.5rem;
}
</style>
