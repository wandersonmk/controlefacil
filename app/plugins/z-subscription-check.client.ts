export default defineNuxtPlugin(() => {
  if (process.client) {
    let intervalId: NodeJS.Timeout | null = null
    let lastBlockedState: boolean | null = null

    // Aguardar 2s para garantir que auth está pronto
    setTimeout(() => {
      const { isAuthenticated } = useAuth()
      
      // Só inicia verificação se estiver autenticado
      if (isAuthenticated.value) {
        const { fetchSubscriptionStatus, subscriptionStatus } = useSubscription()
        
        // Verificação inicial
        fetchSubscriptionStatus()
        
        // Verificar a cada 5 minutos (300000ms)
        intervalId = setInterval(async () => {
          // Só verifica se ainda estiver autenticado
          if (isAuthenticated.value) {
            console.log('[Subscription Check] Verificação periódica de assinatura')
            await fetchSubscriptionStatus()
            
            // Se o estado de bloqueio mudou, logar claramente
            const currentBlockedState = subscriptionStatus.value?.isBlocked || false
            if (lastBlockedState !== null && lastBlockedState !== currentBlockedState) {
              console.warn(
                `[Subscription Check] Estado mudou: ${lastBlockedState ? 'bloqueado' : 'ativo'} → ${currentBlockedState ? 'bloqueado' : 'ativo'}`
              )
              
              // Se acabou de bloquear e não está na página de assinatura, redireciona
              if (currentBlockedState && window.location.pathname !== '/assinatura') {
                console.log('[Subscription Check] Trial expirado, redirecionando...')
                await navigateTo('/assinatura')
              }
            }
            lastBlockedState = currentBlockedState
          } else if (intervalId) {
            // Se deslogou, para de verificar
            clearInterval(intervalId)
            intervalId = null
            lastBlockedState = null
          }
        }, 300000)
      }
    }, 2000)

    // Cleanup quando a janela for fechada
    if (typeof window !== 'undefined') {
      window.addEventListener('beforeunload', () => {
        if (intervalId) {
          clearInterval(intervalId)
        }
      })
    }
  }
})
