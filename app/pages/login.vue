<script setup lang="ts">
// Middleware para redirecionar usuários já logados
definePageMeta({
  middleware: 'guest',
  layout: 'auth'
})
</script>

<template>
  <div class="min-h-[calc(100vh-0px)] w-full flex items-center justify-center p-4 lg:p-8 relative overflow-hidden bg-background dark:bg-background">
    <!-- Background gradiente sutil -->
    <div class="absolute inset-0 bg-gradient-to-br from-muted/30 via-background to-muted/20 dark:from-black/50 dark:via-background dark:to-black/40"></div>
    <div class="absolute inset-0 bg-gradient-to-tl from-primary/5 via-background to-purple-950/10 dark:from-primary/8 dark:via-black dark:to-purple-950/15"></div>
    <div class="absolute inset-0 bg-[radial-gradient(circle_at_50%_120%,rgba(88,28,135,0.08),rgba(0,0,0,0.3))] dark:bg-[radial-gradient(circle_at_50%_120%,rgba(88,28,135,0.12),rgba(0,0,0,0.8))]"></div>
    
    <!-- Círculos decorativos sutis -->
    <div class="absolute top-10 left-10 w-96 h-96 bg-gradient-to-br from-muted/20 to-primary/10 dark:from-black/60 dark:to-purple-950/20 rounded-full blur-3xl animate-pulse"></div>
    <div class="absolute top-40 right-20 w-72 h-72 bg-gradient-to-br from-primary/8 to-muted/15 dark:from-purple-950/15 dark:to-black/70 rounded-full blur-3xl animate-pulse" style="animation-delay: 0.5s;"></div>
    <div class="absolute bottom-10 right-10 w-[500px] h-[500px] bg-gradient-to-br from-muted/15 to-primary/10 dark:from-black/65 dark:to-purple-950/18 rounded-full blur-3xl animate-pulse" style="animation-delay: 1s;"></div>
    <div class="absolute bottom-40 left-20 w-80 h-80 bg-gradient-to-br from-primary/8 to-muted/20 dark:from-purple-950/12 dark:to-black/75 rounded-full blur-3xl animate-pulse" style="animation-delay: 1.5s;"></div>
    
    <!-- Conteúdo -->
    <div class="relative z-10 w-full max-w-7xl">
      <AuthTabs />
    </div>
  </div>
</template>


