<template>
  <form class="login" @submit.prevent="onSubmit">
    <div v-if="error" class="alert alert-error">{{ error }}</div>
    <div class="field">
      <label for="mobile">手机号</label>
      <input id="mobile" v-model="form.mobile" autocomplete="username" placeholder="已注册的手机号" />
    </div>
    <div class="field">
      <label for="password">密码</label>
      <input
        id="password"
        v-model="form.password"
        type="password"
        autocomplete="current-password"
        placeholder="任意非空（Sprint1）"
      />
    </div>
    <label class="remember">
      <input v-model="rememberMe" type="checkbox" />
      <span>记住账号和密码</span>
    </label>
    <button class="btn btn-primary submit" type="submit" :disabled="loading">
      {{ loading ? '登录中…' : '登录' }}
    </button>
    <p class="foot">
      还没有账户？
      <router-link to="/register">注册</router-link>
    </p>
  </form>
</template>

<script setup lang="ts">
import { onMounted, reactive, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import {
  isRememberLoginEnabled,
  loadRememberedLogin,
  persistRememberLogin,
} from '@/utils/rememberLogin'

const auth = useAuthStore()
const router = useRouter()
const route = useRoute()
const loading = ref(false)
const error = ref('')
const rememberMe = ref(false)
const form = reactive({ mobile: '', password: '' })

onMounted(() => {
  rememberMe.value = isRememberLoginEnabled()
  const saved = loadRememberedLogin()
  if (saved) {
    form.mobile = saved.mobile
    form.password = saved.password
  }
})

async function onSubmit() {
  error.value = ''
  if (!form.mobile.trim() || !form.password.trim()) {
    error.value = '请输入手机号和密码'
    return
  }
  loading.value = true
  try {
    await auth.login(form.mobile.trim(), form.password)
    persistRememberLogin(rememberMe.value, form.mobile.trim(), form.password)
    const redirect = (route.query.redirect as string) || '/'
    router.replace(redirect)
  } catch (e) {
    error.value = e instanceof Error ? e.message : '登录失败'
  } finally {
    loading.value = false
  }
}
</script>

<style scoped>
.submit {
  width: 100%;
  height: 42px;
  margin-top: 0.25rem;
}
.remember {
  display: flex;
  align-items: center;
  gap: 0.45rem;
  margin: 0.15rem 0 0.85rem;
  font-size: 0.85rem;
  color: var(--text-secondary);
  cursor: pointer;
  user-select: none;
}
.remember input {
  width: 15px;
  height: 15px;
  accent-color: var(--brand-accent, #0c4a6e);
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
