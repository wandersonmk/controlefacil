<script setup lang="ts">
import { useSubscription } from '~/composables/useSubscription'

definePageMeta({
  middleware: 'auth',
  layout: 'dashboard'
})

const {
  isLoading,
  subscriptionStatus,
  isPremium,
  isTrialActive,
  fetchSubscriptionStatus
} = useSubscription()

// Mapeamento de planos do banco para nossos IDs
const planMap: Record<string, 'mensal' | 'semestral' | 'anual'> = {
  'basic': 'mensal',
  'pro': 'semestral',
  'enterprise': 'anual',
  'free': 'mensal'
}

// Computed para compatibilidade com o template
const planoAtual = computed(() => {
  const dbPlan = subscriptionStatus.value?.subscriptionPlan
  return dbPlan ? (planMap[dbPlan] || null) : null
})
const hasActiveSubscription = computed(() => isPremium.value || isTrialActive.value)
const statusAssinatura = computed(() => {
  if (!subscriptionStatus.value) return null
  if (subscriptionStatus.value.isBlocked) return 'cancelada'
  return subscriptionStatus.value.subscriptionStatus === 'active' ? 'ativa' : null
})
// Usar subscription_renews_at do banco de dados
const dataProximaRenovacao = computed(() => {
  // Primeiro tenta pegar do subscriptionPeriod, se não tiver usa trial_ends_at
  return subscriptionStatus.value?.subscriptionPeriod || subscriptionStatus.value?.trialEndsAt || null
})

// Calcular dias restantes até a renovação
const diasRestantes = computed(() => {
  if (!dataProximaRenovacao.value) return 0
  const hoje = new Date()
  const dataRenovacao = new Date(dataProximaRenovacao.value)
  
  // Verificar se a data é válida
  if (isNaN(dataRenovacao.getTime())) return 0
  
  const diff = dataRenovacao.getTime() - hoje.getTime()
  const dias = Math.ceil(diff / (1000 * 60 * 60 * 24))
  return dias > 0 ? dias : 0
})

interface Plano {
  id: 'mensal' | 'semestral' | 'anual'
  nome: string
  preco: number
  precoAntes?: number
  periodo: string
  duracao: number // em meses
  tokens: number
  tokensFormatado: string
  badge?: string
  economia?: string
  precoMensal?: number
  destaque?: boolean
  beneficios: string[]
}

const planos: Plano[] = [
  {
    id: 'mensal',
    nome: 'Mensal',
    preco: 29.90,
    periodo: '1 mês',
    duracao: 1,
    tokens: 100000,
    tokensFormatado: '100 mil',
    badge: 'Ideal para começar',
    beneficios: []
  },
  {
    id: 'semestral',
    nome: 'Semestral',
    preco: 119.90,
    precoAntes: 179.40,
    periodo: '6 meses',
    duracao: 6,
    tokens: 250000,
    tokensFormatado: '250 mil',
    badge: 'Mais Popular',
    economia: 'Economia de ~33%',
    precoMensal: 19.98,
    destaque: true,
    beneficios: []
  },
  {
    id: 'anual',
    nome: 'Anual',
    preco: 199.90,
    precoAntes: 358.80,
    periodo: '12 meses',
    duracao: 12,
    tokens: 500000,
    tokensFormatado: '500 mil',
    badge: 'Máxima economia',
    economia: 'Economia de ~44%',
    precoMensal: 16.66,
    beneficios: []
  }
]

const getPlanType = (planId: string): 'atual' | 'upgrade' | 'downgrade' | 'novo' => {
  // Se está em trial (sem assinatura paga), considera como novo usuário
  if (isTrialActive.value && !isPremium.value) return 'novo'
  
  if (!hasActiveSubscription.value) return 'novo'
  if (planoAtual.value === planId) return 'atual'
  
  const planoAtualIndex = planos.findIndex(p => p.id === planoAtual.value)
  const planIndex = planos.findIndex(p => p.id === planId)
  
  if (planIndex > planoAtualIndex) return 'upgrade'
  return 'downgrade'
}

const getPlanAction = (planId: string): string => {
  const type = getPlanType(planId)
  switch (type) {
    case 'atual': return 'Plano Atual'
    case 'upgrade': return 'Fazer Upgrade'
    case 'downgrade': return 'Fazer Downgrade'
    case 'novo': return 'Assinar Agora'
  }
}

