import { createClient } from '@supabase/supabase-js'

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

    // Inicializar cliente Supabase com service role
    const supabaseUrl = process.env.NUXT_PUBLIC_SUPABASE_URL!
    const supabaseServiceKey = process.env.NUXT_SUPABASE_SERVICE_ROLE_KEY!
    const supabase = createClient(supabaseUrl, supabaseServiceKey)

    // Verificar se é superAdmin
    const token = authHeader.replace('Bearer ', '')
    const { data: { user }, error: authError } = await supabase.auth.getUser(token)

    if (authError || !user) {
      throw createError({
        statusCode: 401,
        message: 'Token inválido'
      })
    }

    // Buscar role do usuário
    const { data: usuarioData, error: usuarioError } = await supabase
      .from('usuarios')
      .select('role')
      .eq('auth_user_id', user.id)
      .single()

    if (usuarioError || !usuarioData || usuarioData.role !== 'superAdmin') {
      throw createError({
        statusCode: 403,
        message: 'Acesso negado. Apenas SuperAdmin pode gerenciar fornecedores parceiros.'
      })
    }

    // Buscar todos os fornecedores parceiros
    const { data: fornecedores, error: fornecedoresError } = await supabase
      .from('fornecedores_parceiros')
      .select('*')
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
