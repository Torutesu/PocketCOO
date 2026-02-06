export interface Memory {
  id: string
  memory: string
  user_id: string
  created_at: string
  metadata: Record<string, any>
}

export interface ChatMessage {
  role: 'user' | 'assistant'
  content: string
}
