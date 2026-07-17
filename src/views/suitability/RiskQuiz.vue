<template>
  <div class="quiz">
    <p class="page-sub">风险测评结果有效期 15 天；期内再次进入将展示得分，不重复问卷。</p>
    <div v-if="error" class="alert alert-error">{{ error }}</div>
    <div v-if="result" class="alert alert-ok">
      测评结果：等级 <strong>{{ result.customerRiskLevel }}</strong>，得分
      {{ result.score }}，有效期至 {{ result.expireAt }}
      <div class="result-actions">
        <button v-if="canRetake" class="btn btn-ghost" type="button" @click="startRetake">
          重新测评
        </button>
      </div>
    </div>
    <form v-else-if="showQuiz && questions.length" class="panel form" @submit.prevent="onSubmit">
      <div v-for="q in questions" :key="q.id" class="q">
        <p class="q-title">{{ q.title }}</p>
        <label v-for="opt in q.options" :key="opt.key" class="opt">
          <input v-model="answers[q.id]" type="radio" :value="opt.key" :name="q.id" />
          <span>{{ opt.key }}. {{ opt.text }}</span>
        </label>
      </div>
      <button class="btn btn-primary" type="submit" :disabled="loading">
        {{ loading ? '提交中…' : '提交测评' }}
      </button>
    </form>
    <p v-else-if="!result" class="empty">加载中…</p>
  </div>
</template>

<script setup lang="ts">
import { onMounted, reactive, ref } from 'vue'
import { getQuiz, getRiskLevel, submitQuiz } from '@/api/suitability'
import type { QuizQuestion, QuizSubmitResult, RiskLevelInfo } from '@/types/suitability'
import { ApiError } from '@/types/api'

const questions = ref<QuizQuestion[]>([])
const answers = reactive<Record<string, string>>({})
const result = ref<(QuizSubmitResult | RiskLevelInfo) | null>(null)
const error = ref('')
const loading = ref(false)
const showQuiz = ref(false)
const canRetake = ref(false)

async function loadQuiz() {
  showQuiz.value = true
  const payload = await getQuiz()
  questions.value = payload.questions
}

async function startRetake() {
  result.value = null
  canRetake.value = false
  error.value = ''
  await loadQuiz()
}

onMounted(async () => {
  try {
    result.value = await getRiskLevel()
    showQuiz.value = false
  } catch (e) {
    if (e instanceof ApiError && /过期/.test(e.message)) {
      canRetake.value = true
      await loadQuiz()
      return
    }
    try {
      await loadQuiz()
    } catch (err) {
      error.value = err instanceof Error ? err.message : '问卷加载失败'
    }
  }
})

async function onSubmit() {
  error.value = ''
  loading.value = true
  try {
    result.value = await submitQuiz({ answers: { ...answers } })
    showQuiz.value = false
  } catch (e) {
    if (e instanceof ApiError && e.code === '40901') {
      try {
        result.value = await getRiskLevel()
        showQuiz.value = false
        error.value = e.message
        return
      } catch {
        /* ignore */
      }
    }
    error.value = e instanceof Error ? e.message : '提交失败'
  } finally {
    loading.value = false
  }
}
</script>

<style scoped>
.form {
  padding: 1.25rem 1.5rem;
}
.q {
  margin-bottom: 1.25rem;
  padding-bottom: 1rem;
  border-bottom: 1px solid var(--border-subtle);
}
.q-title {
  margin: 0 0 0.65rem;
  font-weight: 600;
  color: var(--brand-navy);
}
.opt {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin: 0.35rem 0;
  font-size: 0.9rem;
  color: var(--text-secondary);
}
.result-actions {
  margin-top: 0.75rem;
}
</style>
