import { createClient } from '@supabase/supabase-js'

// API pública para lojistas visualizarem fornecedores parceiros
export default defineEventHandler(async (event) => {
  try {
    // Verificar autenticação
    const authHeader = getRequestHeader(event, 'authorization')
    if (!authHeader) {
      throw createError({
        statusCode: 401,
        message: 'Não autorizado'
      })
    }

    // Inicializar cliente Supabase
    const supabaseUrl = process.env.NUXT_PUBLIC_SUPABASE_URL!
    const supabaseKey = process.env.NUXT_PUBLIC_SUPABASE_ANON_KEY!
    const supabase = createClient(supabaseUrl, supabaseKey, {
      global: {
        headers: {
          Authorization: authHeader
        }
      }
    })

    // Verificar se usuário está autenticado
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      throw createError({
        statusCode: 401,
        message: 'Token inválido'
      })
    }

    // Buscar fornecedores parceiros ativos (RLS policy permite leitura)
    const { data: fornecedores, error: fornecedoresError } = await supabase
      .from('fornecedores_parceiros')
      .select('*')
      .eq('ativo', true)
      .order('destaque', { ascending: false })
      .order('nome', { ascending: true })

    if (fornecedoresError) {
      throw createError({
        statusCode: 500,
        message: `Erro ao buscar fornecedores parceiros: ${fornecedoresError.message}`
      })
    }

    return {
      success: true,
      fornecedores: fornecedores || []
    }
  } catch (error: any) {
    console.error('Erro ao listar fornecedores parceiros:', error)
    throw createError({
      statusCode: error.statusCode || 500,
      message: error.message || 'Erro ao listar fornecedores parceiros'
    })
  }
})
