<script setup lang="ts">
// Aplica middleware de autenticação
definePageMeta({
  middleware: 'auth',
  layout: 'dashboard'
})

// Estado de carregamento
const isLoading = ref(true)
let authLoading: any = ref(false)
const isClient = typeof window !== 'undefined'

// Aba ativa (meus-fornecedores | parceiros)
const abaAtiva = ref<'meus-fornecedores' | 'parceiros'>('meus-fornecedores')

if (isClient) {
  // Só executa useAuth no cliente
  const auth = useAuth()
  authLoading = auth.isLoading

  onMounted(async () => {
    // Aguarda o auth loading terminar
    while (authLoading.value) {
      await new Promise(resolve => setTimeout(resolve, 50))
    }
    // Delay adicional para garantir carregamento suave
    await new Promise(resolve => setTimeout(resolve, 500))
    isLoading.value = false
  })
} else {
  isLoading.value = false
}
</script>

<template>
  <div>
    <!-- Loading enquanto carrega -->
    <div v-if="isLoading" class="text-center py-12 bg-muted/30 rounded-xl border border-border">
      <div class="flex flex-col items-center">
        <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mb-4"></div>
        <p class="text-lg font-medium text-muted-foreground">Carregando fornecedores...</p>
      </div>
    </div>
    
    <!-- Conteúdo principal com abas -->
    <div v-else class="space-y-4">
      <!-- Abas -->
      <div class="bg-card border border-border rounded-xl p-1 flex gap-1">
        <button
          @click="abaAtiva = 'meus-fornecedores'"
          :class="[
            'flex-1 py-2.5 px-4 rounded-lg text-sm font-medium transition-all',
            abaAtiva === 'meus-fornecedores'
              ? 'bg-primary text-primary-foreground shadow-sm'
              : 'text-muted-foreground hover:text-foreground hover:bg-muted'
          ]"
        >
          📦 Meus Fornecedores
        </button>
        <button
          @click="abaAtiva = 'parceiros'"
          :class="[
            'flex-1 py-2.5 px-4 rounded-lg text-sm font-medium transition-all',
            abaAtiva === 'parceiros'
              ? 'bg-primary text-primary-foreground shadow-sm'
              : 'text-muted-foreground hover:text-foreground hover:bg-muted'
          ]"
        >
          🤝 Fornecedores Parceiros
        </button>
      </div>

      <!-- Conteúdo das abas -->
      <div v-if="abaAtiva === 'meus-fornecedores'">
        <FornecedoresManager />
      </div>

      <div v-else>
        <FornecedoresParceirosTab />
      </div>
    </div>
  </div>
</template>
