<script setup lang="ts">
// Animação dos pontinhos
</script>

<template>
  <div class="flex justify-start mb-4">
    <div class="max-w-[75%] rounded-2xl px-4 py-3 shadow-sm bg-card border border-border">
      <!-- Avatar do Mentor -->
      <div class="flex items-start gap-3 mb-2">
        <div class="w-8 h-8 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-white font-bold text-sm flex-shrink-0 animate-pulse">
          🤖
        </div>
        <div class="flex-1">
          <p class="text-xs font-semibold text-muted-foreground">Mentor IA</p>
        </div>
      </div>

      <!-- Loading Animation -->
      <div class="flex items-center gap-2 text-sm text-muted-foreground">
        <span>Mentor IA está analisando</span>
        <div class="flex gap-1">
          <span class="animate-bounce" style="animation-delay: 0ms">.</span>
          <span class="animate-bounce" style="animation-delay: 150ms">.</span>
          <span class="animate-bounce" style="animation-delay: 300ms">.</span>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
@keyframes bounce {
  0%, 100% {
    transform: translateY(0);
  }
  50% {
    transform: translateY(-4px);
  }
}

.animate-bounce {
  animation: bounce 1s infinite;
}
</style>
