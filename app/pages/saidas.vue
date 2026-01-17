<script setup lang="ts">
// Aplica middleware de autenticação
definePageMeta({
  middleware: 'auth',
  layout: 'dashboard'
})

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
    <!-- Loading enquanto carrega -->
    <div v-if="isLoading" class="text-center py-12 bg-muted/30 rounded-xl border border-border">
      <div class="flex flex-col items-center">
        <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mb-4"></div>
        <p class="text-lg font-medium text-muted-foreground">Carregando saídas...</p>
      </div>
    </div>

    <!-- Conteúdo principal -->
    <div v-else>
      <SaidasManager />
    </div>
  </div>
</template>
