import type { MentorConversation, MentorMessage, MentorUsage, ChatResponse } from '~~/shared/types/mentor.types'

// Estado global compartilhado
const globalState = {
  conversationId: ref<string | null>(null),
  conversations: ref<MentorConversation[]>([]),
  messages: ref<MentorMessage[]>([]),
  usage: ref<MentorUsage | null>(null),
  isLoading: ref(false),
  isSending: ref(false)
}

export const useMentor = () => {
  const { conversationId, conversations, messages, usage, isLoading, isSending } = globalState

  // Verificar se há tokens disponíveis
  const hasTokens = computed(() => {
    return (usage.value?.tokensAvailable || 0) > 0
  })

  // Helper para obter headers com token (só no cliente)
  const getAuthHeaders = async () => {
    const headers: Record<string, string> = {}
    if (process.server) return headers
    
    try {
      const supabase = useSupabaseClient()
      const { data: { session } } = await supabase.auth.getSession()
      
      if (session?.access_token) headers.Authorization = `Bearer ${session.access_token}`
    } catch (error) {
      console.error('Erro ao obter token:', error)
    }

    return headers
  }

  // Buscar uso de tokens
  const fetchUsage = async () => {
    if (process.server) return
    
    try {
      const headers = await getAuthHeaders()
      const response = await $fetch<{ success: boolean } & MentorUsage>('/api/mentor/usage', { headers })
      if (response.success) {
        usage.value = {
          tokensToday: response.tokensToday,
          tokensMonth: response.tokensMonth,
          tokensAvailable: response.tokensAvailable,
          tokensConversation: usage.value?.tokensConversation || 0,
          totalTokens: response.totalTokens,
          usedTokens: response.usedTokens,
          date: response.date
        }
        
        // Atualizar tokens da conversa se houver uma ativa
        if (conversationId.value) {
          await fetchConversationTokens(conversationId.value)
        }
      }
    } catch (error) {
      console.error('Erro ao buscar uso:', error)
    }
  }

  // Revalidar tokens periodicamente (segurança contra manipulação frontend)
  if (process.client) {
    setInterval(() => {
      fetchUsage()
    }, 30000) // A cada 30 segundos
  }

  // Buscar tokens usados na conversa atual
  const fetchConversationTokens = async (convId: string) => {
    if (process.server) return
    
    try {
      const headers = await getAuthHeaders()
      const response = await $fetch<{ success: boolean; tokensUsed: number }>(`/api/mentor/conversation-tokens/${convId}`, { headers })
      if (response.success && usage.value) {
        usage.value.tokensConversation = response.tokensUsed
      }
    } catch (error) {
      console.error('Erro ao buscar tokens da conversa:', error)
    }
  }

  // Buscar conversas
  const fetchConversations = async () => {
    if (process.server) return
    
    try {
      isLoading.value = true
      const headers = await getAuthHeaders()
      const response = await $fetch<{ success: boolean; conversations: MentorConversation[] }>('/api/mentor/conversations', { headers })
      if (response.success) {
        conversations.value = response.conversations
      }
    } catch (error) {
      console.error('Erro ao buscar conversas:', error)
    } finally {
      isLoading.value = false
    }
  }

  // Buscar mensagens de uma conversa
  const fetchMessages = async (convId: string) => {
    if (process.server) return
    
    try {
      isLoading.value = true
      console.log('📨 fetchMessages chamado para:', convId)
      const headers = await getAuthHeaders()
      console.log('🔑 Headers para fetchMessages:', headers)
      
      const response = await $fetch<{ 
        success: boolean
        conversation: MentorConversation
        messages: MentorMessage[] 
      }>(`/api/mentor/messages/${convId}`, { headers })
      
      console.log('📬 Resposta do fetchMessages:', response)
      
      if (response.success) {
        console.log('✅ Mensagens carregadas:', response.messages.length)
        messages.value = response.messages
        conversationId.value = convId
        console.log('📊 Array de mensagens atualizado:', messages.value.length)
      }
    } catch (error) {
      console.error('❌ Erro ao buscar mensagens:', error)
    } finally {
      isLoading.value = false
    }
  }

  // Enviar mensagem
  const sendMessage = async (message: string) => {
    if (process.server) return
    
    try {
      isSending.value = true
      console.log('🚀 Enviando mensagem:', message)

      // Adicionar mensagem do usuário otimisticamente
      const userMessage: MentorMessage = {
        id: 'temp-' + Date.now(),
        conversation_id: conversationId.value || '',
        role: 'user',
        content: message,
        tokens_used: 0,
        created_at: new Date().toISOString()
      }
      messages.value.push(userMessage)
      console.log('✅ Mensagem do usuário adicionada ao array')

      const headers = await getAuthHeaders()
      console.log('🔑 Headers obtidos:', headers)
      
      console.log('📡 Fazendo requisição para API...')
      const response = await $fetch<ChatResponse>('/api/mentor/chat', {
        method: 'POST',
        headers,
        body: {
          conversationId: conversationId.value,
          message
        }
      })
      
      console.log('📥 Resposta recebida:', response)

      if (response.success) {
        console.log('✅ Resposta bem-sucedida')
        
        // Atualizar conversationId se for nova conversa
        if (!conversationId.value) {
          console.log('🆕 Nova conversa criada:', response.conversationId)
          conversationId.value = response.conversationId
        }

        // Remover mensagens temporárias
        messages.value = messages.value.filter((m: MentorMessage) => !m.id.startsWith('temp-'))
        
        // Buscar mensagens reais do banco
        console.log('📥 Buscando mensagens do banco...')
        await fetchMessages(response.conversationId)

        // A resposta já chegou: esconder o "analisando" imediatamente.
        // As atualizações auxiliares podem rodar em background.
        isSending.value = false

        // Atualizar uso e lista de conversas sem bloquear a UI
        void fetchUsage().catch((e) => console.error('Erro ao atualizar uso:', e))
        void fetchConversations().catch((e) => console.error('Erro ao atualizar conversas:', e))
      } else {
        console.error('❌ Resposta sem sucesso:', response)
      }

      return response
    } catch (error: any) {
      console.error('❌ Erro ao enviar mensagem:', error)
      console.error('Detalhes do erro:', {
        message: error.message,
        data: error.data,
        statusCode: error.statusCode
      })
      
      // Remover mensagem do usuário em caso de erro
      messages.value = messages.value.filter((m: MentorMessage) => !m.id.startsWith('temp-'))
      
      // Se for erro de tokens insuficientes, atualizar usage imediatamente
      if (error.statusCode === 403) {
        await fetchUsage()
        const toast = await useToastSafe()
        toast?.error?.('Tokens insuficientes. Aguarde a renovação mensal ou adquira tokens extras.')
      }
      
      throw error
    } finally {
      console.log('🏁 Finalizando envio, isSending = false')
      isSending.value = false
    }
  }

  // Nova conversa
  const startNewConversation = () => {
    conversationId.value = null
    messages.value = []
  }

  // Selecionar conversa
  const selectConversation = async (convId: string) => {
    await fetchMessages(convId)
  }

  // Apagar conversa
  const deleteConversation = async (convId: string) => {
    if (process.server) return

    try {
      const headers = await getAuthHeaders()
      const response = await $fetch<{ success: boolean }>(`/api/mentor/conversations/${convId}`, {
        method: 'DELETE',
        headers
      })

      if (response.success) {
        if (conversationId.value === convId) {
          conversationId.value = null
          messages.value = []
          if (usage.value) usage.value.tokensConversation = 0
        }

        await fetchConversations()
      }

      return response
    } catch (error) {
      console.error('Erro ao apagar conversa:', error)
      throw error
    }
  }

  return {
    conversationId,
    conversations,
    messages,
    usage,
    isLoading,
    isSending,
    hasTokens,
    fetchUsage,
    fetchConversations,
    fetchMessages,
    sendMessage,
    startNewConversation,
    selectConversation,
    deleteConversation
  }
}
