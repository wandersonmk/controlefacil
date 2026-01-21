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
  const { clienteId } = body

  if (!clienteId) {
    throw createError({
      statusCode: 400,
      message: 'clienteId é obrigatório'
    })
  }

  try {
    // Busca informações da empresa E verifica se é superAdmin
    const { data: empresa, error: empresaError } = await supabase
      .from('empresas')
      .select('auth_user_id, nome')
      .eq('id', clienteId)
      .single()

    if (empresaError) throw empresaError
    if (!empresa) throw new Error('Cliente não encontrado')

    // ⚠️ PROTEÇÃO: Impede exclusão de superAdmin
    if (empresa.auth_user_id) {
      const { data: usuario } = await supabase
        .from('usuarios')
        .select('role')
        .eq('auth_user_id', empresa.auth_user_id)
        .single()

      if (usuario && usuario.role === 'superAdmin') {
        throw createError({
          statusCode: 403,
          message: '❌ Não é possível excluir um superAdmin! Esta conta está protegida.'
        })
      }
    }

    // Exclui todas as dependências da empresa (ordem importa!)
    // 1. Exclui produtos
    await supabase.from('produtos').delete().eq('empresa_id', clienteId)
    
    // 2. Exclui fornecedores
    await supabase.from('fornecedores').delete().eq('empresa_id', clienteId)
    
    // 3. Exclui categorias
    await supabase.from('categorias').delete().eq('empresa_id', clienteId)
    
    // 4. Exclui clientes
    await supabase.from('clientes').delete().eq('empresa_id', clienteId)
    
    // 5. Exclui entradas
    await supabase.from('entradas').delete().eq('empresa_id', clienteId)
    
    // 6. Exclui saídas
    await supabase.from('saidas').delete().eq('empresa_id', clienteId)
    
    // 7. Exclui cálculos salvos
    await supabase.from('calculos_salvos').delete().eq('empresa_id', clienteId)

    // Se tem auth_user_id, exclui dados do usuário
    if (empresa.auth_user_id) {
      // Exclui conversas do mentor
      const { data: conversations } = await supabase
        .from('mentor_conversations')
        .select('id')
        .eq('user_id', empresa.auth_user_id)
      
      if (conversations && conversations.length > 0) {
        const conversationIds = conversations.map(c => c.id)
        await supabase.from('mentor_messages').delete().in('conversation_id', conversationIds)
        await supabase.from('mentor_conversations').delete().eq('user_id', empresa.auth_user_id)
      }
      
      // Exclui uso do mentor
      await supabase.from('mentor_usage').delete().eq('user_id', empresa.auth_user_id)
      
      // Exclui saldo de tokens
      await supabase.from('user_token_balance').delete().eq('user_id', empresa.auth_user_id)

      // Exclui o usuário da tabela usuarios
      await supabase.from('usuarios').delete().eq('id', empresa.auth_user_id)
    }

    // Por último, exclui a empresa
    const { error: deleteError } = await supabase
      .from('empresas')
      .delete()
      .eq('id', clienteId)

    if (deleteError) throw deleteError

    return {
      success: true,
      message: `Cliente ${empresa.nome} excluído com sucesso`
    }
  } catch (error: any) {
    console.error('Erro ao excluir cliente:', error)
    throw createError({
      statusCode: 500,
      message: error.message || 'Erro ao excluir cliente'
    })
  }
})
