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
        message: 'Acesso negado. Apenas SuperAdmin pode excluir fornecedores parceiros.'
      })
    }

    // Pegar ID do body
    const body = await readBody(event)
    const { id } = body

    if (!id) {
      throw createError({
        statusCode: 400,
        message: 'ID do fornecedor parceiro é obrigatório'
      })
    }

    // Excluir fornecedor parceiro (hard delete)
    const { error: deleteError } = await supabase
      .from('fornecedores_parceiros')
      .delete()
      .eq('id', id)

    if (deleteError) {
      throw createError({
        statusCode: 500,
        message: `Erro ao excluir fornecedor parceiro: ${deleteError.message}`
      })
    }

    return {
      success: true,
      message: 'Fornecedor parceiro excluído com sucesso'
    }
  } catch (error: any) {
    console.error('Erro ao excluir fornecedor parceiro:', error)
    throw createError({
      statusCode: error.statusCode || 500,
      message: error.message || 'Erro ao excluir fornecedor parceiro'
    })
  }
})
