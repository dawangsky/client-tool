<template>
  <div>
    <p class="page-sub">站内通知：交易确认、适当性与系统消息。点击未读消息可标记已读。</p>
    <div v-if="error" class="alert alert-error">{{ error }}</div>
    <ul class="list" v-if="list.length">
      <li
        v-for="m in list"
        :key="m.messageId"
        class="panel item"
        :class="{ unread: !m.read }"
        @click="onOpen(m)"
      >
        <div class="row">
          <strong>{{ m.title }}</strong>
          <span class="cat">{{ m.category || 'SYSTEM' }}</span>
        </div>
        <p>{{ m.content }}</p>
        <time>{{ m.createdAt }}</time>
      </li>
    </ul>
    <p v-else class="empty">暂无消息</p>
  </div>
</template>

<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { listMessages, markMessageRead } from '@/api/document'
import type { UserMessage } from '@/types/document'

const list = ref<UserMessage[]>([])
const error = ref('')

async function onOpen(m: UserMessage) {
  if (m.read) return
  try {
    const updated = await markMessageRead(m.messageId)
    m.read = updated.read
  } catch {
    m.read = true
  }
}

onMounted(async () => {
  try {
    const page = await listMessages({ page: 1, pageSize: 50 })
    list.value = page.list
  } catch (e) {
    error.value = e instanceof Error ? e.message : '加载失败'
  }
})
</script>

<style scoped>
.list {
  list-style: none;
  margin: 0;
  padding: 0;
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
  max-width: 720px;
}
.item {
  padding: 1rem 1.15rem;
  cursor: pointer;
}
.item.unread {
  border-left: 3px solid var(--brand-accent);
}
.row {
  display: flex;
  justify-content: space-between;
  gap: 1rem;
  margin-bottom: 0.35rem;
}
.cat {
  font-size: 0.72rem;
  color: var(--text-muted);
  font-family: var(--font-mono);
}
p {
  margin: 0 0 0.5rem;
  color: var(--text-secondary);
  font-size: 0.9rem;
  line-height: 1.5;
}
time {
  font-size: 0.75rem;
  color: var(--text-muted);
}
</style>
