<script setup lang="ts">
import { useSubscription } from '~/composables/useSubscription'

definePageMeta({
  middleware: 'auth',
  layout: 'dashboard'
})

const {
  isLoading,
  planoAtual,
  hasActiveSubscription,
  statusAssinatura,
  dataProximaRenovacao
} = useSubscription()

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
  destaque?: boolean
  beneficios: string[]
}

const planos: Plano[] = [
  {
    id: 'mensal',
    nome: 'Mensal',
    preco: 29.90,
    periodo: '/mês',
    duracao: 1,
    tokens: 100000,
    tokensFormatado: '100 mil',
    beneficios: [
      '100 mil tokens/mês',
      'Mentor IA ilimitado',
      'Suporte por email',
      'Atualizações gratuitas'
    ]
  },
  {
    id: 'semestral',
    nome: 'Semestral',
    preco: 119.90,
    precoAntes: 179.40,
    periodo: '/6 meses',
    duracao: 6,
    tokens: 250000,
    tokensFormatado: '250 mil',
    badge: 'Mais Popular',
    economia: 'Economize 33%',
    destaque: true,
    beneficios: [
      '250 mil tokens/mês',
      'Mentor IA ilimitado',
      'Suporte prioritário',
      'Relatórios avançados',
      'Backup automático'
    ]
  },
  {
    id: 'anual',
    nome: 'Anual',
    preco: 199.90,
    precoAntes: 358.80,
    periodo: '/ano',
    duracao: 12,
    tokens: 500000,
    tokensFormatado: '500 mil',
    badge: 'Melhor Custo',
    economia: 'Economize 44%',
    beneficios: [
      '500 mil tokens/mês',
      'Mentor IA ilimitado',
      'Suporte VIP 24/7',
      'Relatórios premium',
      'API de integração',
      'Backup automático',
      'Consultoria mensal'
    ]
  }
]

const getPlanType = (planId: string): 'atual' | 'upgrade' | 'downgrade' | 'novo' => {
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
    case 'downgrade': return 'Mudar Plano'
    case 'novo': return 'Assinar Agora'
  }
}

const canClickPlan = (planId: string): boolean => {
  return getPlanType(planId) !== 'atual'
}

const getButtonText = (planId: string): string => {
  if (!hasActiveSubscription.value) return 'Assinar Agora'
  if (planoAtual.value === planId) {
    if (statusAssinatura.value === 'ativa') return 'Plano Atual'
    if (statusAssinatura.value === 'cancelada') return 'Renovar Assinatura'
  }
  const planoAtualIndex = planos.findIndex(p => p.id === planoAtual.value)
  const planIndex = planos.findIndex(p => p.id === planId)
  if (planIndex > planoAtualIndex) return 'Fazer Upgrade'
  return 'Mudar para este Plano'
}

const selecionarPlano = (plano: Plano) => {
  if (!canClickPlan(plano.id)) return
  
  // TODO: Implementar integração com gateway de pagamento
  console.log('Plano selecionado:', plano)
  alert(`Funcionalidade em desenvolvimento!\n\nVocê selecionou o plano ${plano.nome} por R$ ${plano.preco.toFixed(2)}`)
}
</script>

