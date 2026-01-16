<template>
  <div class="bg-card rounded-lg border border-border shadow-sm p-4">
    <div class="flex gap-3">
      <!-- Avatar -->
      <div class="w-10 h-10 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 flex items-center justify-center text-xl flex-shrink-0">
        👤
      </div>
      
      <!-- Input Area -->
      <div class="flex-1">
        <textarea
          placeholder="Criar uma publicação…"
          rows="2"
          class="w-full px-4 py-3 border border-border rounded-lg bg-muted/30 text-foreground placeholder-muted-foreground resize-none focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
        ></textarea>
        
        <!-- Actions -->
        <div class="flex items-center justify-between mt-3">
          <div class="flex items-center gap-2">
            <button class="p-2 rounded-lg text-muted-foreground hover:bg-muted transition-colors" title="Adicionar imagem">
              <span class="text-lg">🖼️</span>
            </button>
            <button class="p-2 rounded-lg text-muted-foreground hover:bg-muted transition-colors" title="Adicionar link">
              <span class="text-lg">🔗</span>
            </button>
            <button class="p-2 rounded-lg text-muted-foreground hover:bg-muted transition-colors" title="Adicionar enquete">
              <span class="text-lg">📊</span>
            </button>
          </div>
          
          <button 
            disabled
            class="px-6 py-2 bg-primary/50 text-primary-foreground rounded-lg text-sm font-medium cursor-not-allowed"
          >
            Publicar
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
</script>
