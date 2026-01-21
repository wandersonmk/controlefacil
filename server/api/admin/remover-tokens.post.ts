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
  
  const { clienteId, tokensToRemove } = body

  if (!clienteId || !tokensToRemove) {
    throw createError({
      statusCode: 400,
      message: 'clienteId e tokensToRemove são obrigatórios'
    })
  }

  if (tokensToRemove <= 0) {
    throw createError({
      statusCode: 400,
      message: 'tokensToRemove deve ser maior que zero'
    })
  }

  try {
    // Busca o auth_user_id da empresa
    const { data: empresa, error: empresaError } = await supabase
      .from('empresas')
      .select('auth_user_id')
      .eq('id', clienteId)
      .single()

    if (empresaError) throw empresaError
    if (!empresa?.auth_user_id) throw new Error('Usuário não vinculado à empresa')

    // Busca o saldo atual de tokens
    const { data: tokenBalance, error: balanceError } = await supabase
      .from('user_token_balance')
      .select('id, total_tokens, used_tokens')
      .eq('user_id', empresa.auth_user_id)
      .single()

    if (balanceError) throw balanceError
    if (!tokenBalance) throw new Error('Registro de tokens não encontrado')

    // Calcula tokens disponíveis
    const availableTokens = tokenBalance.total_tokens - tokenBalance.used_tokens

    // Valida se há tokens suficientes para remover
    if (tokensToRemove > availableTokens) {
      throw createError({
        statusCode: 400,
        message: `Não é possível remover ${tokensToRemove} tokens. Apenas ${availableTokens} tokens disponíveis.`
      })
    }

    // Remove tokens do total (subtrai)
    const newTotalTokens = tokenBalance.total_tokens - tokensToRemove

    // Garante que total_tokens não fique menor que used_tokens
    if (newTotalTokens < tokenBalance.used_tokens) {
      throw createError({
        statusCode: 400,
        message: 'Erro ao calcular novos tokens. Total não pode ser menor que tokens usados.'
      })
    }

    // Atualiza o saldo de tokens
    const { error: updateError } = await supabase
      .from('user_token_balance')
      .update({
        total_tokens: newTotalTokens,
        updated_at: new Date().toISOString()
      })
      .eq('user_id', empresa.auth_user_id)

    if (updateError) throw updateError

    return {
      success: true,
      message: 'Tokens removidos com sucesso',
      newTotalTokens,
      availableTokens: newTotalTokens - tokenBalance.used_tokens
    }
  } catch (error: any) {
    console.error('Erro ao remover tokens:', error)
    throw createError({
      statusCode: error.statusCode || 500,
      message: error.message || 'Erro ao remover tokens'
    })
  }
})
