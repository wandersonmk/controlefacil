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
        message: 'Acesso negado. Apenas SuperAdmin pode criar fornecedores parceiros.'
      })
    }

    // Pegar dados do body
    const body = await readBody(event)
    const { nome, empresa, cnpj, categoria, email, telefone, whatsapp, endereco, cidade, estado, descricao, site, logo_url, destaque } = body

    // Validar campos obrigatórios
    if (!nome || !empresa || !categoria || !telefone || !cidade || !estado) {
      throw createError({
        statusCode: 400,
        message: 'Campos obrigatórios: nome, empresa, categoria, telefone, cidade, estado'
      })
    }

    // Inserir fornecedor parceiro
    const { data: fornecedor, error: insertError } = await supabase
      .from('fornecedores_parceiros')
      .insert([{
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
        ativo: true
      }])
      .select()
      .single()

    if (insertError) {
      throw createError({
        statusCode: 500,
        message: `Erro ao criar fornecedor parceiro: ${insertError.message}`
      })
    }

    return {
      success: true,
      fornecedor
    }
  } catch (error: any) {
    console.error('Erro ao criar fornecedor parceiro:', error)
    throw createError({
      statusCode: error.statusCode || 500,
      message: error.message || 'Erro ao criar fornecedor parceiro'
    })
  }
})
