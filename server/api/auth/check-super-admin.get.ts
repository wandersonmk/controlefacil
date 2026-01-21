import { createClient } from '@supabase/supabase-js'

export default defineEventHandler(async (event) => {
  try {
    // Pega o token do usuário dos cookies/headers
    const authHeader = getHeader(event, 'authorization')
    const token = authHeader?.replace('Bearer ', '') || getCookie(event, 'sb-access-token')

    if (!token) {
      return { isSuperAdmin: false, error: 'No token provided' }
    }

    // Cria cliente Supabase
    const supabase = createClient(
      process.env.NUXT_PUBLIC_SUPABASE_URL || '',
      process.env.NUXT_PUBLIC_SUPABASE_ANON_KEY || ''
    )

    // Valida o token e pega o usuário
    const { data: { user }, error: authError } = await supabase.auth.getUser(token)

    if (authError || !user) {
      return { isSuperAdmin: false, error: 'Invalid token' }
    }

    // Busca o role do usuário com service role para bypass RLS
    const serviceSupabase = createClient(
      process.env.NUXT_PUBLIC_SUPABASE_URL || '',
      process.env.NUXT_SUPABASE_SERVICE_ROLE_KEY || ''
    )

    const { data: usuario, error } = await serviceSupabase
      .from('usuarios')
      .select('role')
      .eq('id', user.id)
      .single()

    if (error || !usuario) {
      return { isSuperAdmin: false, error: 'User not found' }
    }

    return { 
      isSuperAdmin: usuario.role === 'superAdmin',
      userId: user.id,
      role: usuario.role
    }
  } catch (error) {
    console.error('Erro ao verificar superAdmin:', error)
    return { isSuperAdmin: false, error: 'Server error' }
  }
})
