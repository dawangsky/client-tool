<template>
  <div>
    <p class="page-sub">绑定用于申购扣款 / 赎回出款的银行卡；已绑卡时默认隐藏表单。</p>
    <div v-if="error" class="alert alert-error">{{ error }}</div>
    <div v-if="ok" class="alert alert-ok">{{ ok }}</div>

    <div class="panel table-wrap">
      <table class="data-table" v-if="cards.length">
        <thead>
          <tr>
            <th>卡 ID</th>
            <th>掩码</th>
            <th>银行</th>
            <th>状态</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="c in cards" :key="c.bankCardId">
            <td>{{ c.bankCardId }}</td>
            <td>{{ c.cardNoMask }}</td>
            <td>{{ c.bankCode || '—' }}</td>
            <td>{{ c.status }}</td>
          </tr>
        </tbody>
      </table>
      <p v-else class="empty">暂无绑卡</p>
      <div class="list-actions">
        <button
          v-if="cards.length && !showForm"
          class="btn btn-ghost"
          type="button"
          @click="showForm = true"
        >
          新增银行卡
        </button>
        <button
          v-if="cards.some((c) => c.status === 'ACTIVE')"
          class="btn btn-primary"
          type="button"
          @click="$router.push('/risk-quiz')"
        >
          下一步：风险测评
        </button>
      </div>
    </div>

    <form v-if="showForm" class="panel form" @submit.prevent="onBind">
      <div class="field">
        <label>卡号</label>
        <input v-model="form.cardNo" required placeholder="演示卡号" />
      </div>
      <div class="field">
        <label>银行代码</label>
        <input v-model="form.bankCode" placeholder="如 ICBC" />
      </div>
      <div class="actions">
        <button class="btn btn-primary" type="submit" :disabled="loading">
          {{ loading ? '绑定中…' : '绑定' }}
        </button>
        <button
          v-if="cards.length"
          class="btn btn-ghost"
          type="button"
          @click="showForm = false"
        >
          取消
        </button>
      </div>
    </form>
  </div>
</template>

<script setup lang="ts">
import { onMounted, reactive, ref } from 'vue'
import { bindBankCard, listBankCards } from '@/api/account'
import type { BankCard } from '@/types/account'

const cards = ref<BankCard[]>([])
const loading = ref(false)
const error = ref('')
const ok = ref('')
const showForm = ref(true)
const form = reactive({ cardNo: '6222021234567890', bankCode: 'ICBC' })

async function refresh() {
  cards.value = await listBankCards()
  showForm.value = cards.value.length === 0
}

async function onBind() {
  error.value = ''
  ok.value = ''
  loading.value = true
  try {
    const card = await bindBankCard({ ...form })
    ok.value = `已绑定 ${card.cardNoMask}`
    form.cardNo = ''
    await refresh()
  } catch (e) {
    error.value = e instanceof Error ? e.message : '绑卡失败'
  } finally {
    loading.value = false
  }
}

onMounted(async () => {
  try {
    await refresh()
  } catch {
    showForm.value = true
  }
})
</script>

<style scoped>
.form {
  max-width: 480px;
  padding: 1.25rem 1.5rem;
  margin-top: 1rem;
}
.list-actions,
.actions {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
  margin-top: 0.75rem;
}
</style>
