<template>
  <div class="min-h-screen bg-background">
    <!-- Sidebar -->
    <AppSidebar :is-mobile-open="isMobileMenuOpen" @close-mobile="isMobileMenuOpen = false" />
    
    <!-- Conteúdo principal -->
    <div class="lg:ml-64 min-h-screen flex flex-col">
        <!-- Header principal com título e botões de ação -->
        <header class="bg-card border-b border-border px-6 py-4">
          <div class="flex items-center justify-between">
            <!-- Área esquerda com menu hambúrguer (mobile) e título -->
            <div class="flex items-center space-x-4">
              <!-- Menu Hambúrguer (só aparece no mobile) -->
              <button 
                @click="isMobileMenuOpen = true"
                class="lg:hidden p-2 rounded-lg text-foreground/80 hover:text-foreground hover:bg-muted transition-colors"
                title="Abrir menu"
              >
                <Icon icon="bars" class-name="w-5 h-5" fallback="☰" />
              </button>
            
              <!-- Título -->
              <div>
                <h1 class="text-2xl font-bold text-foreground">{{ pageTitle }}</h1>
                <p class="text-sm text-muted-foreground">{{ pageDescription }}</p>
              </div>
            </div>
          
            <!-- Área de sair -->
            <div class="flex items-center space-x-3 relative">
              <!-- Info Plano -->
              <NuxtLink
                to="/assinatura"
                class="hidden lg:flex items-center gap-2 px-3 py-1.5 rounded-lg bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-950/30 dark:to-indigo-950/30 border border-blue-200 dark:border-blue-800 hover:border-blue-400 dark:hover:border-blue-600 transition-all"
              >
                <span class="text-base">🎁</span>
                <div class="text-left">
                  <div class="text-xs font-semibold text-blue-700 dark:text-blue-400 leading-tight">
                    <span class="font-bold">{{ planBadgeText }}</span>
                  </div>
                </div>
              </NuxtLink>

              <!-- Toggle de Tema -->
              <ThemeToggle />
            
              <!-- Botão Sair -->
              <button 
              @click="handleLogout"
              class="flex items-center gap-2 px-3 py-2 rounded-lg text-foreground/70 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/10 transition-all duration-200 group"
              title="Sair"
            >
              <svg xmlns="http://www.w3.org/2000/svg" class="w-5 h-5 group-hover:scale-110 transition-transform duration-200" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path>
                <polyline points="16 17 21 12 16 7"></polyline>
                <line x1="21" y1="12" x2="9" y2="12"></line>
              </svg>
              <span class="hidden sm:inline text-sm font-medium">Sair</span>
            </button>
          </div>
        </div>
      </header>

      <!-- Conteúdo da página -->
      <main class="p-6 flex-1">
        <NuxtPage />
      </main>
      
      <!-- Footer global -->
      <AppFooter />
    </div>
  </div>
</template>

<script setup lang="ts">
import { useSubscription } from '@/composables/useSubscription'

// Estado do menu mobile
const isMobileMenuOpen = ref(false)

// Subscription status
const { subscriptionStatus, fetchSubscriptionStatus } = useSubscription()

// Computeds para exibir o plano e dias restantes
const planDisplayText = computed(() => {
  if (!subscriptionStatus.value) return 'Plano Free'
  return subscriptionStatus.value.planDisplayName || 'Plano Free'
})

const daysRemainingText = computed(() => {
  if (!subscriptionStatus.value) return '0 dias'
  const days = subscriptionStatus.value.daysRemaining || 0
  return days === 1 ? '1 dia' : `${days} dias`
})

const isTrial = computed(() => {
  if (!subscriptionStatus.value) return true
  const plan = subscriptionStatus.value.planDisplayName || ''
  return plan.toLowerCase().includes('free') || plan.toLowerCase().includes('trial') || plan.toLowerCase().includes('grátis')
})

const planBadgeText = computed(() => {
  const days = subscriptionStatus.value?.daysRemaining || 0
  const daysText = days === 1 ? '1 dia' : `${days} dias`
  
  if (isTrial.value) {
    return `${daysText} grátis`
  }
  return `${daysText} restante${days === 1 ? '' : 's'}`
})

// Carregar status da assinatura ao montar
onMounted(() => {
  fetchSubscriptionStatus()
})

