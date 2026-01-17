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
        <p class="text-lg font-medium text-muted-foreground">Carregando estoque...</p>
      </div>
    </div>
    
    <!-- Conteúdo principal -->
    <div v-else>
      <EstoqueManager />
    </div>
  </div>
</template>
