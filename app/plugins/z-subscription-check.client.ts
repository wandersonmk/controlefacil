export default defineNuxtPlugin(() => {
  if (process.client) {
    let intervalId: NodeJS.Timeout | null = null

    // Aguardar 2s para garantir que auth está pronto
    setTimeout(() => {
      const { isAuthenticated } = useAuth()
      
      // Só inicia verificação se estiver autenticado
      if (isAuthenticated.value) {
        const { fetchSubscriptionStatus } = useSubscription()
        
        // Verificação inicial
        fetchSubscriptionStatus()
        
        // Verificar a cada 5 minutos (300000ms)
        intervalId = setInterval(() => {
          // Só verifica se ainda estiver autenticado
          if (isAuthenticated.value) {
            console.log('[Subscription Check] Verificação periódica de assinatura')
            fetchSubscriptionStatus()
          } else if (intervalId) {
            // Se deslogou, para de verificar
            clearInterval(intervalId)
            intervalId = null
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
