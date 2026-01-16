<script setup lang="ts">
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

if (isClient) {
  const auth = useAuth()
  authLoading = auth.isLoading

  onMounted(async () => {
    while (authLoading.value) {
      await new Promise(resolve => setTimeout(resolve, 50))
    }
    await new Promise(resolve => setTimeout(resolve, 300))
    isLoading.value = false
  })
} else {
  isLoading.value = false
}

// Planos de assinatura
const planos = [
  {
    nome: 'Mensal',
    periodo: '1 mês',
    preco: 29.90,
    precoMensal: 29.90,
    economia: null,
    descricao: 'Ideal para começar',
    destaque: false,
    icone: 'calendar',
    gradient: 'from-blue-500 to-blue-600',
    bgCard: 'bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-950/30 dark:to-blue-900/20',
    features: [
      'Todas as funcionalidades',
      'Suporte prioritário',
      'Relatórios completos',
      'Gestão de estoque',
      'Controle financeiro',
      'Cadastro ilimitado'
    ]
  },
  {
    nome: 'Semestral',
    periodo: '6 meses',
    preco: 119.90,
    precoMensal: 19.98,
    economia: 33,
    descricao: 'Melhor custo-benefício',
    destaque: true,
    icone: 'star',
    gradient: 'from-purple-500 to-pink-500',
    bgCard: 'bg-gradient-to-br from-purple-50 to-pink-100 dark:from-purple-950/30 dark:to-pink-900/20',
    features: [
      'Todas as funcionalidades',
      'Suporte prioritário',
      'Relatórios completos',
      'Gestão de estoque',
      'Controle financeiro',
      'Cadastro ilimitado'
    ]
  },
  {
    nome: 'Anual',
    periodo: '12 meses',
    preco: 199.90,
    precoMensal: 16.66,
    economia: 44,
    descricao: 'Máxima economia',
    destaque: false,
    icone: 'crown',
    gradient: 'from-green-500 to-emerald-600',
    bgCard: 'bg-gradient-to-br from-green-50 to-emerald-100 dark:from-green-950/30 dark:to-emerald-900/20',
    features: [
      'Todas as funcionalidades',
      'Suporte prioritário',
      'Relatórios completos',
      'Gestão de estoque',
      'Controle financeiro',
      'Cadastro ilimitado'
    ]
  }
]

// Função para formatar preço
const formatarPreco = (valor: number) => {
  return valor.toLocaleString('pt-BR', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  })
}

