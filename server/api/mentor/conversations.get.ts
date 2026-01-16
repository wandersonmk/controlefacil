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

    // Buscar conversas do usuário
    const { data: conversations, error } = await supabase
      .from('mentor_conversations')
      .select('id, title, created_at, updated_at')
      .eq('user_id', user.id)
      .order('updated_at', { ascending: false })
      .limit(50)

    if (error) {
      throw createError({
        statusCode: 500,
        message: 'Erro ao buscar conversas'
      })
    }

    return {
      success: true,
      conversations: conversations || []
    }

  } catch (error: any) {
    console.error('Erro ao buscar conversas:', error)
    throw createError({
      statusCode: error.statusCode || 500,
      message: error.message || 'Erro ao buscar conversas'
    })
  }
})
