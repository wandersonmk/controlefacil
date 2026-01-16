import { createClient } from '@supabase/supabase-js'

export default defineEventHandler(async (event) => {
  try {
    const config = useRuntimeConfig()
    const conversationId = getRouterParam(event, 'id')
    
    if (!conversationId) {
      throw createError({
        statusCode: 400,
        message: 'ID da conversa não fornecido'
      })
    }

    const authHeader = getHeader(event, 'authorization')
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw createError({
        statusCode: 401,
        message: 'Não autenticado'
      })
    }

    const token = authHeader.replace('Bearer ', '')
    
    const supabase = createClient(
      config.public.supabaseUrl,
      config.public.supabaseAnonKey,
      {
        global: {
          headers: {
            Authorization: authHeader
          }
        }
      }
    )

    const { data: { user }, error: userError } = await supabase.auth.getUser(token)
    if (userError || !user) {
      throw createError({
        statusCode: 401,
        message: 'Não autenticado'
      })
    }

    // Verificar se a conversa pertence ao usuário
    const { data: conversation, error: convError } = await supabase
      .from('mentor_conversations')
      .select('*')
      .eq('id', conversationId)
      .eq('user_id', user.id)
      .single()

    if (convError || !conversation) {
      throw createError({
        statusCode: 404,
        message: 'Conversa não encontrada'
      })
    }

    // Buscar total de tokens usados nesta conversa
    const { data: messages } = await supabase
      .from('mentor_messages')
      .select('tokens_used')
      .eq('conversation_id', conversationId)

    const totalTokens = messages?.reduce((sum, msg) => sum + (msg.tokens_used || 0), 0) || 0

    return {
      success: true,
      conversationId,
      tokensUsed: totalTokens
    }

  } catch (error: any) {
    console.error('Erro ao buscar tokens da conversa:', error)
    throw createError({
      statusCode: error.statusCode || 500,
      message: error.message || 'Erro ao buscar tokens da conversa'
    })
  }
})
