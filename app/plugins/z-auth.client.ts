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
          
          // Mostrar loading na tela durante o processo
          document.body.innerHTML = `
            <div style="
              position: fixed;
              inset: 0;
              background: rgb(15, 23, 42);
              display: flex;
              flex-direction: column;
              align-items: center;
              justify-content: center;
              gap: 1rem;
              z-index: 9999;
            ">
              <div style="
                width: 48px;
                height: 48px;
                border: 4px solid rgba(139, 92, 246, 0.2);
                border-top-color: rgb(139, 92, 246);
                border-radius: 50%;
                animation: spin 1s linear infinite;
              "></div>
              <p style="color: rgb(203, 213, 225); font-size: 1rem;">
                Confirmando seu email...
              </p>
            </div>
            <style>
              @keyframes spin {
                to { transform: rotate(360deg); }
              }
            </style>
          `
          
          const { data: exchangeData, error: exchangeError } = await supabase.auth.exchangeCodeForSession(code)

          if (exchangeError) {
            console.error('[Auth Plugin] Falha ao trocar code por sessão:', exchangeError)
            // Redireciona para login com erro
            window.location.href = '/login?error=confirmation_failed'
            return
          }
          
          if (exchangeData?.session) {
            console.log('[Auth Plugin] Sessão criada via PKCE, redirecionando para dashboard...')
            user.value = exchangeData.session.user
            session.value = exchangeData.session
            
            // Aguarda um pouco para garantir que a sessão foi salva no localStorage
            await new Promise(resolve => setTimeout(resolve, 500))
            
            // Force reload para garantir que tudo inicializa corretamente
            window.location.href = '/'
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
      supabase.auth.onAuthStateChange(async (event: any, newSession: Session | null) => {
        console.log('[Auth Plugin] Auth state changed:', event, { hasSession: !!newSession })
        
        // Se deslogou ou sessão expirou, limpar tudo e redirecionar
        if (event === 'SIGNED_OUT' || (event === 'TOKEN_REFRESHED' && !newSession)) {
          console.log('[Auth Plugin] Sessão encerrada, limpando dados...')
          
          // Limpar estados
          user.value = null
          session.value = null
          
          // Limpar localStorage completo
          try {
            localStorage.clear()
            console.log('[Auth Plugin] localStorage limpo')
          } catch (e) {
            console.error('[Auth Plugin] Erro ao limpar localStorage:', e)
          }
          
          // Redirecionar para login (apenas se não estiver já lá)
          if (window.location.pathname !== '/login') {
            console.log('[Auth Plugin] Redirecionando para /login...')
            await navigateTo('/login', { replace: true })
          }
          return
        }
        
        // Atualizar estado normalmente para outros eventos
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
