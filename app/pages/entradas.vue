<script setup lang="ts">
// Aplica middleware de autenticação
definePageMeta({
  middleware: 'auth',
  layout: 'dashboard'
})

// Página vazia por enquanto (sem ações de banco)
const isLoading = ref(true)
const { isLoading: authLoading } = useAuth()

onMounted(async () => {
  while (authLoading.value) {
    await new Promise(resolve => setTimeout(resolve, 50))
  }
  await new Promise(resolve => setTimeout(resolve, 200))
  isLoading.value = false
})
</script>

<template>
  <div>
    <AppLoading
      v-if="isLoading"
      title="Carregando Entradas"
      description="Preparando a área de entradas..."
    />

    <div v-else class="space-y-4">
      <div class="bg-card text-card-foreground rounded-2xl border-0 shadow-md p-4">
        <h1 class="text-sm font-bold text-foreground">Entradas</h1>
        <p class="text-xs text-muted-foreground mt-1">Página em construção (sem integrações por enquanto).</p>
      </div>
    </div>
  </div>
</template>
