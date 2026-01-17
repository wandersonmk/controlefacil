<script setup lang="ts">
// Middleware para redirecionar usuários já logados
definePageMeta({
  middleware: 'guest',
  layout: 'auth'
})

// Garante visibilidade imediata no cliente
const isReady = ref(false)

onMounted(() => {
  requestAnimationFrame(() => {
    isReady.value = true
  })
})
</script>

<template>
  <div class="min-h-[calc(100vh-0px)] w-full flex items-center justify-center p-4">
    <!-- Loading temporário apenas no primeiro frame -->
    <ClientOnly>
      <div v-if="!isReady" class="flex flex-col items-center gap-4">
        <div class="w-10 h-10 border-4 border-primary/20 border-t-primary rounded-full animate-spin"></div>
        <p class="text-sm text-muted-foreground">Carregando...</p>
      </div>
      <template #fallback>
        <div class="flex flex-col items-center gap-4">
          <div class="w-10 h-10 border-4 border-primary/20 border-t-primary rounded-full animate-spin"></div>
          <p class="text-sm text-muted-foreground">Carregando...</p>
        </div>
      </template>
    </ClientOnly>
    
    <!-- Conteúdo principal -->
    <AuthTabs v-show="isReady" />
  </div>
</template>


