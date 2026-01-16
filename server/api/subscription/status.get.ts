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

    // Buscar status de assinatura do usuário
    const { data: subscriptionStatus, error } = await supabase
      .from('user_subscription_status')
      .select('*')
      .eq('user_id', user.id)
      .single()

    if (error) {
      throw createError({
        statusCode: 500,
        message: 'Erro ao buscar status de assinatura'
      })
    }

    // Buscar informações de ações disponíveis
    const { data: subscriptionActions } = await supabase
      .from('user_subscription_actions')
      .select('*')
      .eq('user_id', user.id)
      .single()

    return {
      success: true,
      isBlocked: subscriptionStatus?.is_blocked || false,
      subscriptionStatus: subscriptionStatus?.subscription_status || 'trial',
      subscriptionPlan: subscriptionStatus?.subscription_plan || 'free',
      subscriptionPeriod: subscriptionStatus?.subscription_period || null,
      trialEndsAt: subscriptionStatus?.trial_ends_at,
      daysRemaining: subscriptionStatus?.days_remaining || 0,
      empresaNome: subscriptionStatus?.empresa_nome,
      planDisplayName: subscriptionStatus?.plan_display_name || 'Free',
      canRenewSamePlan: subscriptionActions?.can_renew_same_plan !== false
    }

  } catch (error: any) {
    console.error('Erro ao verificar status de assinatura:', error)
    throw createError({
      statusCode: error.statusCode || 500,
      message: error.message || 'Erro ao verificar status de assinatura'
    })
  }
})
