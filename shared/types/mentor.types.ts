export interface MentorConversation {
  id: string
  user_id: string
  title: string
  created_at: string
  updated_at: string
}

export interface MentorMessage {
  id: string
  conversation_id: string
  role: 'user' | 'assistant'
  content: string
  tokens_used: number
  created_at: string
}

export interface MentorUsage {
  tokensToday: number
  tokensMonth: number
  tokensAvailable: number
  tokensConversation: number
  totalTokens: number
  usedTokens: number
  date: string
}

export interface ChatResponse {
  success: boolean
  conversationId: string
  message: string
  tokensUsed: number
}
