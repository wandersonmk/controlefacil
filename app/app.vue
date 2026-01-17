<script setup lang="ts">
// Força a recarga do layout baseado na rota
const route = useRoute()
const layoutKey = computed(() => route.meta.layout || 'default')

// Estado de loading inicial apenas no cliente
const isInitializing = ref(true)

onMounted(() => {
  // Aguarda um frame para garantir que o conteúdo está pronto
  requestAnimationFrame(() => {
    isInitializing.value = false
  })
})
</script>

<template>
  <div id="app" class="min-h-screen bg-background text-foreground">
    <!-- Loading inicial apenas no cliente -->
    <ClientOnly>
      <div 
        v-if="isInitializing" 
        class="fixed inset-0 bg-background flex items-center justify-center z-50"
      >
        <div class="flex flex-col items-center gap-4">
          <div class="w-12 h-12 border-4 border-primary/20 border-t-primary rounded-full animate-spin"></div>
          <p class="text-sm text-muted-foreground">Carregando...</p>
        </div>
      </div>
    </ClientOnly>
    
    <!-- Accessibility -->
    <NuxtRouteAnnouncer />
    
    <!-- Layout wrapper com key dinâmica para forçar recarga -->
    <NuxtLayout :key="layoutKey">
      <!-- Page content -->
      <NuxtPage />
    </NuxtLayout>
  </div>
</template>
