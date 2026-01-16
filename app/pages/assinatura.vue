<script setup lang="ts">
import { useSubscription } from '@/composables/useSubscription'

// Aplica middleware de autenticação
definePageMeta({
  middleware: 'auth',
  layout: 'dashboard'
})

// Meta tags para SEO
useHead({
  title: 'Assinatura - Precify',
  meta: [
    { name: 'description', content: 'Escolha o melhor plano para o seu negócio' }
  ]
})

// Estado de carregamento
const isLoading = ref(true)
let authLoading: any = ref(false)
const isClient = typeof window !== 'undefined'

// Buscar informações da assinatura atual
const { subscriptionStatus, fetchSubscriptionStatus } = useSubscription()

if (isClient) {
  const auth = useAuth()
  authLoading = auth.isLoading

  onMounted(async () => {
    while (authLoading.value) {
      await new Promise(resolve => setTimeout(resolve, 50))
    }
    await fetchSubscriptionStatus()
    await new Promise(resolve => setTimeout(resolve, 300))
    isLoading.value = false
  })
} else {
  isLoading.value = false
}

// Mapear período para tipo de plano
const getPlanType = (period: string | null) => {
  if (!period) return null
  switch (period) {
    case '1month': return 'mensal'
    case '6months': return 'semestral'
    case '12months': return 'anual'
    default: return null
  }
}

// Verificar tipo de ação (upgrade/downgrade/atual)
const getPlanAction = (planType: string) => {
  const currentPlanType = getPlanType(subscriptionStatus.value?.subscriptionPeriod)
  
  // Se não tem plano ativo (trial ou sem assinatura), todos são "assinar"
  if (!currentPlanType && subscriptionStatus.value?.subscriptionStatus !== 'active') {
    return 'assinar'
  }
  
  if (currentPlanType === planType) {
    return 'atual'
  }
  
  const planOrder = { 'mensal': 1, 'semestral': 2, 'anual': 3 }
  const currentOrder = planOrder[currentPlanType as keyof typeof planOrder] || 0
  const targetOrder = planOrder[planType as keyof typeof planOrder] || 0
  
  return targetOrder > currentOrder ? 'upgrade' : 'downgrade'
}

// Verificar se pode clicar no botão
const canClickPlan = (planType: string) => {
  const action = getPlanAction(planType)
  
  // Se é o plano atual, só pode renovar se estiver nos últimos 3 dias
  if (action === 'atual') {
    return subscriptionStatus.value?.canRenewSamePlan !== false
  }
  
  // Upgrades sempre permitidos, downgrades também
  return true
}

// Planos de assinatura
const planos = [
  {
    nome: 'Mensal',
    tipo: 'mensal',
    periodo: '1 mês',
    preco: 29.90,
    precoMensal: 29.90,
    tokens: '100.000',
    economia: null,
    descricao: 'Uso ocasional do Mentor IA',
    destaque: false,
    icone: 'calendar',
    gradient: 'from-green-500 to-green-600',
    bgCard: 'bg-gradient-to-br from-green-50 to-green-100 dark:from-green-950/30 dark:to-green-900/20'
  },
  {
    nome: 'Semestral',
    tipo: 'semestral',
    periodo: '6 meses',
    preco: 119.90,
    precoMensal: 19.98,
    tokens: '250.000',
    economia: 33,
    descricao: 'Uso frequente',
    destaque: true,
    icone: 'star',
    gradient: 'from-blue-500 to-blue-600',
    bgCard: 'bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-950/30 dark:to-blue-900/20'
  },
  {
    nome: 'Anual',
    tipo: 'anual',
    periodo: '12 meses',
    preco: 199.90,
    precoMensal: 16.66,
    tokens: '500.000',
    economia: 44,
    descricao: 'Mentor quase diário',
    destaque: false,
    icone: 'crown',
    gradient: 'from-purple-500 to-purple-600',
    bgCard: 'bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-950/30 dark:to-purple-900/20'
  }
]

// Função para formatar preço
const formatarPreco = (valor: number) => {
  return valor.toLocaleString('pt-BR', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  })
}

// Obter texto do botão
const getButtonText = (plano: any) => {
  const action = getPlanAction(plano.tipo)
  const canClick = canClickPlan(plano.tipo)
  
  if (action === 'atual') {
    if (!canClick) {
      const dias = subscriptionStatus.value?.daysRemaining || 0
      return `Renovar em ${dias} ${dias === 1 ? 'dia' : 'dias'}`
    }
    return 'Renovar Agora'
  }
  
  if (action === 'upgrade') {
    return '⬆️ Fazer Upgrade'
  }
  
  if (action === 'downgrade') {
    return '⬇️ Fazer Downgrade'
  }
  
  return plano.destaque ? 'Assinar Agora' : 'Selecionar'
}

// Função de seleção de plano
const selecionarPlano = (plano: any) => {
  if (!canClickPlan(plano.tipo)) {
    return
  }
  console.log('Plano selecionado:', plano.nome)
  // Aqui você pode adicionar a lógica de checkout/pagamento
}
</script>

