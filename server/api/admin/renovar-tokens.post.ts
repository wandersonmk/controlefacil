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
  
  const { clienteId, totalTokens } = body

  if (!clienteId || !totalTokens) {
    throw createError({
      statusCode: 400,
      message: 'clienteId e totalTokens são obrigatórios'
    })
  }

  try {
    // Busca o auth_user_id da empresa
    const { data: empresa, error: empresaError } = await supabase
      .from('empresas')
      .select('auth_user_id, subscription_plan')
      .eq('id', clienteId)
      .single()

    if (empresaError) throw empresaError
    if (!empresa?.auth_user_id) throw new Error('Usuário não vinculado à empresa')

    // Verifica se já existe registro de tokens
    const { data: existingTokens } = await supabase
      .from('user_token_balance')
      .select('id, total_tokens, used_tokens')
      .eq('user_id', empresa.auth_user_id)
      .single()

    if (existingTokens) {
      // Atualiza tokens existentes - SOMA aos tokens atuais
      const { error: updateError } = await supabase
        .from('user_token_balance')
        .update({
          total_tokens: existingTokens.total_tokens + totalTokens,
          // Mantém used_tokens (não zera o histórico de uso)
          updated_at: new Date().toISOString()
        })
        .eq('user_id', empresa.auth_user_id)

      if (updateError) throw updateError
    } else {
      // Cria novo registro de tokens
      const { error: insertError } = await supabase
        .from('user_token_balance')
        .insert({
          user_id: empresa.auth_user_id,
          total_tokens: totalTokens,
          used_tokens: 0,
          plan_type: empresa.subscription_plan || 'free'
        })

      if (insertError) throw insertError
    }

    return {
      success: true,
      message: 'Tokens renovados com sucesso'
    }
  } catch (error: any) {
    console.error('Erro ao renovar tokens:', error)
    throw createError({
      statusCode: 500,
      message: error.message
    })
  }
})