// Título dinâmico baseado na rota
const route = useRoute()
const pageTitle = computed(() => {
  console.log('[Dashboard] Current route path:', route.path)
  switch (route.path) {
    case '/':
      return 'Dashboard'
    case '/pedidos':
      return 'Pedidos'
    case '/cardapio':
      return 'Cardápio'
    case '/clientes':
      return 'Clientes'
    case '/fornecedores':
      return 'Fornecedores'
    case '/estoque':
      return 'Estoque'
    case '/entradas':
      return 'Entradas'
    case '/saidas':
      return 'Saídas'
    case '/calculadora':
      return 'Calculadora de Preços'
    case '/mentor-ia':
      return 'Mentor IA'
    case '/relatorios':
      return 'Relatórios'
    case '/configuracoes':
      return 'Configurações'
    case '/ajuda':
      return 'Ajuda'
    case '/ajuste-da-ia':
      return 'Ajuste da IA'
    case '/comunidade':
      return 'Comunidade'
    case '/assinatura':
      return 'Assinatura'
    case '/tokens':
      return 'Tokens Adicionais'
    default:
      console.log('[Dashboard] Using default title for path:', route.path)
      return 'Dashboard'
  }
})

const pageDescription = computed(() => {
  console.log('[Dashboard] Current route path for description:', route.path)
  switch (route.path) {
    case '/':
      return 'Visão geral do sistema'
    case '/pedidos':
      return 'Gerencie todos os pedidos e vendas'
    case '/cardapio':
      return 'Gerencie itens e categorias do cardápio'
    case '/clientes':
      return 'Gerencie todos os seus clientes'
    case '/fornecedores':
      return 'Gerencie todos os seus fornecedores'
    case '/estoque':
      return 'Controle seus produtos e níveis de estoque'
    case '/entradas':
      return 'Registre e gerencie as entradas financeiras'
    case '/saidas':
      return 'Registre e gerencie as saídas e despesas'
    case '/calculadora':
      return 'Calcule o preço ideal para seus produtos'
    case '/mentor-ia':
      return 'Seu assistente inteligente para gestão de negócios'
    case '/relatorios':
      return 'Acompanhe receitas, despesas e movimentações'
    case '/configuracoes':
      return 'Configure e gerencie as configurações do sistema'
    case '/ajuda':
      return 'Central de ajuda e guias do sistema'
    case '/ajuste-da-ia':
      return 'Configure as configurações de inteligência artificial'
    case '/comunidade':
      return 'Conecte-se com outros empreendedores'
    case '/assinatura':
      return 'Gerencie seu plano e assinatura'
    case '/tokens':
      return 'Adquira tokens extras para usar o Mentor IA'
    default:
      return 'Visão geral do sistema'
  }
})

// Toast
const toast = ref<any>(null)
if (process.client) {
  onMounted(async () => {
    toast.value = await useToastSafe()
  })
}

// Função de logout completa
const handleLogout = async () => {
  try {
    console.log('[Dashboard] Iniciando logout...')
    
    // Limpar localStorage completamente
    if (process.client) {
      localStorage.removeItem('user_email')
      localStorage.removeItem('agzap-auth-token')
      localStorage.removeItem('sb-wynjuzsrydsvkmyhjfhu-auth-token')
      // Limpar todos os itens relacionados ao auth
      Object.keys(localStorage).forEach(key => {
        if (key.includes('auth') || key.includes('supabase') || key.includes('sb-')) {
          localStorage.removeItem(key)
        }
      })
    }
    
    // Limpar estado global
    const globalUser = useState('auth_user')
    const globalSession = useState('auth_session')
    const globalLoading = useState('auth_loading')
    
    globalUser.value = null
    globalSession.value = null
    globalLoading.value = false
    
    console.log('[Dashboard] Estados limpos')
    
    // Mostrar toast de sucesso
    if (toast.value && toast.value.success) {
      toast.value.success('Deslogado com sucesso!', {
        position: 'top-right',
        timeout: 3000,
        closeOnClick: true,
        pauseOnFocusLoss: true,
        pauseOnHover: true,
        draggable: true,
        draggablePercent: 0.6,
        showCloseButtonOnHover: false,
        hideProgressBar: false,
        closeButton: "button",
        icon: true,
        rtl: false
      })
    }
    
    // Pequeno delay para garantir que tudo foi limpo
    await new Promise(resolve => setTimeout(resolve, 500))
    
    // Redirecionar para login com force reload
    console.log('[Dashboard] Redirecionando para login...')
    await navigateTo('/login', { replace: true })
    
    // Force reload para garantir que a página seja totalmente recarregada
    if (process.client) {
      setTimeout(() => {
        window.location.href = '/login'
      }, 100)
    }
    
  } catch (error) {
    console.error('Erro ao fazer logout:', error)
    
    // Mostrar toast de erro
    if (toast.value && toast.value.error) {
      toast.value.error('Erro ao fazer logout. Tente novamente.', {
        position: 'top-right',
        timeout: 5000
      })
    }
    
    // Em caso de erro, force a navegação mesmo assim
    if (process.client) {
      window.location.href = '/login'
    }
  }
}
</script>