const canClickPlan = (planId: string): boolean => {
  const type = getPlanType(planId)
  
  // Debug
  if (type === 'atual') {
    console.log('🔍 Verificando plano atual:', {
      planId,
      diasRestantes: diasRestantes.value,
      dataProximaRenovacao: dataProximaRenovacao.value,
      podeClicar: diasRestantes.value <= 3
    })
  }
  
  // Se é um plano novo, pode clicar
  if (type === 'novo') return true
  
  // Se é upgrade ou downgrade, sempre pode clicar
  if (type === 'upgrade' || type === 'downgrade') return true
  
  // Se é o plano atual, só pode clicar se faltar 3 dias ou menos para renovar
  if (type === 'atual') {
    return diasRestantes.value <= 3
  }
  
  return false
}

const getButtonText = (planId: string): string => {
  const type = getPlanType(planId)
  
  // Se está em trial, sempre mostra 'Assinar'
  if (isTrialActive.value && !isPremium.value) return 'Assinar'
  
  if (type === 'novo') return 'Começar Agora'
  
  if (type === 'upgrade') return 'Upgrade'
  
  if (type === 'downgrade') return 'Downgrade'
  
  if (type === 'atual') {
    if (diasRestantes.value <= 3) {
      return 'Renovar Assinatura'
    }
    return 'Plano Atual'
  }
  
  return 'Começar Agora'
}

const selecionarPlano = (plano: Plano) => {
  if (!canClickPlan(plano.id)) return
  
  // TODO: Implementar integração com gateway de pagamento
  console.log('Plano selecionado:', plano)
  alert(`Funcionalidade em desenvolvimento!\n\nVocê selecionou o plano ${plano.nome} por R$ ${plano.preco.toFixed(2)}`)
}

// Debug: verificar dados da assinatura
onMounted(async () => {
  // Buscar dados de assinatura
  await fetchSubscriptionStatus()
  
  console.log('📊 Status da Assinatura:', {
    subscriptionStatus: subscriptionStatus.value,
    planoAtual: planoAtual.value,
    hasActiveSubscription: hasActiveSubscription.value,
    statusAssinatura: statusAssinatura.value,
    dataProximaRenovacao: dataProximaRenovacao.value,
    diasRestantes: diasRestantes.value
  })
})
</script>

