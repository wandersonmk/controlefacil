export default defineNuxtRouteMiddleware(async (to, from) => {
  try {
    console.log('[super-admin] Verificando acesso para rota:', to.path)
    
    const supabase = useSupabaseClient()
    const { data: { user } } = await supabase.auth.getUser()
    
    if (!user) {
      console.log('[super-admin] Usuário não autenticado, redirecionando para login')
      return navigateTo('/login')
    }

    console.log('[super-admin] Verificando usuário:', user.id)
    
    const { data: usuario, error } = await supabase
      .from('usuarios')
      .select('role')
      .eq('auth_user_id', user.id)
      .single()

    if (error) {
      console.error('[super-admin] Erro ao buscar usuário:', error.message)
      return navigateTo('/')
    }

    if (!usuario || usuario.role !== 'superAdmin') {
      console.log('[super-admin] Usuário não é superAdmin. Role:', usuario?.role)
      return navigateTo('/')
    }

    console.log('[super-admin] Acesso permitido para superAdmin')
  } catch (error) {
    console.error('[super-admin] Erro:', error)
    return navigateTo('/')
  }
})
