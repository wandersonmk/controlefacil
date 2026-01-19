export const useSubscription = () => {
  const subscriptionStatus = ref<{
    isBlocked: boolean
    subscriptionStatus: string
    subscriptionPlan: string
    subscriptionPeriod: string | null
    subscriptionRenewsAt: string | null
    trialEndsAt: string | null
    daysRemaining: number
    empresaNome: string
    planDisplayName?: string
    canRenewSamePlan?: boolean
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
        subscriptionPeriod: string | null
        subscriptionRenewsAt: string | null
        trialEndsAt: string
        daysRemaining: number
        empresaNome: string
        planDisplayName: string
        canRenewSamePlan: boolean
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
          subscriptionPeriod: response.subscriptionPeriod,
          subscriptionRenewsAt: response.subscriptionRenewsAt,
          trialEndsAt: response.trialEndsAt,
          daysRemaining: response.daysRemaining,
          empresaNome: response.empresaNome,
          planDisplayName: response.planDisplayName,
          canRenewSamePlan: response.canRenewSamePlan
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

  // Nota: A verificação periódica agora roda no plugin z-subscription-check.client.ts
  // para garantir que funcione mesmo sem componente montado

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
