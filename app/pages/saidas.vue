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
    <AppLoading
      v-if="isLoading"
      title="Carregando Saídas"
      description="Preparando a área de saídas..."
    />

    <div v-else class="space-y-6">
      <div class="rounded-xl border border-border bg-muted/30 px-4 py-3">
        <p class="text-xs font-semibold tracking-wide text-muted-foreground">EM DESENVOLVIMENTOS</p>
      </div>
      <SaidasManager />
    </div>
  </div>
</template>