// Função de seleção de plano
const selecionarPlano = (plano: any) => {
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
      <div class="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8 mb-12">
        <div
          v-for="plano in planos"
          :key="plano.nome"
          class="relative group"
        >
          <!-- Card -->
          <div
            :class="[
              'relative h-full rounded-2xl border-2 transition-all duration-300',
              plano.destaque 
                ? 'border-purple-500 shadow-xl shadow-purple-500/20 scale-105 md:scale-110' 
                : 'border-border hover:border-primary/50 hover:shadow-lg'
            ]"
          >
            <!-- Badge de Destaque -->
            <div
              v-if="plano.destaque"
              class="absolute top-4 right-4 z-10"
            >
              <span class="px-3 py-1 bg-gradient-to-r from-purple-600 to-pink-600 text-white text-xs font-semibold rounded-full shadow-lg">
                Mais Popular
              </span>
            </div>

            <!-- Gradiente de Fundo -->
            <div :class="['absolute inset-0 rounded-2xl opacity-50', plano.bgCard]" />
            
            <!-- Conteúdo do Card -->
            <div class="relative p-6 lg:p-8">
              <!-- Cabeçalho do Plano -->
              <div class="text-center mb-6">
                <div :class="['inline-flex items-center justify-center w-16 h-16 rounded-full bg-gradient-to-r mb-4', plano.gradient]">
                  <Icon :icon="plano.icone" class-name="w-8 h-8 text-white" fallback="" />
                </div>
                <h3 class="text-2xl font-bold text-foreground mb-2">
                  {{ plano.nome }}
                </h3>
                <p class="text-sm text-muted-foreground">
                  {{ plano.descricao }}
                </p>
              </div>

              <!-- Preço -->
              <div class="text-center mb-6 pb-6 border-b border-border">
                <div class="mb-2">
                  <span class="text-5xl font-bold text-foreground">
                    R$ {{ formatarPreco(plano.preco) }}
                  </span>
                </div>
                <div class="text-sm text-muted-foreground mb-2">
                  {{ plano.periodo }}
                </div>
                
                <!-- Preço Mensal e Economia -->
                <div v-if="plano.economia" class="mt-3 space-y-1">
                  <div class="text-lg font-semibold text-primary">
                    👉 R$ {{ formatarPreco(plano.precoMensal) }}/mês
                  </div>
                  <div class="inline-flex items-center px-3 py-1 bg-green-100 dark:bg-green-900/30 rounded-full">
                    <span class="text-sm font-medium text-green-700 dark:text-green-400">
                      Economia de ~{{ plano.economia }}%
                    </span>
                  </div>
                </div>
                
                <!-- Espaçamento para plano sem economia -->
                <div v-else class="mt-3 space-y-1">
                  <div class="text-base font-medium text-muted-foreground">
                    💳 Sem compromisso
                  </div>
                  <div class="inline-flex items-center px-3 py-1 bg-blue-100 dark:bg-blue-900/30 rounded-full">
                    <span class="text-sm font-medium text-blue-700 dark:text-blue-400">
                      Cancele quando quiser
                    </span>
                  </div>
                </div>
              </div>

              <!-- Features -->
              <ul class="space-y-3 mb-8">
                <li
                  v-for="(feature, index) in plano.features"
                  :key="index"
                  class="flex items-start gap-3"
                >
                  <div :class="['flex-shrink-0 w-5 h-5 rounded-full bg-gradient-to-r flex items-center justify-center mt-0.5', plano.gradient]">
                    <Icon name="check" class="w-3 h-3 text-white" />
                  </div>
                  <span class="text-sm text-foreground">{{ feature }}</span>
                </li>
              </ul>

              <!-- Botão de Ação -->
              <button
                @click="selecionarPlano(plano)"
                :class="[
                  'w-full py-3 px-6 rounded-lg font-semibold transition-all duration-300 transform hover:scale-105 flex items-center justify-center gap-2',
                  plano.destaque
                    ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-lg hover:shadow-xl'
                    : 'bg-primary text-primary-foreground hover:bg-primary/90'
                ]"
              >
                <Icon :name="plano.destaque ? 'rocket' : 'check-circle'" class="w-5 h-5" />
                <span>{{ plano.destaque ? 'Começar Agora' : 'Selecionar Plano' }}</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- Seção de Garantia -->
      <div class="max-w-4xl mx-auto">
        <div class="bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-950/20 dark:to-purple-950/20 rounded-2xl p-8 border border-border">
          <div class="text-center">
            <div class="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full mb-4">
              <Icon name="shield-check" class="w-8 h-8 text-white" />
            </div>
            <h3 class="text-2xl font-bold text-foreground mb-3">
              Garantia de 7 Dias
            </h3>
            <p class="text-muted-foreground max-w-2xl mx-auto">
              Experimente sem riscos! Se não ficar satisfeito nos primeiros 7 dias, devolvemos 100% do seu dinheiro. Sem perguntas, sem complicações.
            </p>
          </div>
        </div>
      </div>

      <!-- FAQ Rápido -->
      <div class="mt-12 max-w-4xl mx-auto">
        <h3 class="text-2xl font-bold text-center text-foreground mb-8">
          Perguntas Frequentes
        </h3>
        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div class="bg-card rounded-lg p-6 border border-border">
            <h4 class="font-semibold text-foreground mb-2 flex items-center gap-2">
              <Icon name="question-circle" class="w-5 h-5 text-primary" />
              Posso mudar de plano?
            </h4>
            <p class="text-sm text-muted-foreground">
              Sim! Você pode fazer upgrade ou downgrade do seu plano a qualquer momento.
            </p>
          </div>
          
          <div class="bg-card rounded-lg p-6 border border-border">
            <h4 class="font-semibold text-foreground mb-2 flex items-center gap-2">
              <Icon name="question-circle" class="w-5 h-5 text-primary" />
              Quais formas de pagamento?
            </h4>
            <p class="text-sm text-muted-foreground">
              Aceitamos cartão de crédito e PIX.
            </p>
          </div>
          
          <div class="bg-card rounded-lg p-6 border border-border">
            <h4 class="font-semibold text-foreground mb-2 flex items-center gap-2">
              <Icon name="question-circle" class="w-5 h-5 text-primary" />
              Tem renovação automática?
            </h4>
            <p class="text-sm text-muted-foreground">
              Sim, mas você pode cancelar a renovação a qualquer momento.
            </p>
          </div>
          
          <div class="bg-card rounded-lg p-6 border border-border">
            <h4 class="font-semibold text-foreground mb-2 flex items-center gap-2">
              <Icon name="question-circle" class="w-5 h-5 text-primary" />
              Os dados são seguros?
            </h4>
            <p class="text-sm text-muted-foreground">
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
