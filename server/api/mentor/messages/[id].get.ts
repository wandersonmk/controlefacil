import { createClient } from '@supabase/supabase-js'

export default defineEventHandler(async (event) => {
  try {
    const config = useRuntimeConfig()
    
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

    const conversationId = getRouterParam(event, 'id')
    if (!conversationId) {
      throw createError({
        statusCode: 400,
        message: 'ID da conversa é obrigatório'
      })
    }

    // Verificar se conversa pertence ao usuário
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

    // Buscar mensagens da conversa
    const { data: messages, error: msgError } = await supabase
      .from('mentor_messages')
      .select('id, role, content, tokens_used, created_at')
      .eq('conversation_id', conversationId)
      .order('created_at', { ascending: true })

    if (msgError) {
      throw createError({
        statusCode: 500,
        message: 'Erro ao buscar mensagens'
      })
    }

    return {
      success: true,
      conversation,
      messages: messages || []
    }

  } catch (error: any) {
    console.error('Erro ao buscar mensagens:', error)
    throw createError({
      statusCode: error.statusCode || 500,
      message: error.message || 'Erro ao buscar mensagens'
    })
  }
})