<template>
  <div class="max-w-7xl mx-auto space-y-6">
    <!-- Cabeçalho -->
    <div class="text-center mb-8">
      <h1 class="text-3xl md:text-4xl font-bold text-foreground mb-3">
        Escolha seu Plano de Assinatura
      </h1>
      <p class="text-muted-foreground text-base md:text-lg max-w-2xl mx-auto">
        Acesso completo ao Mentor IA com tokens mensais renovados automaticamente
      </p>
    </div>

    <!-- Status da Assinatura Atual -->
    <div v-if="hasActiveSubscription" class="mb-8 bg-gradient-to-br from-blue-50/30 to-cyan-50/20 dark:from-blue-950/10 dark:to-cyan-950/5 border border-blue-200/40 dark:border-blue-800/20 rounded-lg p-4">
      <div class="flex flex-col md:flex-row items-start md:items-center justify-between gap-3">
        <div>
          <h3 class="text-lg font-semibold text-foreground mb-1">Sua Assinatura Atual</h3>
          <p class="text-sm text-muted-foreground">
            Plano: <span class="font-semibold text-foreground">{{ planos.find(p => p.id === planoAtual)?.nome || 'N/A' }}</span>
            <span v-if="dataProximaRenovacao" class="ml-2">
              • Próxima renovação: <span class="font-semibold text-foreground">{{ new Date(dataProximaRenovacao).toLocaleDateString('pt-BR') }}</span>
            </span>
          </p>
        </div>
        <div v-if="statusAssinatura === 'ativa'" class="flex items-center gap-2 px-3 py-1.5 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 rounded-full text-sm font-semibold">
          <span>✓</span>
          <span>Ativa</span>
        </div>
        <div v-else-if="statusAssinatura === 'cancelada'" class="flex items-center gap-2 px-3 py-1.5 bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400 rounded-full text-sm font-semibold">
          <span>⚠️</span>
          <span>Cancelada</span>
        </div>
      </div>
    </div>

    <!-- Grid de Planos -->
    <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
      <div
        v-for="plano in planos"
        :key="plano.id"
        :class="[
          'relative bg-card border rounded-lg shadow-sm transition-all duration-300',
          plano.destaque ? 'border-purple-500 dark:border-purple-600 ring-2 ring-purple-500/20 scale-[1.02]' : 'border-border hover:shadow-lg',
          canClickPlan(plano.id) ? 'cursor-pointer hover:scale-[1.02]' : 'opacity-80'
        ]"
        @click="selecionarPlano(plano)"
      >
        <!-- Badge -->
        <div v-if="plano.badge" class="absolute -top-3 left-1/2 transform -translate-x-1/2 px-3 py-1 bg-gradient-to-r from-purple-600 to-pink-600 text-white text-xs font-bold rounded-full shadow-lg">
          {{ plano.badge }}
        </div>

        <!-- Conteúdo do Card -->
        <div class="p-6">
          <!-- Nome do Plano -->
          <h3 class="text-2xl font-bold text-foreground mb-2">
            {{ plano.nome }}
          </h3>

          <!-- Economia -->
          <p v-if="plano.economia" class="text-sm font-semibold text-green-600 dark:text-green-400 mb-4">
            {{ plano.economia }}
          </p>

          <!-- Preço -->
          <div class="mb-6">
            <p v-if="plano.precoAntes" class="text-sm text-muted-foreground line-through">
              De R$ {{ plano.precoAntes.toFixed(2).replace('.', ',') }}
            </p>
            <div class="flex items-baseline gap-1">
              <span class="text-4xl font-extrabold text-foreground">
                R$ {{ plano.preco.toFixed(2).replace('.', ',') }}
              </span>
              <span class="text-sm text-muted-foreground">{{ plano.periodo }}</span>
            </div>
          </div>

          <!-- Tokens -->
          <div class="mb-6 p-3 bg-gradient-to-br from-indigo-50/50 to-purple-50/30 dark:from-indigo-950/20 dark:to-purple-950/10 border border-indigo-200/30 dark:border-indigo-800/20 rounded-lg">
            <p class="text-sm text-muted-foreground mb-1">Tokens mensais</p>
            <p class="text-2xl font-bold text-indigo-600 dark:text-indigo-400">
              {{ plano.tokensFormatado }}
            </p>
          </div>

          <!-- Benefícios -->
          <ul class="space-y-3 mb-6">
            <li
              v-for="(beneficio, index) in plano.beneficios"
              :key="index"
              class="flex items-start gap-2 text-sm text-muted-foreground"
            >
              <span class="text-green-500 text-base flex-shrink-0">✓</span>
              <span>{{ beneficio }}</span>
            </li>
          </ul>

          <!-- Botão de Ação -->
          <button
            :disabled="!canClickPlan(plano.id)"
            :class="[
              'w-full py-3 px-4 rounded-lg font-semibold text-white transition-all duration-200',
              canClickPlan(plano.id)
                ? plano.destaque
                  ? 'bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 shadow-md hover:shadow-lg'
                  : 'bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 shadow-md hover:shadow-lg'
                : 'bg-gray-400 dark:bg-gray-700 cursor-not-allowed'
            ]"
          >
            {{ getButtonText(plano.id) }}
          </button>
        </div>
      </div>
    </div>

    <!-- Informações Adicionais -->
    <div class="mt-12 bg-gradient-to-br from-amber-50/20 to-orange-50/10 dark:from-amber-950/10 dark:to-orange-950/5 border border-amber-200/30 dark:border-amber-800/20 rounded-lg p-6">
      <h3 class="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
        <span>💡</span>
        <span>Informações Importantes</span>
      </h3>
      <div class="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-muted-foreground">
        <div class="flex items-start gap-2">
          <span class="text-blue-500 text-lg flex-shrink-0">🔄</span>
          <div>
            <p class="font-semibold text-foreground mb-1">Renovação Automática</p>
            <p>Seus tokens são renovados automaticamente a cada período. Sem preocupações!</p>
          </div>
        </div>
        <div class="flex items-start gap-2">
          <span class="text-green-500 text-lg flex-shrink-0">📈</span>
          <div>
            <p class="font-semibold text-foreground mb-1">Upgrade Simples</p>
            <p>Faça upgrade do seu plano a qualquer momento e pague apenas a diferença proporcional.</p>
          </div>
        </div>
        <div class="flex items-start gap-2">
          <span class="text-purple-500 text-lg flex-shrink-0">🎯</span>
          <div>
            <p class="font-semibold text-foreground mb-1">Cancelamento Flexível</p>
            <p>Cancele quando quiser. Você mantém acesso até o fim do período pago.</p>
          </div>
        </div>
        <div class="flex items-start gap-2">
          <span class="text-orange-500 text-lg flex-shrink-0">💰</span>
          <div>
            <p class="font-semibold text-foreground mb-1">Tokens Extras</p>
            <p>Precisa de mais tokens? <NuxtLink to="/tokens" class="text-indigo-600 dark:text-indigo-400 hover:underline font-semibold">Compre pacotes adicionais</NuxtLink></p>
          </div>
        </div>
      </div>
    </div>

    <!-- FAQ -->
    <div class="mt-8 bg-card border border-border rounded-lg p-6">
      <h3 class="text-lg font-semibold text-foreground mb-4">Perguntas Frequentes</h3>
      <div class="space-y-4">
        <div>
          <p class="font-semibold text-foreground mb-1">Como funciona a renovação dos tokens?</p>
          <p class="text-sm text-muted-foreground">Seus tokens são renovados automaticamente no início de cada período. Se sobrarem tokens, eles expiram e são substituídos pelos novos.</p>
        </div>
        <div>
          <p class="font-semibold text-foreground mb-1">Posso mudar de plano depois?</p>
          <p class="text-sm text-muted-foreground">Sim! Você pode fazer upgrade ou downgrade a qualquer momento. No upgrade, pagamos apenas a diferença proporcional.</p>
        </div>
        <div>
          <p class="font-semibold text-foreground mb-1">E se eu precisar de mais tokens?</p>
          <p class="text-sm text-muted-foreground">Você pode comprar pacotes de tokens adicionais que não expiram. <NuxtLink to="/tokens" class="text-indigo-600 dark:text-indigo-400 hover:underline font-semibold">Veja os pacotes disponíveis</NuxtLink></p>
        </div>
        <div>
          <p class="font-semibold text-foreground mb-1">Como cancelo minha assinatura?</p>
          <p class="text-sm text-muted-foreground">Você pode cancelar a qualquer momento nas configurações da sua conta. Você mantém acesso até o fim do período já pago.</p>
        </div>
      </div>
    </div>
  </div>
</template>
