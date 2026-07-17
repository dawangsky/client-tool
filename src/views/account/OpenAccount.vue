<template>
  <div>
    <h1 class="page-title">账户</h1>
    <p class="page-sub">查看或开通交易账户；已开通后不可重复开通。</p>
    <div v-if="error" class="alert alert-error">{{ error }}</div>
    <div v-if="account" class="alert alert-ok">
      已开通：{{ account.tradeAccountId }}（{{ account.status }}）
    </div>
    <div class="panel box">
      <button
        v-if="!account"
        class="btn btn-primary"
        type="button"
        :disabled="loading"
        @click="onOpen"
      >
        {{ loading ? '开通中…' : '开通交易账户' }}
      </button>
      <button
        v-if="account"
        class="btn btn-primary"
        type="button"
        @click="$router.push('/bind-card')"
      >
        下一步：绑卡
      </button>
      <button class="btn btn-ghost" type="button" :disabled="loading" @click="onFetch">
        查询当前账户
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { getCurrentTradeAccount, openTradeAccount } from '@/api/account'
import type { TradeAccount } from '@/types/account'

const account = ref<TradeAccount | null>(null)
const loading = ref(false)
const error = ref('')

onMounted(() => {
  void onFetch()
})

async function onOpen() {
  error.value = ''
  loading.value = true
  try {
    account.value = await openTradeAccount()
  } catch (e) {
    error.value = e instanceof Error ? e.message : '开通失败'
  } finally {
    loading.value = false
  }
}

async function onFetch() {
  error.value = ''
  loading.value = true
  try {
    account.value = await getCurrentTradeAccount()
  } catch (e) {
    account.value = null
    // 未开通时忽略 404
    if (!(e instanceof Error && /不存在|404/.test(e.message))) {
      error.value = e instanceof Error ? e.message : '查询失败'
    }
  } finally {
    loading.value = false
  }
}
</script>

<style scoped>
.box {
  padding: 1.25rem;
  display: flex;
  gap: 0.5rem;
  max-width: 480px;
  flex-wrap: wrap;
}
</style>
