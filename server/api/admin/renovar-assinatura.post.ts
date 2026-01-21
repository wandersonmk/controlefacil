import { createClient } from '@supabase/supabase-js'

export default defineEventHandler(async (event) => {
  const supabaseUrl = process.env.NUXT_PUBLIC_SUPABASE_URL || ''
  const supabaseServiceKey = process.env.NUXT_SUPABASE_SERVICE_ROLE_KEY || ''
  
  const supabase = createClient(supabaseUrl, supabaseServiceKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  })
  
  const body = await readBody(event)
  
  const { clienteId, plan, period } = body

  if (!clienteId || !plan || !period) {
    throw createError({
      statusCode: 400,
      message: 'clienteId, plan e period são obrigatórios'
    })
  }

  try {
    // Mapeamento de tokens por período/plano
    const tokensByPeriod: Record<string, number> = {
      trial: 10000,
      '1month': 100000,
      '6months': 250000,
      '12months': 500000
    }
    
    const tokensToAdd = tokensByPeriod[period] || 0

    // Calcula data de renovação usando dias fixos
    const now = new Date()
    let days = 30 // 1 mês por padrão
    
    if (period === 'trial') days = 7
    if (period === '1month') days = 30
    if (period === '6months') days = 180
    if (period === '12months') days = 365
    
    const renewDate = new Date(now)
    renewDate.setDate(renewDate.getDate() + days)

    // Atualiza a empresa
    const updates: any = {
      subscription_plan: plan,
      subscription_period: period,
      subscription_status: 'active',
      ativo: true,
      updated_at: new Date().toISOString()
    }

    if (period === 'trial') {
      updates.trial_ends_at = renewDate.toISOString()
      updates.subscription_renews_at = null
    } else {
      updates.subscription_renews_at = renewDate.toISOString()
      updates.trial_ends_at = null
    }

    const { data: empresa, error: updateError } = await supabase
      .from('empresas')
      .update(updates)
      .eq('id', clienteId)
      .select('auth_user_id')
      .single()

    if (updateError) throw updateError
    if (!empresa?.auth_user_id) throw new Error('Usuário não vinculado à empresa')

    // Adiciona tokens ao saldo do usuário
    const { data: existingTokens } = await supabase
      .from('user_token_balance')
      .select('id, total_tokens, used_tokens')
      .eq('user_id', empresa.auth_user_id)
      .single()

    if (existingTokens) {
      // Soma aos tokens existentes
      await supabase
        .from('user_token_balance')
        .update({
          total_tokens: existingTokens.total_tokens + tokensToAdd,
          plan_type: plan,
          updated_at: new Date().toISOString()
        })
        .eq('user_id', empresa.auth_user_id)
    } else {
      // Cria novo registro
      await supabase
        .from('user_token_balance')
        .insert({
          user_id: empresa.auth_user_id,
          total_tokens: tokensToAdd,
          used_tokens: 0,
          plan_type: plan
        })
    }

    return {
      success: true,
      message: 'Assinatura renovada com sucesso'
    }
  } catch (error: any) {
    console.error('Erro ao renovar assinatura:', error)
    throw createError({
      statusCode: 500,
      message: error.message
    })
  }
})
