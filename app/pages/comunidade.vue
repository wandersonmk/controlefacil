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
        <div class="w-32 h-32 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center text-6xl animate-pulse">
          👥
        </div>
      </div>

      <!-- Título -->
      <h1 class="text-4xl md:text-5xl font-bold text-foreground">
        Junte-se à Nossa Comunidade
      </h1>

      <!-- Descrição -->
      <p class="text-xl text-muted-foreground max-w-lg mx-auto">
        Conecte-se com outros empreendedores, compartilhe experiências, encontre fornecedores de vários estados e aprenda em um ambiente colaborativo exclusivo.
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
      <div class="mt-12">
        <!-- Botão Principal com Gradiente Animado -->
        <div class="flex justify-center">
          <a
            href="https://www.skool.com/precify-club-2957/about?ref=c2a877fe240e4005b01faaf10cc62e2f"
            target="_blank"
            rel="noopener noreferrer"
            class="group relative inline-flex items-center justify-center gap-3 px-8 py-4 text-lg font-bold text-white rounded-xl overflow-hidden transition-all duration-300 hover:scale-105 hover:shadow-2xl"
          >
            <!-- Gradiente Animado de Fundo -->
            <span class="absolute inset-0 bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-[length:200%_100%] animate-gradient"></span>
            
            <!-- Brilho que passa -->
            <span class="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent translate-x-[-200%] group-hover:translate-x-[200%] transition-transform duration-1000"></span>
            
            <!-- Conteúdo do Botão -->
            <span class="relative flex items-center gap-3">
              <span class="text-2xl">🚀</span>
              <span>Entrar na Comunidade</span>
              <span class="text-2xl group-hover:translate-x-1 transition-transform">→</span>
            </span>
          </a>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
@keyframes gradient {
  0% {
    background-position: 0% 50%;
  }
  50% {
    background-position: 100% 50%;
  }
  100% {
    background-position: 0% 50%;
  }
}

.animate-gradient {
  animation: gradient 3s ease infinite;
}
</style>
