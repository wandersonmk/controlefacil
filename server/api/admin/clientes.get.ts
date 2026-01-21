import { createClient } from '@supabase/supabase-js'

export default defineEventHandler(async (event) => {
  // Usa o service role client para bypassar RLS
  const supabaseUrl = process.env.NUXT_PUBLIC_SUPABASE_URL || ''
  const supabaseServiceKey = process.env.NUXT_SUPABASE_SERVICE_ROLE_KEY || ''
  
  const supabase = createClient(supabaseUrl, supabaseServiceKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  })

  try {
    // Busca todas as empresas
    const { data: empresas, error: empresasError } = await supabase
      .from('empresas')
      .select(`
        id,
        nome,
        email,
        whatsapp,
        subscription_status,
        subscription_plan,
        subscription_period,
        trial_ends_at,
        subscription_renews_at,
        ativo,
        created_at,
        auth_user_id
      `)
      .order('created_at', { ascending: false })

    if (empresasError) throw empresasError

    // Para cada empresa, buscar os tokens do usuário
    const clientesComTokens = await Promise.all(
      (empresas || []).map(async (empresa) => {
        let tokenData = {
          total_tokens: 10000,
          used_tokens: 0,
          available_tokens: 10000
        }

        if (empresa.auth_user_id) {
          const { data: tokens } = await supabase
            .from('user_token_balance')
            .select('total_tokens, used_tokens, available_tokens')
            .eq('user_id', empresa.auth_user_id)
            .single()

          if (tokens) {
            tokenData = tokens
          }
        }

        return {
          id: empresa.id,
          nome: empresa.nome,
          email: empresa.email || '',
          whatsapp: empresa.whatsapp,
          subscription_status: empresa.subscription_status || 'trial',
          subscription_plan: empresa.subscription_plan || 'free',
          subscription_period: empresa.subscription_period || 'trial',
          trial_ends_at: empresa.trial_ends_at,
          subscription_renews_at: empresa.subscription_renews_at,
          ativo: empresa.ativo,
          created_at: empresa.created_at,
          total_tokens: tokenData.total_tokens,
          used_tokens: tokenData.used_tokens,
          available_tokens: tokenData.available_tokens
        }
      })
    )

    return {
      success: true,
      data: clientesComTokens
    }
  } catch (error: any) {
    console.error('Erro ao buscar clientes:', error)
    return {
      success: false,
      error: error.message
    }
  }
})
