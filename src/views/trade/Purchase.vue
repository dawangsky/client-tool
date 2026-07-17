<template>
  <div>
    <p class="page-sub">申购 {{ fundCode }} · 起购 ¥{{ minPurchaseYuan }} · 金额以「元」填写，提交时转为分。</p>
    <div v-if="error" class="alert alert-error">{{ error }}</div>
    <div v-if="ok" class="alert alert-ok">下单成功：{{ ok }}</div>
    <form class="panel form" @submit.prevent="onSubmit">
      <div class="field">
        <label>交易账户 ID</label>
        <input v-model="form.tradeAccountId" placeholder="如 ta_demo（Mock 需先开通）" />
      </div>
      <div class="field">
        <label>银行卡 ID</label>
        <input v-model="form.bankCardId" placeholder="如 bc_xxx" />
      </div>
      <div class="field">
        <label>适当性日志 ID</label>
        <input v-model="form.suitabilityLogId" placeholder="匹配检查返回的 suitabilityLogId" />
      </div>
      <div class="field">
        <label>申购金额（元），起购 ¥{{ minPurchaseYuan }}</label>
        <input v-model="form.amountYuan" type="number" min="0" step="0.01" />
      </div>
      <button class="btn btn-primary" type="submit" :disabled="loading">
        {{ loading ? '提交中…' : '确认申购' }}
      </button>
    </form>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, reactive, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { getFund } from '@/api/product'
import { purchase } from '@/api/trade'
import { reportAudit } from '@/api/audit'
import { centToYuan, yuanToCent } from '@/utils/money'
import type { Fund } from '@/types/product'

const route = useRoute()
const router = useRouter()
const fundCode = String(route.params.fundCode)
const loading = ref(false)
const error = ref('')
const ok = ref('')
const fund = ref<Fund | null>(null)
const form = reactive({
  tradeAccountId: 'ta_demo',
  bankCardId: 'bc_demo',
  suitabilityLogId: 'sl_demo',
  amountYuan: '100',
})

const minPurchaseYuan = computed(() =>
  fund.value ? centToYuan(fund.value.minPurchaseAmount || 0) : '—',
)

onMounted(async () => {
  try {
    fund.value = await getFund(fundCode)
    const minYuan = Number(centToYuan(fund.value.minPurchaseAmount || 10000))
    if (!form.amountYuan || Number(form.amountYuan) < minYuan) {
      form.amountYuan = String(minYuan)
    }
  } catch {
    /* mock / offline */
  }
})

async function onSubmit() {
  error.value = ''
  ok.value = ''
  const amountCent = yuanToCent(form.amountYuan)
  const minCent = fund.value?.minPurchaseAmount ?? 0
  if (minCent > 0 && amountCent < minCent) {
    error.value = `低于起购金额 ¥${centToYuan(minCent)}`
    return
  }
  const step = fund.value?.purchaseAmountStep ?? 0
  if (step > 0 && (amountCent - minCent) % step !== 0) {
    error.value = `申购金额须按 ¥${centToYuan(step)} 递增`
    return
  }
  loading.value = true
  try {
    const order = await purchase({
      tradeAccountId: form.tradeAccountId,
      fundCode,
      amountCent,
      bankCardId: form.bankCardId,
      suitabilityLogId: form.suitabilityLogId,
    })
    await reportAudit({
      action: 'PURCHASE',
      result: 'SUCCESS',
      objectId: order.orderNo,
      detail: { fundCode, amountCent: order.amountCent },
    })
    ok.value = order.orderNo
    router.push(`/orders/${order.orderNo}`)
  } catch (e) {
    await reportAudit({
      action: 'PURCHASE',
      result: 'FAIL',
      objectId: fundCode,
      detail: { message: e instanceof Error ? e.message : String(e) },
    })
    error.value = e instanceof Error ? e.message : '下单失败'
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
