<template>
  <router-view />
</template>

<script setup lang="ts">
import { useSessionSocket } from '@/composables/useSessionSocket'

/** 全局唯一 WebSocket：按消息 type 分发（下线 / 设备列表变更） */
useSessionSocket()
</script>
