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
      .eq('auth_user_id', user.id)
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
      .eq('auth_user_id', user.id)
      .single()

    const subscriptionStatusValue = subscriptionStatus?.subscription_status || 'trial'
    const daysRemainingValue = subscriptionStatus?.days_remaining || 0
    const hasTrialEndDate = !!subscriptionStatus?.trial_ends_at

    // Regra de bloqueio: quando NÃO está ativo e o trial acabou (0 dias restantes)
    // (Não bloqueia plano ativo mesmo que days_remaining esteja 0 no dia da renovação.)
    const isBlocked =
      subscriptionStatusValue !== 'active' &&
      hasTrialEndDate &&
      daysRemainingValue <= 0

    return {
      success: true,
      isBlocked,
      subscriptionStatus: subscriptionStatusValue,
      subscriptionPlan: subscriptionStatus?.subscription_plan || 'free',
      subscriptionPeriod: subscriptionStatus?.subscription_renews_at || subscriptionStatus?.subscription_period || null,
      trialEndsAt: subscriptionStatus?.trial_ends_at,
      daysRemaining: daysRemainingValue,
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
