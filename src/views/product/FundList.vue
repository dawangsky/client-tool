<template>
  <div>
    <p class="page-sub">浏览可交易基金，点击进入详情后可申购。</p>
    <div class="toolbar panel">
      <input v-model="keyword" placeholder="搜索基金代码 / 名称" @keyup.enter="load" />
      <button class="btn btn-primary" type="button" @click="load">搜索</button>
    </div>
    <div v-if="error" class="alert alert-error">{{ error }}</div>
    <div class="panel table-wrap">
      <table class="data-table" v-if="list.length">
        <thead>
          <tr>
            <th>基金名称</th>
            <th>代码</th>
            <th>风险</th>
            <th>状态</th>
            <th class="num">起购(元)</th>
            <th>截点</th>
            <th></th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="f in list" :key="f.fundCode">
            <td>{{ f.fundName }}</td>
            <td class="num">{{ f.fundCode }}</td>
            <td>{{ f.riskLevel }}</td>
            <td>{{ statusLabel(f.status) }}</td>
            <td class="num">{{ (f.minPurchaseAmount / 100).toFixed(2) }}</td>
            <td>{{ f.cutOffTime }}</td>
            <td><router-link :to="`/funds/${f.fundCode}`">详情</router-link></td>
          </tr>
        </tbody>
      </table>
      <p v-else class="empty">暂无产品</p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { listFunds } from '@/api/product'
import type { Fund, FundStatus } from '@/types/product'

const list = ref<Fund[]>([])
const keyword = ref('')
const error = ref('')

const STATUS: Record<FundStatus, string> = {
  NORMAL: '正常开放',
  SUSPEND_PURCHASE: '暂停申购',
  SUSPEND_REDEEM: '暂停赎回',
  CLOSED: '已封闭',
}

function statusLabel(s: FundStatus) {
  return STATUS[s] || s
}

async function load() {
  error.value = ''
  try {
    const page = await listFunds({ page: 1, pageSize: 50, keyword: keyword.value || undefined })
    list.value = page.list
  } catch (e) {
    error.value = e instanceof Error ? e.message : '加载失败'
  }
}

onMounted(load)
</script>

<style scoped>
.toolbar {
  display: flex;
  gap: 0.5rem;
  padding: 0.75rem;
  margin-bottom: 1rem;
}
.toolbar input {
  flex: 1;
  height: 36px;
  border: 1px solid var(--border-strong);
  border-radius: var(--radius-sm);
  padding: 0 0.75rem;
}
.table-wrap {
  overflow: auto;
}
</style>
