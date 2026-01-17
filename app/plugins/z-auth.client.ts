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
          // Limpa a URL antes de redirecionar para evitar loop
          window.history.replaceState({}, '', '/login')
          return
        }

        if (code) {
          // Evitar processar o mesmo code múltiplas vezes (sessionStorage temporário)
          const processedCode = sessionStorage.getItem('auth_code_processed')
          if (processedCode === code) {
            console.log('[Auth Plugin] Code já processado, ignorando...')
            // Limpa URL e continua o fluxo normal
            window.history.replaceState({}, '', '/')
            return
          }
          
          console.log('[Auth Plugin] Code detectado na URL, trocando por sessão...')
          
          // Marca como processando
          sessionStorage.setItem('auth_code_processed', code)
          
          // Limpa o code da URL imediatamente para evitar reprocessamento
          window.history.replaceState({}, '', '/')
          
          // Mostrar loading imediatamente
          const loadingDiv = document.createElement('div')
          loadingDiv.id = 'auth-loading'
          loadingDiv.innerHTML = `
            <div style="
              position: fixed;
              inset: 0;
              background: rgb(15, 23, 42);
              display: flex;
              flex-direction: column;
              align-items: center;
              justify-content: center;
              gap: 1.5rem;
              z-index: 99999;
            ">
              <div style="
                width: 56px;
                height: 56px;
                border: 5px solid rgba(139, 92, 246, 0.2);
                border-top-color: rgb(139, 92, 246);
                border-radius: 50%;
                animation: spin 0.8s linear infinite;
              "></div>
              <div style="text-align: center;">
                <p style="color: rgb(226, 232, 240); font-size: 1.125rem; font-weight: 600; margin: 0;">
                  Confirmando seu email
                </p>
                <p style="color: rgb(148, 163, 184); font-size: 0.875rem; margin-top: 0.5rem;">
                  Aguarde um momento...
                </p>
              </div>
            </div>
            <style>
              @keyframes spin {
                to { transform: rotate(360deg); }
              }
            </style>
          `
          document.body.appendChild(loadingDiv)
          
          const { data: exchangeData, error: exchangeError } = await supabase.auth.exchangeCodeForSession(code)

          if (exchangeError) {
            console.error('[Auth Plugin] Falha ao trocar code por sessão:', exchangeError)
            sessionStorage.removeItem('auth_code_processed')
            // Remove loading
            loadingDiv?.remove()
            // Não faz reload, apenas mostra mensagem de erro e limpa
            alert('Erro ao confirmar email. O link pode ter expirado. Por favor, tente fazer login.')
            return
          }
          
          if (exchangeData?.session) {
            console.log('[Auth Plugin] Sessão criada via PKCE, salvando e redirecionando...')
            user.value = exchangeData.session.user
            session.value = exchangeData.session
            
            // Aguarda para garantir que localStorage foi atualizado
            await new Promise(resolve => setTimeout(resolve, 500))
            
            // Limpa o marker do sessionStorage
            sessionStorage.removeItem('auth_code_processed')
            
            // Remove loading
            loadingDiv?.remove()
            
            // Já estamos em '/', apenas marca loading como false para continuar
            loading.value = false
            console.log('[Auth Plugin] Login confirmado com sucesso!')
            return
          }
        }
      } catch (callbackError) {
        console.error('[Auth Plugin] Erro ao processar callback do Supabase:', callbackError)
        sessionStorage.removeItem('auth_code_processed')
        return
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
