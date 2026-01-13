import type { SupabaseClient, User, Session } from '@supabase/supabase-js'

export default defineNuxtPlugin(async () => {
  // Só executa no cliente
  if (process.client) {
    console.log('[Auth Plugin] Inicializando...')
    
    // Obter estados existentes ou criar novos
    const user = useState<User | null>('auth_user', () => null)
    const session = useState<Session | null>('auth_session', () => null)
    const loading = useState<boolean>('auth_loading', () => true)
    
    try {
      // Aguardar um pouco para garantir que Supabase está disponível (reduzido)
      await new Promise(resolve => setTimeout(resolve, 200))
      
      const nuxtApp = useNuxtApp()
      
      if (!nuxtApp.$supabase) {
        console.error('[Auth Plugin] Supabase não disponível')
        loading.value = false
        return
      }
      
      const supabase = nuxtApp.$supabase as SupabaseClient
      console.log('[Auth Plugin] Cliente Supabase obtido')

      // Se a URL atual tem um code (PKCE) vindo de confirmação/magic link, precisamos trocar por sessão
      // para que o Supabase consiga persistir o login e o app consiga redirecionar corretamente.
      try {
        const currentUrl = new URL(window.location.href)
        const code = currentUrl.searchParams.get('code')
        const error = currentUrl.searchParams.get('error')
        const errorDescription = currentUrl.searchParams.get('error_description')

        if (error || errorDescription) {
          console.error('[Auth Plugin] Erro no callback do Supabase:', { error, errorDescription })
        }

        if (code) {
          console.log('[Auth Plugin] Code detectado na URL, trocando por sessão...')
          const { data: exchangeData, error: exchangeError } = await supabase.auth.exchangeCodeForSession(window.location.href)

          if (exchangeError) {
            console.error('[Auth Plugin] Falha ao trocar code por sessão:', exchangeError)
          } else if (exchangeData?.session) {
            console.log('[Auth Plugin] Sessão criada via PKCE')
            user.value = exchangeData.session.user
            session.value = exchangeData.session
          }

          // Limpar parâmetros da URL para não reprocessar o code em refresh
          currentUrl.searchParams.delete('code')
          currentUrl.searchParams.delete('error')
          currentUrl.searchParams.delete('error_description')
          history.replaceState({}, document.title, currentUrl.pathname + (currentUrl.searchParams.toString() ? `?${currentUrl.searchParams.toString()}` : '') + currentUrl.hash)

          // Se veio pelo fluxo de confirmação e agora já temos sessão, manda para o dashboard
          if (exchangeData?.session) {
            await navigateTo('/', { replace: true })
            return
          }
        }
      } catch (callbackError) {
        console.error('[Auth Plugin] Erro ao processar callback do Supabase:', callbackError)
      }
      
      // Verificar se existe uma sessão salva
      const { data, error } = await supabase.auth.getSession()
      
      if (error) {
        console.error('[Auth Plugin] Erro ao obter sessão:', error)
        
        // Se o erro é de refresh token inválido, limpar tudo
        if (error.message?.includes('Refresh Token')) {
          console.log('[Auth Plugin] Refresh token inválido, limpando localStorage...')
          localStorage.clear()
          user.value = null
          session.value = null
        }
      } else {
        console.log('[Auth Plugin] Sessão obtida:', { hasSession: !!data.session })
        
        // Atualizar o estado com a sessão atual
        if (data.session) {
          user.value = data.session.user
          session.value = data.session
          console.log('[Auth Plugin] Usuário restaurado:', data.session.user.email)
        } else {
          user.value = null
          session.value = null
          console.log('[Auth Plugin] Nenhuma sessão encontrada')
        }
      }
      
      loading.value = false
      
      // Escutar mudanças de autenticação
      supabase.auth.onAuthStateChange((event: any, newSession: Session | null) => {
        console.log('[Auth Plugin] Auth state changed:', event)
        user.value = newSession?.user ?? null
        session.value = newSession
        console.log('[Auth Plugin] Estado atualizado:', { 
          hasUser: !!user.value, 
          email: user.value?.email 
        })
      })
      
      console.log('[Auth Plugin] Inicialização concluída')
      
    } catch (error) {
      console.error('[Auth Plugin] Erro ao inicializar:', error)
      user.value = null
      session.value = null
      loading.value = false
    }
  }
})
