<template>
  <form class="reg" @submit.prevent="onSubmit">
    <div v-if="error" class="alert alert-error">{{ error }}</div>
    <div class="field">
      <label for="mobile">手机号</label>
      <input id="mobile" v-model="form.mobile" placeholder="11 位手机号" />
    </div>
    <div class="field">
      <label for="sms">短信验证码</label>
      <input id="sms" v-model="form.smsCode" placeholder="演示可任意填写" />
    </div>
    <div class="field">
      <label for="password">设置密码</label>
      <input id="password" v-model="form.password" type="password" placeholder="至少 8 位" />
    </div>
    <button class="btn btn-primary submit" type="submit" :disabled="loading">
      {{ loading ? '提交中…' : '注册并登录' }}
    </button>
    <p class="foot">
      已有账户？
      <router-link to="/login">去登录</router-link>
    </p>
  </form>
</template>

<script setup lang="ts">
import { reactive, ref } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'

const auth = useAuthStore()
const router = useRouter()
const loading = ref(false)
const error = ref('')
const form = reactive({ mobile: '', password: '', smsCode: '123456' })

async function onSubmit() {
  error.value = ''
  loading.value = true
  try {
    await auth.register(form.mobile, form.password, form.smsCode)
    router.replace('/')
  } catch (e) {
    error.value = e instanceof Error ? e.message : '注册失败'
  } finally {
    loading.value = false
  }
}
</script>

<style scoped>
.submit {
  width: 100%;
  height: 42px;
}
.foot {
  margin: 1rem 0 0;
  text-align: center;
  font-size: 0.85rem;
  color: var(--text-secondary);
}
.foot a {
  color: var(--brand-accent);
}
</style>
