export default defineNuxtRouteMiddleware(async (to, from) => {
  // No servidor, não precisa verificar autenticação detalhada
  if (process.server) {
    return
  }
  
  try {
    console.log('[Auth Middleware] Iniciando verificação...')
    
    const { isAuthenticated, user, isLoading } = useAuth()
    
    console.log('[Auth Middleware] Estado inicial:', { 
      isAuthenticated: isAuthenticated.value, 
      hasUser: !!user.value,
      isLoading: isLoading.value,
      email: user.value?.email
    })
    
    // Aguarda o carregamento ser concluído de forma mais eficiente
    let attempts = 0
    const maxAttempts = 20
    
    while (isLoading.value && attempts < maxAttempts) {
      console.log(`[Auth Middleware] Aguardando loading... tentativa ${attempts + 1}`)
      await new Promise(resolve => setTimeout(resolve, 50))
      attempts++
    }
    
    console.log('[Auth Middleware] Estado final:', { 
      isAuthenticated: isAuthenticated.value, 
      hasUser: !!user.value,
      isLoading: isLoading.value,
      email: user.value?.email,
      attempts 
    })
    
    // Verificação rápida: se claramente não autenticado, redireciona imediatamente
    if (!isLoading.value && !isAuthenticated.value && !user.value) {
      console.log('[Auth Middleware] Usuário claramente não autenticado, redirecionando imediatamente')
      return navigateTo('/login', { replace: true, external: true })
    }
    
    // Se ainda não está autenticado, tenta verificação direta no Supabase
    if (!isAuthenticated.value || !user.value) {
      console.log('[Auth Middleware] Tentando verificação direta no Supabase...')
      
      try {
        const nuxtApp = useNuxtApp()
        if (nuxtApp.$supabase) {
          const supabase = nuxtApp.$supabase as any
          const { data } = await supabase.auth.getSession()
          if (data.session && data.session.user) {
            console.log('[Auth Middleware] Sessão encontrada diretamente no Supabase:', data.session.user.email)
            // A sessão existe, permitir acesso e deixar o plugin atualizar o estado
            return
          }
        }
      } catch (error) {
        console.error('[Auth Middleware] Erro ao verificar sessão diretamente:', error)
      }
    }
    
    // Se não está autenticado, redireciona para login
    if (!isAuthenticated.value || !user.value) {
      console.log('[Auth Middleware] Usuário não autenticado, redirecionando para login')
      return navigateTo('/login', { replace: true, external: true })
    }
    
    console.log('[Auth Middleware] Usuário autenticado, verificando trial...')
    
    // Verificar status de trial/assinatura
    try {
      const supabase = useSupabaseClient()
      const { data: { session } } = await supabase.auth.getSession()
      
      if (session?.access_token) {
        const response = await $fetch<{
          success: boolean
          isBlocked: boolean
          subscriptionStatus: string
          daysRemaining: number
        }>('/api/subscription/status', {
          headers: {
            Authorization: `Bearer ${session.access_token}`
          }
        })
        
        console.log('[Auth Middleware] Status de assinatura:', response)
        
        // Se o trial expirou e o usuário não está na página de assinatura ou ajuda
        if (response.isBlocked && to.path !== '/assinatura' && to.path !== '/ajuda') {
          console.log('[Auth Middleware] Trial expirado, redirecionando para /assinatura')
          // Usar window.location para garantir carregamento completo dos estilos
          if (process.client) {
            window.location.href = '/assinatura'
            return
          }
          return navigateTo('/assinatura', { replace: true })
        }
      }
    } catch (error) {
      console.error('[Auth Middleware] Erro ao verificar trial:', error)
      // Em caso de erro na verificação de trial, permite acesso
      // (evita bloquear usuário por erro técnico)
    }
    
    console.log('[Auth Middleware] Usuário autenticado e com acesso permitido')
  } catch (error) {
    // Se houver erro na inicialização, redireciona para login
    console.error('[Auth Middleware] Erro:', error)
    return navigateTo('/login', { external: true })
  }
})
