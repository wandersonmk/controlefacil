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
        message: 'Acesso negado. Apenas SuperAdmin pode editar fornecedores parceiros.'
      })
    }

    // Pegar dados do body
    const body = await readBody(event)
    const { id, nome, empresa, cnpj, categoria, email, telefone, whatsapp, endereco, cidade, estado, descricao, site, logo_url, destaque } = body

    // Validar campos obrigatórios
    if (!id || !nome || !empresa || !categoria || !telefone || !cidade || !estado) {
      throw createError({
        statusCode: 400,
        message: 'Campos obrigatórios: id, nome, empresa, categoria, telefone, cidade, estado'
      })
    }

    // Atualizar fornecedor parceiro
    const { data: fornecedor, error: updateError } = await supabase
      .from('fornecedores_parceiros')
      .update({
        nome,
        empresa,
        cnpj: cnpj || null,
        categoria,
        email: email || null,
        telefone,
        whatsapp: whatsapp || null,
        endereco: endereco || null,
        cidade,
        estado,
        descricao: descricao || null,
        site: site || null,
        logo_url: logo_url || null,
        destaque: destaque || false,
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .select()
      .single()

    if (updateError) {
      throw createError({
        statusCode: 500,
        message: `Erro ao atualizar fornecedor parceiro: ${updateError.message}`
      })
    }

    return {
      success: true,
      fornecedor
    }
  } catch (error: any) {
    console.error('Erro ao editar fornecedor parceiro:', error)
    throw createError({
      statusCode: error.statusCode || 500,
      message: error.message || 'Erro ao editar fornecedor parceiro'
    })
  }
})
