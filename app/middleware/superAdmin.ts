export default defineNuxtRouteMiddleware(async (to, from) => {
  // No servidor, usa a API para verificar
  if (process.server) {
    try {
      const { isSuperAdmin } = await $fetch('/api/auth/check-super-admin')
      
      if (!isSuperAdmin) {
        return navigateTo('/')
      }
    } catch (error) {
      console.error('Erro ao verificar superAdmin no servidor:', error)
      return navigateTo('/login')
    }
  } else {
    // No cliente, usa o Supabase diretamente
    try {
      const supabase = useSupabaseClient()
      
      // Verifica se o usuário está autenticado
      const { data: { user } } = await supabase.auth.getUser()
      
      if (!user) {
        return navigateTo('/login')
      }

      // Busca o role do usuário na tabela usuarios
      const { data: usuario, error } = await supabase
        .from('usuarios')
        .select('role')
        .eq('id', user.id)
        .single()

      if (error || !usuario) {
        console.error('Erro ao buscar role do usuário:', error)
        return navigateTo('/')
      }

      // Verifica se o usuário é superAdmin
      if (usuario.role !== 'superAdmin') {
        return navigateTo('/')
      }
    } catch (error) {
      console.error('Erro no middleware superAdmin:', error)
      return navigateTo('/')
    }
  }
})
