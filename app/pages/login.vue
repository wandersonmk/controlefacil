<script setup lang="ts">
// Middleware para redirecionar usuários já logados
definePageMeta({
  middleware: 'guest',
  layout: 'auth'
})

// Forçar modo escuro SEMPRE na página de login
if (process.client) {
  // Adiciona classe dark assim que a página é acessada
  document.documentElement.classList.add('dark')
  
  onMounted(() => {
    // Garante que está em dark ao montar
    document.documentElement.classList.add('dark')
  })
  
  onBeforeUnmount(() => {
    // Não remove o dark aqui - deixa o sistema decidir baseado na rota de destino
  })
}
</script>

<template>
  <div class="min-h-screen w-full flex relative overflow-hidden bg-[#0a0a0a]">
    <!-- Grid pattern background -->
    <div class="absolute inset-0 bg-[linear-gradient(to_right,#ffffff05_1px,transparent_1px),linear-gradient(to_bottom,#ffffff05_1px,transparent_1px)] bg-[size:24px_24px]"></div>
    
    <!-- Gradient orbs - sutis -->
    <div class="absolute top-0 -left-4 w-96 h-96 bg-purple-900 rounded-full mix-blend-normal filter blur-3xl opacity-10 animate-blob"></div>
    <div class="absolute top-0 -right-4 w-96 h-96 bg-blue-900 rounded-full mix-blend-normal filter blur-3xl opacity-10 animate-blob animation-delay-2000"></div>
    <div class="absolute -bottom-8 left-20 w-96 h-96 bg-pink-900 rounded-full mix-blend-normal filter blur-3xl opacity-10 animate-blob animation-delay-4000"></div>
    
    <!-- Content Container -->
    <div class="relative z-10 w-full flex flex-col lg:flex-row">
      <!-- Left Side - Form -->
      <div class="w-full lg:w-1/2 flex items-center justify-center p-6 lg:p-12">
        <div class="w-full max-w-md">
          <AuthTabs />
        </div>
      </div>

      <!-- Right Side - Info -->
      <div class="hidden lg:flex w-1/2 items-center justify-center p-12 relative">
        <div class="max-w-lg space-y-8">
          <!-- Logo/Title -->
          <div class="space-y-4">
            <div class="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-blue-500/20 via-purple-500/20 to-pink-500/20 border border-purple-500/30">
              <div class="w-2 h-2 rounded-full bg-gradient-to-r from-blue-500 to-purple-500 animate-pulse shadow-lg shadow-purple-500/50"></div>
              <span class="text-sm font-medium bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">Sistema de Controle e Precificação</span>
            </div>
            
            <h1 class="text-6xl font-bold tracking-tight">
              <span class="bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
                PRECIFY
              </span>
            </h1>
            
            <p class="text-xl text-gray-400 leading-relaxed">
              Controle de precificação, fornecedores, calculadora inteligente e Mentor IA para precificar produtos evitando prejuízos
            </p>
          </div>

          <!-- Features -->
          <div class="grid gap-4">
            <div class="flex items-start gap-4 p-4 rounded-2xl bg-white/5 backdrop-blur-sm border border-white/10 hover:border-primary/30 transition-all">
              <div class="flex-shrink-0 w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center">
                <svg class="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"/>
                </svg>
              </div>
              <div>
                <h3 class="font-semibold text-white mb-1">Dashboard Inteligente</h3>
                <p class="text-sm text-gray-400">Visualize suas métricas em tempo real</p>
              </div>
            </div>

            <div class="flex items-start gap-4 p-4 rounded-2xl bg-white/5 backdrop-blur-sm border border-white/10 hover:border-primary/30 transition-all">
              <div class="flex-shrink-0 w-10 h-10 rounded-xl bg-gradient-to-br from-purple-500 to-purple-600 flex items-center justify-center">
                <svg class="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
                </svg>
              </div>
              <div>
                <h3 class="font-semibold text-white mb-1">Calculadora de Preços</h3>
                <p class="text-sm text-gray-400">Precifique com precisão e lucro</p>
              </div>
            </div>

            <div class="flex items-start gap-4 p-4 rounded-2xl bg-white/5 backdrop-blur-sm border border-white/10 hover:border-primary/30 transition-all">
              <div class="flex-shrink-0 w-10 h-10 rounded-xl bg-gradient-to-br from-pink-500 to-pink-600 flex items-center justify-center">
                <svg class="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 12l3-3 3 3 4-4M8 21l4-4 4 4M3 4h18M4 4h16v12a1 1 0 01-1 1H5a1 1 0 01-1-1V4z"/>
                </svg>
              </div>
              <div>
                <h3 class="font-semibold text-white mb-1">Relatórios Completos</h3>
                <p class="text-sm text-gray-400">Análises detalhadas do seu negócio</p>
              </div>
            </div>
          </div>

          <!-- Social Proof -->
          <div class="flex items-center gap-6 pt-4">
            <div class="text-center">
              <div class="text-3xl font-bold text-white">500+</div>
              <div class="text-sm text-gray-400">Empresas ativas</div>
            </div>
            <div class="w-px h-12 bg-white/10"></div>
            <div class="text-center">
              <div class="text-3xl font-bold text-white">98%</div>
              <div class="text-sm text-gray-400">Satisfação</div>
            </div>
            <div class="w-px h-12 bg-white/10"></div>
            <div class="text-center">
              <div class="text-3xl font-bold text-white">24/7</div>
              <div class="text-sm text-gray-400">Suporte</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
@keyframes blob {
  0% {
    transform: translate(0px, 0px) scale(1);
  }
  33% {
    transform: translate(30px, -50px) scale(1.1);
  }
  66% {
    transform: translate(-20px, 20px) scale(0.9);
  }
  100% {
    transform: translate(0px, 0px) scale(1);
  }
}

.animate-blob {
  animation: blob 7s infinite;
}

.animation-delay-2000 {
  animation-delay: 2s;
}

.animation-delay-4000 {
  animation-delay: 4s;
}
</style>


