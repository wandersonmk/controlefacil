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
  const { clienteId, nome, email, whatsapp } = body

  if (!clienteId || !nome || !email) {
    throw createError({
      statusCode: 400,
      message: 'clienteId, nome e email são obrigatórios'
    })
  }

  try {
    // Atualiza dados da empresa
    const { error: updateError } = await supabase
      .from('empresas')
      .update({
        nome,
        email,
        whatsapp,
        updated_at: new Date().toISOString()
      })
      .eq('id', clienteId)

    if (updateError) throw updateError

    return {
      success: true,
      message: 'Cliente atualizado com sucesso'
    }
  } catch (error: any) {
    console.error('Erro ao editar cliente:', error)
    throw createError({
      statusCode: 500,
      message: error.message || 'Erro ao editar cliente'
    })
  }
})
