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
    // Reativa a empresa (apenas muda ativo para true, sem alterar plano ou datas)
    const { error: empresaError } = await supabase
      .from('empresas')
      .update({ 
        ativo: true,
        updated_at: new Date().toISOString()
      })
      .eq('id', clienteId)

    if (empresaError) throw empresaError

    return {
      success: true,
      message: 'Cliente reativado com sucesso'
    }
  } catch (error: any) {
    console.error('Erro ao reativar cliente:', error)
    throw createError({
      statusCode: 500,
      message: error.message
    })
  }
})
