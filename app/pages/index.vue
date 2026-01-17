<script setup lang="ts">
// Redireciona automaticamente para a página de login
definePageMeta({
  layout: false
})

// Redireciona imediatamente para /login
navigateTo('/login', { replace: true })
</script>

<template>
  <div class="min-h-screen bg-background flex items-center justify-center">
    <div class="flex flex-col items-center gap-4">
      <div class="w-12 h-12 border-4 border-primary/20 border-t-primary rounded-full animate-spin"></div>
      <p class="text-sm text-muted-foreground">Redirecionando...</p>
    </div>
  </div>
</template>
