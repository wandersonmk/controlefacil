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

    // Buscar empresa/assinatura do usuário diretamente da tabela empresas
    const { data: empresa, error } = await supabase
      .from('empresas')
      .select('*')
      .eq('auth_user_id', user.id)
      .single()

    if (error) {
      console.error('Erro ao buscar empresa:', error)
      throw createError({
        statusCode: 500,
        message: `Erro ao buscar status de assinatura: ${error.message}`
      })
    }

    if (!empresa) {
      console.error('Empresa não encontrada para user.id:', user.id)
      // Retorna dados padrão para usuários sem empresa
      return {
        success: true,
        isBlocked: false,
        subscriptionStatus: 'trial',
        subscriptionPlan: 'free',
        subscriptionPeriod: null,
        subscriptionRenewsAt: null,
        trialEndsAt: null,
        daysRemaining: 7,
        empresaNome: 'Sem empresa',
        planDisplayName: 'Gratuito',
        canRenewSamePlan: true
      }
    }

    const subscriptionStatusValue = empresa.subscription_status || 'trial'
    
    // Calcula dias restantes
    let daysRemainingValue = 0
    const now = new Date()
    
    if (empresa.subscription_status === 'active' && empresa.subscription_renews_at) {
      const renewDate = new Date(empresa.subscription_renews_at)
      const diff = renewDate.getTime() - now.getTime()
      daysRemainingValue = Math.ceil(diff / (1000 * 60 * 60 * 24))
    } else if (empresa.trial_ends_at) {
      const trialDate = new Date(empresa.trial_ends_at)
      const diff = trialDate.getTime() - now.getTime()
      daysRemainingValue = Math.ceil(diff / (1000 * 60 * 60 * 24))
    }

    const hasTrialEndDate = !!empresa.trial_ends_at

    // Regra de bloqueio: 
    // 1. Trial expirado (trial_ends_at existe e já passou)
    // 2. Assinatura ativa mas vencida (subscription_renews_at existe e já passou)
    // 3. Assinatura cancelada ou expirada
    const isBlocked =
      (subscriptionStatusValue === 'trial' && hasTrialEndDate && daysRemainingValue <= 0) ||
      (subscriptionStatusValue === 'active' && empresa.subscription_renews_at && daysRemainingValue <= 0) ||
      (subscriptionStatusValue === 'canceled' || subscriptionStatusValue === 'expired')

    return {
      success: true,
      isBlocked,
      subscriptionStatus: subscriptionStatusValue,
      subscriptionPlan: empresa.subscription_plan || 'free',
      subscriptionPeriod: empresa.subscription_period || null,
      subscriptionRenewsAt: empresa.subscription_renews_at || null,
      trialEndsAt: empresa.trial_ends_at,
      daysRemaining: daysRemainingValue,
      empresaNome: empresa.nome,
      planDisplayName: empresa.subscription_plan === 'pro' ? 'Pro' : 
                       empresa.subscription_plan === 'basic' ? 'Básico' : 
                       empresa.subscription_plan === 'enterprise' ? 'Enterprise' : 'Gratuito',
      canRenewSamePlan: true
    }

  } catch (error: any) {
    console.error('Erro ao verificar status de assinatura:', error)
    throw createError({
      statusCode: error.statusCode || 500,
      message: error.message || 'Erro ao verificar status de assinatura'
    })
  }
})
