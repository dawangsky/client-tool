/**
 * 操作审计客户端。
 * - 后端 `POST /api/v1/audit/events` 就绪后直接上报
 * - 未就绪时写入本地队列（localStorage），并打 TODO 标记便于联调
 */
import { api } from '@/api/http'
import type { AuditEvent } from '@/types/audit'
import { useMock } from '@/api/mock'

const QUEUE_KEY = 'fund_audit_queue'

function readQueue(): AuditEvent[] {
  try {
    const raw = localStorage.getItem(QUEUE_KEY)
    return raw ? (JSON.parse(raw) as AuditEvent[]) : []
  } catch {
    return []
  }
}

function writeQueue(events: AuditEvent[]) {
  localStorage.setItem(QUEUE_KEY, JSON.stringify(events.slice(-200)))
}

export function enqueueAudit(event: AuditEvent) {
  const item: AuditEvent = {
    ...event,
    clientTs: event.clientTs || new Date().toISOString(),
  }
  const q = readQueue()
  q.push(item)
  writeQueue(q)
  return item
}

export async function reportAudit(event: AuditEvent): Promise<void> {
  const item = enqueueAudit(event)
  if (useMock) {
    // TODO(WOR-7): mock 下仅本地队列，不打真实接口
    return
  }
  try {
    await api.post<void>('/audit/events', item)
    // 成功则从队列移除末尾匹配项（简化）
    const q = readQueue().filter(
      (e) => !(e.action === item.action && e.clientTs === item.clientTs),
    )
    writeQueue(q)
  } catch {
    // 保留在本地队列，下次启动可 flush
  }
}

/** 尝试刷本地积压（登录后 / 定时调用） */
export async function flushAuditQueue(): Promise<number> {
  if (useMock) return 0
  const q = readQueue()
  if (!q.length) return 0
  let sent = 0
  const remain: AuditEvent[] = []
  for (const ev of q) {
    try {
      await api.post<void>('/audit/events', ev)
      sent += 1
    } catch {
      remain.push(ev)
    }
  }
  writeQueue(remain)
  return sent
}

export function peekAuditQueue(): AuditEvent[] {
  return readQueue()
}
