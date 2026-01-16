<template>
  <div class="min-h-screen bg-background">
    <!-- Conteúdo da comunidade (sem AppSidebar principal) -->
    <div class="min-h-screen flex flex-col">
      <!-- Header da Comunidade -->
      <header class="bg-card border-b border-border px-6 py-4">
        <div class="flex items-center justify-between">
          <!-- Área esquerda -->
          <div class="flex items-center space-x-4">
            <!-- Botão menu mobile -->
            <button 
              @click="isMobileMenuOpen = !isMobileMenuOpen"
              class="lg:hidden p-2 rounded-lg text-foreground/80 hover:text-foreground hover:bg-muted transition-colors"
              title="Abrir menu"
            >
              <Icon icon="bars" class-name="w-5 h-5" fallback="☰" />
            </button>
            
            <!-- Título -->
            <div>
              <h1 class="text-2xl font-bold text-foreground">Comunidade</h1>
              <p class="text-sm text-muted-foreground">Conecte-se com outros empreendedores</p>
            </div>
          </div>
          
          <!-- Área direita com tema e sair -->
          <div class="flex items-center space-x-3">
            <ThemeToggle />
            
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

      <!-- Conteúdo principal -->
      <main class="flex-1">
        <slot />
      </main>

      <!-- Footer -->
      <AppFooter />
    </div>

    <!-- Menu mobile da comunidade (overlay) -->
    <div 
      v-if="isMobileMenuOpen"
      @click="isMobileMenuOpen = false"
      class="lg:hidden fixed inset-0 bg-black bg-opacity-50 z-40"
    ></div>

    <div 
      :class="isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'"
      class="lg:hidden fixed left-0 top-0 h-screen w-64 bg-card text-foreground z-50 shadow-2xl flex-col border-r border-border transition-transform duration-300 ease-in-out flex"
    >
      <!-- Header mobile -->
      <div class="flex items-center justify-between p-4 border-b border-border">
        <div class="flex-1 min-w-0">
          <h1 class="text-lg font-bold truncate">Comunidade</h1>
          <p class="text-xs text-muted-foreground">Menu</p>
        </div>
        
        <button 
          @click="isMobileMenuOpen = false"
          class="p-2 rounded-lg text-foreground/80 hover:text-foreground hover:bg-muted transition-colors"
        >
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/>
          </svg>
        </button>
      </div>

      <!-- Menu mobile da comunidade -->
      <div class="p-4 flex-1 overflow-y-auto">
        <!-- Botão Voltar -->
        <NuxtLink
          to="/"
          @click="isMobileMenuOpen = false"
          class="flex items-center gap-2 px-4 py-2 mb-6 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
        >
          <Icon icon="home" :class-name="'w-4 h-4'" fallback="" />
          <span class="text-sm font-medium">← Voltar ao Dashboard</span>
        </NuxtLink>

        <h3 class="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-4 px-4">
          Menu da Comunidade
        </h3>

        <nav class="space-y-1">
          <button
            v-for="item in menuItems"
            :key="item.id"
            @click="activeItem = item.id"
            :class="[
              'w-full flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm font-medium transition-colors',
              activeItem === item.id
                ? 'bg-primary text-primary-foreground'
                : 'text-foreground hover:bg-muted'
            ]"
          >
            <span class="text-lg">{{ item.icon }}</span>
            <span>{{ item.label }}</span>
          </button>
        </nav>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
const router = useRouter()
const { signOut } = useAuth()

const isMobileMenuOpen = ref(false)
const activeItem = ref('feed')

const menuItems = [
  { id: 'feed', label: 'Feed', icon: '🏠' },
  { id: 'start', label: 'Comece aqui', icon: '🚀' },
  { id: 'pricing', label: 'Precificação', icon: '💰' },
  { id: 'stock', label: 'Estoque', icon: '📦' },
  { id: 'profit', label: 'Lucro & Margem', icon: '📊' },
  { id: 'success', label: 'Histórias de Sucesso', icon: '⭐' }
]

const handleLogout = async () => {
  try {
    await signOut()
    router.push('/login')
  } catch (error) {
    console.error('Erro ao sair:', error)
  }
}
</script>
