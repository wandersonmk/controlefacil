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
    const { error: updateError } = await supabase
      .from('empresas')
      .update({
        ativo: false,
        subscription_status: 'canceled',
        updated_at: new Date().toISOString()
      })
      .eq('id', clienteId)

    if (updateError) throw updateError

    return {
      success: true,
      message: 'Cliente desativado com sucesso'
    }
  } catch (error: any) {
    console.error('Erro ao desativar cliente:', error)
    throw createError({
      statusCode: 500,
      message: error.message
    })
  }
})
