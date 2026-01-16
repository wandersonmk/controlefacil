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
        <div class="w-32 h-32 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center text-6xl">
          👥
        </div>
      </div>

      <!-- Título -->
      <h1 class="text-4xl md:text-5xl font-bold text-foreground">
        Em breve
      </h1>

      <!-- Descrição -->
      <p class="text-xl text-muted-foreground max-w-lg mx-auto">
        Estamos preparando um espaço incrível para você se conectar com outros empreendedores, trocar experiências e aprender juntos.
      </p>

      <!-- Features -->
      <div class="grid md:grid-cols-3 gap-6 mt-12">
        <div class="p-6 rounded-lg bg-card border border-border">
          <div class="text-3xl mb-3">💬</div>
          <h3 class="font-semibold text-foreground mb-2">Discussões</h3>
          <p class="text-sm text-muted-foreground">Tire dúvidas e compartilhe conhecimento</p>
        </div>
        
        <div class="p-6 rounded-lg bg-card border border-border">
          <div class="text-3xl mb-3">📚</div>
          <h3 class="font-semibold text-foreground mb-2">Conteúdos</h3>
          <p class="text-sm text-muted-foreground">Artigos e dicas exclusivas</p>
        </div>
        
        <div class="p-6 rounded-lg bg-card border border-border">
          <div class="text-3xl mb-3">🎯</div>
          <h3 class="font-semibold text-foreground mb-2">Networking</h3>
          <p class="text-sm text-muted-foreground">Conecte-se com empreendedores</p>
        </div>
      </div>

      <!-- CTA -->
      <div class="mt-8">
        <NuxtLink
          to="/"
          class="inline-flex items-center gap-2 px-6 py-3 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors font-medium"
        >
          <span>←</span>
          Voltar ao Dashboard
        </NuxtLink>
      </div>
    </div>
  </div>
</template>
