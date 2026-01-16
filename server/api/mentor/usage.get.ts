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

    // Buscar saldo de tokens do usuário
    const { data: tokenBalance, error: balanceError } = await supabase
      .from('user_token_balance')
      .select('*')
      .eq('user_id', user.id)
      .single()

    if (balanceError) {
      // Se não existe registro, criar um com valores padrão
      const { data: newBalance } = await supabase
        .from('user_token_balance')
        .insert({
          user_id: user.id,
          total_tokens: 10000,
          used_tokens: 0,
          plan_type: 'free'
        })
        .select()
        .single()

      if (newBalance) {
        return {
          success: true,
          tokensAvailable: 10000,
          tokensToday: 0,
          tokensMonth: 0,
          totalTokens: 10000,
          usedTokens: 0,
          date: new Date().toISOString().split('T')[0]
        }
      }
    }

    // Buscar uso de tokens do dia atual
    const today = new Date().toISOString().split('T')[0]
    const { data: todayUsage } = await supabase
      .from('mentor_usage')
      .select('tokens_used')
      .eq('user_id', user.id)
      .eq('date', today)
      .single()

    // Buscar uso do mês atual
    const firstDayOfMonth = new Date()
    firstDayOfMonth.setDate(1)
    const firstDay = firstDayOfMonth.toISOString().split('T')[0]

    const { data: monthUsage } = await supabase
      .from('mentor_usage')
      .select('tokens_used')
      .eq('user_id', user.id)
      .gte('date', firstDay)

    const totalMonthTokens = monthUsage?.reduce((sum, record) => sum + record.tokens_used, 0) || 0

    return {
      success: true,
      tokensAvailable: tokenBalance?.available_tokens || 0,
      tokensToday: todayUsage?.tokens_used || 0,
      tokensMonth: totalMonthTokens,
      totalTokens: tokenBalance?.total_tokens || 0,
      usedTokens: tokenBalance?.used_tokens || 0,
      date: today
    }

  } catch (error: any) {
    console.error('Erro ao buscar uso de tokens:', error)
    throw createError({
      statusCode: error.statusCode || 500,
      message: error.message || 'Erro ao buscar uso de tokens'
    })
  }
})
