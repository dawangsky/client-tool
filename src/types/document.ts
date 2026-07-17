/** 消息 / 单据 */

export interface UserMessage {
  messageId: string
  title: string
  content: string
  read: boolean
  createdAt: string
  category?: 'TRADE' | 'SYSTEM' | 'SUITABILITY'
}
