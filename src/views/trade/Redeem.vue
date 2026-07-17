<template>
  <div>
    <p class="page-sub">赎回 {{ fundCode }} · 份额保留 4 位小数。</p>
    <div v-if="error" class="alert alert-error">{{ error }}</div>
    <form class="panel form" @submit.prevent="onSubmit">
      <div class="field">
        <label>交易账户 ID</label>
        <input v-model="form.tradeAccountId" />
      </div>
      <div class="field">
        <label>银行卡 ID</label>
        <input v-model="form.bankCardId" />
      </div>
      <div class="field">
        <label>赎回份额</label>
        <input v-model="form.share" placeholder="如 100.0000" />
      </div>
      <button class="btn btn-primary" type="submit" :disabled="loading">
        {{ loading ? '提交中…' : '确认赎回' }}
      </button>
    </form>
  </div>
</template>

<script setup lang="ts">
import { reactive, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { redeem } from '@/api/trade'
import { reportAudit } from '@/api/audit'

const route = useRoute()
const router = useRouter()
const fundCode = String(route.params.fundCode)
const loading = ref(false)
const error = ref('')
const form = reactive({
  tradeAccountId: 'ta_demo',
  bankCardId: 'bc_demo',
  share: '100.0000',
})

async function onSubmit() {
  error.value = ''
  loading.value = true
  try {
    const order = await redeem({
      tradeAccountId: form.tradeAccountId,
      fundCode,
      share: form.share,
      bankCardId: form.bankCardId,
    })
    await reportAudit({ action: 'REDEEM', result: 'SUCCESS', objectId: order.orderNo })
    router.push(`/orders/${order.orderNo}`)
  } catch (e) {
    await reportAudit({
      action: 'REDEEM',
      result: 'FAIL',
      objectId: fundCode,
      detail: { message: e instanceof Error ? e.message : String(e) },
    })
    error.value = e instanceof Error ? e.message : '赎回失败'
  } finally {
    loading.value = false
  }
}
</script>

<style scoped>
.form {
  max-width: 480px;
  padding: 1.25rem 1.5rem;
}
</style>
