<template>
  <div>
    <p class="page-sub">实名认证通过后无需再次填写；演示环境不校验证件真实性。</p>
    <div v-if="error" class="alert alert-error">{{ error }}</div>
    <div v-if="ok" class="alert alert-ok">{{ ok }}</div>

    <div v-if="kycPassed" class="panel info">
      <p><strong>姓名：</strong>{{ auth.customer?.name || '—' }}</p>
      <p><strong>证件号：</strong>{{ auth.customer?.idNo || '—' }}</p>
      <p><strong>手机号：</strong>{{ auth.customer?.mobile || '—' }}</p>
      <p><strong>状态：</strong>已通过</p>
      <button class="btn btn-primary" type="button" @click="$router.push('/open-account')">
        下一步：账户
      </button>
    </div>

    <form v-else class="panel form" @submit.prevent="onSubmit">
      <div class="field">
        <label>姓名</label>
        <input v-model="form.name" required />
      </div>
      <div class="field">
        <label>证件类型</label>
        <select v-model="form.idType">
          <option value="ID_CARD">身份证</option>
          <option value="PASSPORT">护照</option>
        </select>
      </div>
      <div class="field">
        <label>证件号</label>
        <input v-model="form.idNo" required />
      </div>
      <div class="field">
        <label>手机号</label>
        <input v-model="form.mobile" required />
      </div>
      <button class="btn btn-primary" type="submit" :disabled="loading">
        {{ loading ? '提交中…' : '提交认证' }}
      </button>
    </form>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, reactive, ref } from 'vue'
import { submitKyc } from '@/api/account'
import { useAuthStore } from '@/stores/auth'

const auth = useAuthStore()
const loading = ref(false)
const error = ref('')
const ok = ref('')
const form = reactive({
  name: '',
  idType: 'ID_CARD',
  idNo: '',
  mobile: auth.customer?.mobile || '',
})

const kycPassed = computed(() => auth.customer?.kycStatus === 'PASSED')

onMounted(async () => {
  if (!auth.customer) {
    try {
      await auth.fetchMe()
    } catch {
      /* optional */
    }
  }
  form.mobile = auth.customer?.mobile || form.mobile
})

async function onSubmit() {
  error.value = ''
  ok.value = ''
  loading.value = true
  try {
    const c = await submitKyc({ ...form })
    auth.customer = c
    ok.value = `认证状态：${c.kycStatus}`
  } catch (e) {
    error.value = e instanceof Error ? e.message : '提交失败'
  } finally {
    loading.value = false
  }
}
</script>

<style scoped>
.form,
.info {
  max-width: 480px;
  padding: 1.25rem 1.5rem;
}
.info p {
  margin: 0.4rem 0;
}
.info .btn {
  margin-top: 1rem;
}
</style>
