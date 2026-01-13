<script setup lang="ts">
// Força a recarga do layout baseado na rota
const route = useRoute()
const layoutKey = computed(() => route.meta.layout || 'default')
</script>

<template>
  <div id="app" class="min-h-screen bg-background text-foreground">
    <!-- Accessibility -->
    <NuxtRouteAnnouncer />
    
    <!-- Layout wrapper com key dinâmica para forçar recarga -->
    <NuxtLayout :key="layoutKey">
      <!-- Page content -->
      <NuxtPage />
    </NuxtLayout>
  </div>
</template>