<template>
  <div class="max-w-7xl mx-auto space-y-6 md:space-y-8 px-3 md:px-4">
    <!-- Cabeçalho -->
    <div class="text-center mb-8 md:mb-12">
      <h1 class="text-3xl md:text-4xl lg:text-5xl font-semibold text-foreground mb-3 md:mb-4">
        Escolha seu <span class="bg-gradient-to-r from-purple-600 via-pink-600 to-fuchsia-600 bg-clip-text text-transparent">Plano Ideal</span>
      </h1>
      <p class="text-muted-foreground text-base md:text-lg max-w-3xl mx-auto px-4">
        Transforme sua gestão empresarial com o Precify. Todos os planos incluem acesso completo a todas as funcionalidades.
      </p>
    </div>

    <!-- Grid de Planos -->
    <div class="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6 max-w-4xl mx-auto">
      <!-- Plano Mensal -->
      <div
        @click="selecionarPlano(planos[0])"
        :class="[
          'relative bg-gradient-to-br from-blue-50/50 to-cyan-50/30 dark:from-blue-950/20 dark:to-cyan-950/10 border-2 border-blue-200 dark:border-blue-800 rounded-xl md:rounded-2xl p-4 md:p-6 shadow-lg transition-all duration-300',
          canClickPlan(planos[0].id) ? 'cursor-pointer hover:scale-105 hover:shadow-2xl' : 'opacity-80 cursor-not-allowed',
          getPlanType(planos[0].id) === 'atual' ? 'ring-2 ring-blue-500' : ''
        ]"
      >
        <!-- Badge Plano Atual -->
        <div v-if="getPlanType(planos[0].id) === 'atual'" class="absolute -top-3 left-4 bg-gradient-to-r from-blue-600 to-cyan-600 text-white px-3 md:px-4 py-1 rounded-full text-[10px] md:text-xs font-medium shadow-lg">
          ✓ Plano Atual<span v-if="diasRestantes > 0"> ({{ diasRestantes }} dias)</span>
        </div>
        <!-- Ícone -->
        <div class="flex justify-center mb-3 md:mb-4">
          <div class="w-12 h-12 md:w-16 md:h-16 bg-gradient-to-br from-blue-500 to-cyan-600 rounded-full flex items-center justify-center text-white text-xl md:text-2xl shadow-lg">
            💼
          </div>
        </div>

        <!-- Nome e Descrição -->
        <h3 class="text-xl md:text-2xl font-medium text-center text-foreground mb-1">{{ planos[0].nome }}</h3>
        <p class="text-xs md:text-sm text-center text-muted-foreground mb-4 md:mb-6">{{ planos[0].badge }}</p>

        <!-- Preço -->
        <div class="text-center mb-6">
          <div class="text-3xl md:text-4xl font-semibold text-foreground mb-1">
            R$ {{ planos[0].preco.toFixed(2).replace('.', ',') }}
          </div>
          <p class="text-sm text-muted-foreground">{{ planos[0].periodo }}</p>
          <p class="text-xs text-blue-600 dark:text-blue-400 font-medium mt-2">{{ planos[0].tokensFormatado }} tokens/mês</p>
        </div>

        <!-- Botão -->
        <button
          :disabled="!canClickPlan(planos[0].id)"
          class="w-full py-2.5 md:py-3 px-3 md:px-4 text-sm md:text-base bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white font-medium rounded-lg transition-all duration-200 shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {{ getButtonText(planos[0].id) }}
        </button>
      </div>

      <!-- Plano Semestral (Destaque) -->
      <div
        @click="selecionarPlano(planos[1])"
        :class="[
          'relative bg-gradient-to-br from-orange-50/50 to-amber-50/30 dark:from-orange-950/20 dark:to-amber-950/10 border-2 border-orange-500 dark:border-orange-600 rounded-2xl p-6 shadow-2xl transition-all duration-300 transform scale-105',
          canClickPlan(planos[1].id) ? 'cursor-pointer hover:scale-110 hover:shadow-3xl' : 'opacity-80 cursor-not-allowed',
          getPlanType(planos[1].id) === 'atual' ? 'ring-2 ring-orange-500' : ''
        ]"
      >
        <!-- Badge Mais Popular ou Plano Atual -->
        <div v-if="getPlanType(planos[1].id) === 'atual'" class="absolute -top-4 left-4 bg-gradient-to-r from-orange-600 via-amber-600 to-yellow-600 text-white px-4 md:px-6 py-2 rounded-full text-xs md:text-sm font-medium shadow-lg">
          ✓ Plano Atual<span v-if="diasRestantes > 0"> ({{ diasRestantes }} dias)</span>
        </div>
        <div v-else class="absolute -top-4 left-4 bg-gradient-to-r from-orange-600 via-amber-600 to-yellow-600 text-white px-4 md:px-6 py-2 rounded-full text-xs md:text-sm font-medium shadow-lg">
          {{ planos[1].badge }}
        </div>

        <!-- Ícone -->
        <div class="flex justify-center mb-4 mt-4">
          <div class="w-16 h-16 bg-gradient-to-br from-orange-500 via-amber-600 to-yellow-600 rounded-full flex items-center justify-center text-white text-2xl shadow-lg animate-pulse">
            ⭐
          </div>
        </div>

        <!-- Nome e Descrição -->
        <h3 class="text-xl md:text-2xl font-medium text-center text-foreground mb-1">{{ planos[1].nome }}</h3>
        <p class="text-sm text-center text-orange-600 dark:text-orange-400 mb-6 font-medium">Melhor custo-benefício</p>

        <!-- Preço -->
        <div class="text-center mb-6">
          <div class="text-3xl md:text-4xl font-semibold text-foreground mb-1">
            R$ {{ planos[1].preco.toFixed(2).replace('.', ',') }}
          </div>
          <p class="text-sm text-muted-foreground">{{ planos[1].periodo }}</p>
          <p class="text-xs text-orange-600 dark:text-orange-400 font-medium mt-2">{{ planos[1].tokensFormatado }} tokens/mês</p>
        </div>

        <!-- Botão -->
        <button
          :disabled="!canClickPlan(planos[1].id)"
          class="w-full py-3 px-4 bg-gradient-to-r from-orange-600 via-amber-600 to-yellow-600 hover:from-orange-700 hover:via-amber-700 hover:to-yellow-700 text-white font-medium rounded-lg transition-all duration-200 shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {{ getButtonText(planos[1].id) }}
        </button>
      </div>

      <!-- Plano Anual -->
      <div
        @click="selecionarPlano(planos[2])"
        :class="[
          'relative bg-gradient-to-br from-emerald-50/50 to-teal-50/30 dark:from-emerald-950/20 dark:to-teal-950/10 border-2 border-emerald-200 dark:border-emerald-800 rounded-2xl p-6 shadow-lg transition-all duration-300',
          canClickPlan(planos[2].id) ? 'cursor-pointer hover:scale-105 hover:shadow-2xl' : 'opacity-80 cursor-not-allowed',
          getPlanType(planos[2].id) === 'atual' ? 'ring-2 ring-emerald-500' : ''
        ]"
      >
        <!-- Badge Plano Atual -->
        <div v-if="getPlanType(planos[2].id) === 'atual'" class="absolute -top-3 left-4 bg-gradient-to-r from-emerald-600 to-teal-600 text-white px-3 md:px-4 py-1 rounded-full text-[10px] md:text-xs font-medium shadow-lg">
          ✓ Plano Atual<span v-if="diasRestantes > 0"> ({{ diasRestantes }} dias)</span>
        </div>
        <!-- Ícone -->
        <div class="flex justify-center mb-4">
          <div class="w-16 h-16 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-full flex items-center justify-center text-white text-2xl shadow-lg">
            👑
          </div>
        </div>

        <!-- Nome e Descrição -->
        <h3 class="text-xl md:text-2xl font-medium text-center text-foreground mb-1">{{ planos[2].nome }}</h3>
        <p class="text-sm text-center text-muted-foreground mb-6">{{ planos[2].badge }}</p>

        <!-- Preço -->
        <div class="text-center mb-6">
          <div class="text-3xl md:text-4xl font-semibold text-foreground mb-1">
            R$ {{ planos[2].preco.toFixed(2).replace('.', ',') }}
          </div>
          <p class="text-sm text-muted-foreground">{{ planos[2].periodo }}</p>
          <p class="text-xs text-emerald-600 dark:text-emerald-400 font-medium mt-2">{{ planos[2].tokensFormatado }} tokens/mês</p>
        </div>

        <!-- Botão -->
        <button
          :disabled="!canClickPlan(planos[2].id)"
          class="w-full py-3 px-4 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white font-medium rounded-lg transition-all duration-200 shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {{ getButtonText(planos[2].id) }}
        </button>
      </div>
    </div>

    <!-- Explicação sobre Tokens -->
    <div class="mt-8 max-w-4xl mx-auto bg-gradient-to-br from-indigo-50/50 to-purple-50/30 dark:from-indigo-950/20 dark:to-purple-950/10 border border-indigo-200/40 dark:border-indigo-800/20 rounded-xl p-4 md:p-6">
      <div class="flex items-start gap-3">
        <div class="flex-shrink-0 w-10 h-10 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-full flex items-center justify-center">
          <span class="text-xl">💡</span>
        </div>
        <div class="flex-1">
          <h3 class="text-base md:text-lg font-semibold text-foreground mb-2">Como funcionam os tokens?</h3>
          <div class="space-y-2 text-xs md:text-sm text-muted-foreground">
            <p>
              <span class="font-semibold text-indigo-600 dark:text-indigo-400">📊 Equivalência:</span> 
              Cada <strong>10.000 tokens</strong> equivalem a aproximadamente <strong>7.500 palavras</strong> processadas pelo Mentor IA.
            </p>
            <p>
              <span class="font-semibold text-purple-600 dark:text-purple-400">🔄 Acumulação:</span> 
              Seus tokens <strong>acumulam e não expiram</strong>. Tokens não utilizados permanecem disponíveis para uso futuro, somando-se aos novos tokens recebidos a cada renovação.
            </p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
