import { createClient } from '@supabase/supabase-js'

export default defineEventHandler(async (event) => {
  try {
    const config = useRuntimeConfig()
    const { email } = await readBody(event)

    if (!email) {
      throw createError({
        statusCode: 400,
        message: 'Email é obrigatório'
      })
    }

    // Usar service role para consultar auth.users
    const supabase = createClient(
      config.public.supabaseUrl,
      config.supabaseServiceRoleKey
    )

    // Verificar se email existe em auth.users
    const { data: users, error } = await supabase.auth.admin.listUsers()
    
    if (error) {
      throw createError({
        statusCode: 500,
        message: 'Erro ao verificar email'
      })
    }

    const emailExists = users.users.some(u => u.email?.toLowerCase() === email.toLowerCase())

    return {
      exists: emailExists
    }

  } catch (error: any) {
    console.error('Erro ao verificar email:', error)
    throw createError({
      statusCode: error.statusCode || 500,
      message: error.message || 'Erro ao verificar email'
    })
  }
})