<template>
  <div class="min-h-screen bg-background">
    <!-- Loading -->
    <AppLoading v-if="isLoading" />

    <!-- Conteúdo -->
    <div v-else class="container mx-auto px-4 py-8 max-w-7xl">
      <!-- Cabeçalho -->
      <div class="text-center mb-12">
        <h1 class="text-4xl md:text-5xl font-bold text-foreground mb-4">
          Escolha seu <span class="bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">Plano Ideal</span>
        </h1>
        <p class="text-lg text-muted-foreground max-w-2xl mx-auto">
          Transforme sua gestão empresarial com o Precify. Todos os planos incluem acesso completo a todas as funcionalidades.
        </p>
      </div>

      <!-- Grid de Planos -->
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8 mb-12">
        <div
          v-for="plano in planos"
          :key="plano.nome"
          class="relative group flex"
        >
          <!-- Card -->
          <div
            :class="[
              'relative w-full flex flex-col rounded-xl border-2 transition-all duration-300',
              getPlanAction(plano.tipo) === 'atual'
                ? 'border-green-500 shadow-xl shadow-green-500/20 ring-2 ring-green-500/30' 
                : plano.destaque 
                ? 'border-purple-500 shadow-xl shadow-purple-500/20 md:scale-105' 
                : 'border-border hover:border-primary/50 hover:shadow-lg'
            ]"
          >
            <!-- Badge de Plano Atual -->
            <div
              v-if="getPlanAction(plano.tipo) === 'atual'"
              class="absolute top-3 left-3 z-10"
            >
              <span class="px-2.5 py-1 bg-gradient-to-r from-green-600 to-emerald-600 text-white text-xs font-semibold rounded-full shadow-lg whitespace-nowrap">
                ✓ Plano Atual
              </span>
            </div>

            <!-- Badge de Destaque -->
            <div
              v-else-if="plano.destaque"
              class="absolute top-3 right-3 z-10"
            >
              <span class="px-2.5 py-1 bg-gradient-to-r from-purple-600 to-pink-600 text-white text-xs font-semibold rounded-full shadow-lg whitespace-nowrap">
                Mais Popular
              </span>
            </div>

            <!-- Gradiente de Fundo -->
            <div :class="['absolute inset-0 rounded-xl opacity-50', plano.bgCard]" />
            
            <!-- Conteúdo do Card -->
            <div class="relative p-5 sm:p-6 flex flex-col flex-1">
              <!-- Cabeçalho do Plano -->
              <div class="text-center mb-4 pt-8">
                <div :class="['inline-flex items-center justify-center w-12 h-12 rounded-full bg-gradient-to-r mb-3', plano.gradient]">
                  <Icon :icon="plano.icone" class-name="w-6 h-6 text-white" fallback="" />
                </div>
                <h3 class="text-xl font-bold text-foreground mb-1">
                  {{ plano.nome }}
                </h3>
                <p class="text-xs text-muted-foreground">
                  {{ plano.descricao }}
                </p>
              </div>

              <!-- Preço -->
              <div class="text-center mb-4 pb-4 border-b border-border space-y-3">
                <div>
                  <span class="text-3xl sm:text-4xl font-bold text-foreground">
                    R$ {{ formatarPreco(plano.preco) }}
                  </span>
                </div>
                <div class="text-xs text-muted-foreground">
                  {{ plano.periodo }}
                </div>
                
                <!-- Tokens -->
                <div>
                  <div class="inline-flex items-center gap-1.5 px-3 py-1.5 bg-gradient-to-r from-indigo-500/10 to-purple-500/10 rounded-full border border-indigo-500/20">
                    <span class="text-base sm:text-lg">🤖</span>
                    <span class="text-xs sm:text-sm font-semibold text-foreground whitespace-nowrap">
                      {{ plano.tokens }} tokens/mês
                    </span>
                  </div>
                </div>
                
                <!-- Preço Mensal e Economia -->
                <div v-if="plano.economia" class="space-y-2">
                  <div class="text-sm font-semibold text-primary">
                    R$ {{ formatarPreco(plano.precoMensal) }}/mês
                  </div>
                  <div class="inline-flex items-center px-2.5 py-1 bg-green-100 dark:bg-green-900/30 rounded-full">
                    <span class="text-xs font-medium text-green-700 dark:text-green-400">
                      Economize {{ plano.economia }}%
                    </span>
                  </div>
                </div>
                
                <!-- Espaçamento para plano sem economia -->
                <div v-else class="space-y-2">
                  <div class="text-sm font-medium text-muted-foreground">
                    Sem compromisso
                  </div>
                  <div class="inline-flex items-center px-2.5 py-1 bg-green-100 dark:bg-green-900/30 rounded-full">
                    <span class="text-xs font-medium text-green-700 dark:text-green-400">
                      Cancele quando quiser
                    </span>
                  </div>
                </div>
              </div>

              <!-- Botão de Ação -->
              <div class="mt-auto pt-4">
                <button
                  @click="selecionarPlano(plano)"
                  :disabled="!canClickPlan(plano.tipo)"
                  :class="[
                    'w-full py-3 px-4 rounded-lg font-semibold text-sm transition-all duration-300 transform flex items-center justify-center gap-2',
                    !canClickPlan(plano.tipo)
                      ? 'bg-muted text-muted-foreground cursor-not-allowed opacity-60'
                      : getPlanAction(plano.tipo) === 'upgrade'
                      ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-lg hover:shadow-xl hover:scale-105'
                      : getPlanAction(plano.tipo) === 'downgrade'
                      ? 'bg-gradient-to-r from-orange-600 to-red-600 text-white shadow-lg hover:shadow-xl hover:scale-105'
                      : getPlanAction(plano.tipo) === 'atual'
                      ? 'bg-gradient-to-r from-green-600 to-emerald-600 text-white shadow-lg hover:shadow-xl hover:scale-105'
                      : plano.destaque
                      ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-lg hover:shadow-xl hover:scale-105'
                      : 'bg-primary text-primary-foreground hover:bg-primary/90 hover:scale-105'
                  ]"
                >
                  <span class="text-center">{{ getButtonText(plano) }}</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Info sobre Tokens -->
      <div class="max-w-4xl mx-auto mt-8">
        <div class="bg-gradient-to-r from-indigo-50 to-purple-50 dark:from-indigo-950/20 dark:to-purple-950/20 rounded-xl p-6 border border-indigo-500/20">
          <div class="flex items-start gap-4">
            <div class="flex-shrink-0 w-10 h-10 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-lg flex items-center justify-center">
              <span class="text-2xl">🤖</span>
            </div>
            <div>
              <h4 class="font-semibold text-foreground mb-2">O que são tokens?</h4>
              <p class="text-sm text-muted-foreground mb-3">
                Tokens são usados no <strong>Mentor IA</strong>, seu assistente inteligente para dúvidas sobre gestão, precificação e estratégias de negócio. Cada mensagem enviada ao Mentor consome tokens.
              </p>
              <div class="inline-flex items-center gap-2 px-3 py-1.5 bg-indigo-100 dark:bg-indigo-900/30 rounded-lg">
                <span class="text-sm font-medium text-indigo-700 dark:text-indigo-400">
                  💡 Exemplo: 100.000 tokens ≈ 75.000 palavras
                </span>
              </div>
              <p class="text-xs text-muted-foreground mt-3">
                🔄 Os tokens são adicionados automaticamente todo mês na renovação
              </p>
              <p class="text-xs text-muted-foreground mt-2">
                ✨ Se os tokens acabarem antes do fim do mês, você pode comprar tokens adicionais ou usar a <NuxtLink to="/calculadora" class="text-primary font-medium hover:underline">Calculadora manual</NuxtLink>
              </p>
            </div>
          </div>
        </div>
      </div>

      <!-- FAQ Rápido -->
      <div class="mt-8 max-w-4xl mx-auto">
        <h3 class="text-xl font-bold text-center text-foreground mb-6">
          Perguntas Frequentes
        </h3>
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div class="bg-card rounded-lg p-4 border border-border">
            <h4 class="font-semibold text-sm text-foreground mb-2 flex items-center gap-2">
              <Icon name="question-circle" class="w-4 h-4 text-primary" />
              Posso mudar de plano?
            </h4>
            <p class="text-xs text-muted-foreground">
              Sim! Você pode fazer upgrade ou downgrade do seu plano a qualquer momento.
            </p>
          </div>
          
          <div class="bg-card rounded-lg p-4 border border-border">
            <h4 class="font-semibold text-sm text-foreground mb-2 flex items-center gap-2">
              <Icon name="question-circle" class="w-4 h-4 text-primary" />
              Quais formas de pagamento?
            </h4>
            <p class="text-xs text-muted-foreground">
              Aceitamos cartão de crédito e PIX.
            </p>
          </div>
          
          <div class="bg-card rounded-lg p-4 border border-border">
            <h4 class="font-semibold text-sm text-foreground mb-2 flex items-center gap-2">
              <Icon name="question-circle" class="w-4 h-4 text-primary" />
              Tem renovação automática?
            </h4>
            <p class="text-xs text-muted-foreground">
              Sim, mas você pode cancelar a renovação a qualquer momento.
            </p>
          </div>
          
          <div class="bg-card rounded-lg p-4 border border-border">
            <h4 class="font-semibold text-sm text-foreground mb-2 flex items-center gap-2">
              <Icon name="question-circle" class="w-4 h-4 text-primary" />
              Os dados são seguros?
            </h4>
            <p class="text-xs text-muted-foreground">
              Sim! Usamos criptografia de ponta e seguimos as melhores práticas de segurança.
            </p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
/* Animações suaves */
@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.group:hover .scale-105 {
  transform: scale(1.05);
}
</style>
