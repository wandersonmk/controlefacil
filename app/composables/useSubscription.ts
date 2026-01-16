export const useSubscription = () => {
  const subscriptionStatus = ref<{
    isBlocked: boolean
    subscriptionStatus: string
    subscriptionPlan: string
    trialEndsAt: string | null
    daysRemaining: number
    empresaNome: string
    planDisplayName?: string
  } | null>(null)

  const isLoading = ref(false)

  const fetchSubscriptionStatus = async () => {
    if (process.server) return

    try {
      isLoading.value = true
      const supabase = useSupabaseClient()
      const { data: { session } } = await supabase.auth.getSession()

      if (!session?.access_token) {
        return
      }

      const response = await $fetch<{
        success: boolean
        isBlocked: boolean
        subscriptionStatus: string
        subscriptionPlan: string
        trialEndsAt: string
        daysRemaining: number
        empresaNome: string
        planDisplayName: string
      }>('/api/subscription/status', {
        headers: {
          Authorization: `Bearer ${session.access_token}`
        }
      })

      if (response.success) {
        const wasBlocked = subscriptionStatus.value?.isBlocked || false
        const isNowBlocked = response.isBlocked

        subscriptionStatus.value = {
          isBlocked: response.isBlocked,
          subscriptionStatus: response.subscriptionStatus,
          subscriptionPlan: response.subscriptionPlan,
          trialEndsAt: response.trialEndsAt,
          daysRemaining: response.daysRemaining,
          empresaNome: response.empresaNome,
          planDisplayName: response.planDisplayName
        }

        // Se acabou de expirar, redireciona imediatamente
        if (!wasBlocked && isNowBlocked && process.client) {
          console.log('[useSubscription] Assinatura expirou, redirecionando para /assinatura')
          await navigateTo('/assinatura')
        }
      }
    } catch (error) {
      console.error('Erro ao buscar status de assinatura:', error)
    } finally {
      isLoading.value = false
    }
  }

  // Iniciar verificação periódica (a cada 5 minutos)
  if (process.client) {
    let intervalId: NodeJS.Timeout | null = null

    onMounted(() => {
      // Verificação inicial
      fetchSubscriptionStatus()

      // Verificar a cada 5 minutos (300000ms)
      intervalId = setInterval(() => {
        console.log('[useSubscription] Verificação periódica de assinatura')
        fetchSubscriptionStatus()
      }, 300000)
    })

    onUnmounted(() => {
      if (intervalId) {
        clearInterval(intervalId)
      }
    })
  }

  const isTrialActive = computed(() => {
    return subscriptionStatus.value?.subscriptionStatus === 'trial' && 
           !subscriptionStatus.value?.isBlocked
  })

  const isPremium = computed(() => {
    return subscriptionStatus.value?.subscriptionStatus === 'active'
  })

  return {
    subscriptionStatus,
    isLoading,
    isTrialActive,
    isPremium,
    fetchSubscriptionStatus
  }
}
