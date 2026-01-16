<script setup lang="ts">
definePageMeta({
  middleware: 'auth',
  layout: 'dashboard'
})
</script>

<template>
  <div class="min-h-[calc(100vh-12rem)] flex items-center justify-center p-6">
    <div class="max-w-2xl w-full text-center space-y-6">
      <!-- Ícone -->
      <div class="flex justify-center mb-8">
        <div class="w-32 h-32 rounded-full bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 flex items-center justify-center text-6xl animate-pulse">
          🤖
        </div>
      </div>

      <!-- Título -->
      <h1 class="text-4xl md:text-5xl font-bold text-foreground">
        Mentor IA
      </h1>

      <!-- Descrição -->
      <p class="text-xl text-muted-foreground max-w-lg mx-auto">
        Seu assistente inteligente para gestão de negócios está sendo preparado. Em breve você poderá tirar dúvidas sobre precificação, estratégias e muito mais!
      </p>

      <!-- Features Futuras -->
      <div class="grid md:grid-cols-3 gap-6 mt-12">
        <div class="p-6 rounded-lg bg-card border border-border hover:border-primary/50 transition-colors">
          <div class="text-3xl mb-3">💡</div>
          <h3 class="font-semibold text-foreground mb-2">Consultoria IA</h3>
          <p class="text-sm text-muted-foreground">Respostas inteligentes sobre gestão</p>
        </div>
        
        <div class="p-6 rounded-lg bg-card border border-border hover:border-primary/50 transition-colors">
          <div class="text-3xl mb-3">📊</div>
          <h3 class="font-semibold text-foreground mb-2">Análises</h3>
          <p class="text-sm text-muted-foreground">Insights sobre seu negócio</p>
        </div>
        
        <div class="p-6 rounded-lg bg-card border border-border hover:border-primary/50 transition-colors">
          <div class="text-3xl mb-3">🎯</div>
          <h3 class="font-semibold text-foreground mb-2">Estratégias</h3>
          <p class="text-sm text-muted-foreground">Sugestões personalizadas</p>
        </div>
      </div>

      <!-- Info sobre Tokens -->
      <div class="mt-8 p-6 bg-gradient-to-r from-indigo-50 to-purple-50 dark:from-indigo-950/20 dark:to-purple-950/20 rounded-xl border border-indigo-500/20">
        <div class="flex items-center justify-center gap-3 mb-3">
          <span class="text-2xl">⚡</span>
          <h3 class="font-semibold text-foreground">Funciona com tokens</h3>
        </div>
        <p class="text-sm text-muted-foreground">
          O Mentor IA utiliza tokens do seu plano de assinatura. Veja os planos disponíveis na página de <NuxtLink to="/assinatura" class="text-primary font-medium hover:underline">Assinatura</NuxtLink>.
        </p>
      </div>

      <!-- CTA -->
      <div class="mt-8 flex gap-4 justify-center">
        <NuxtLink
          to="/"
          class="inline-flex items-center gap-2 px-6 py-3 bg-muted text-foreground rounded-lg hover:bg-muted/80 transition-colors font-medium"
        >
          <span>←</span>
          Voltar ao Dashboard
        </NuxtLink>
        
        <NuxtLink
          to="/assinatura"
          class="inline-flex items-center gap-2 px-6 py-3 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors font-medium"
        >
          <span>Ver Planos</span>
          <span>→</span>
        </NuxtLink>
      </div>
    </div>
  </div>
</template>
