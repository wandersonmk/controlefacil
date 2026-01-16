<template>
  <div class="bg-card rounded-lg border border-border shadow-sm p-4">
    <h3 class="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
      <span class="text-xl">⭐</span>
      Publicações em destaque
    </h3>
    
    <div class="space-y-3">
      <div
        v-for="post in featuredPosts"
        :key="post.id"
        class="p-3 rounded-lg hover:bg-muted transition-colors cursor-pointer group"
      >
        <h4 class="text-sm font-medium text-foreground group-hover:text-primary transition-colors mb-1">
          {{ post.title }}
        </h4>
        <div class="flex items-center gap-2 text-xs text-muted-foreground">
          <span>{{ post.author }}</span>
          <span>•</span>
          <span class="flex items-center gap-1">
            <span>❤️</span>
            {{ post.likes }}
          </span>
        </div>
      </div>
    </div>
    
    <button class="w-full mt-4 py-2 text-sm text-primary hover:bg-primary/10 rounded-lg transition-colors font-medium">
      Ver todas
    </button>
  </div>
</template>

<script setup lang="ts">
const featuredPosts = [
  {
    id: 1,
    title: 'Guia completo de precificação para iniciantes',
    author: 'Pedro Costa',
    likes: 234
  },
  {
    id: 2,
    title: 'Como dobrei meu lucro em 3 meses',
    author: 'Juliana Alves',
    likes: 189
  },
  {
    id: 3,
    title: '10 erros comuns no controle de estoque',
    author: 'Roberto Lima',
    likes: 156
  }
]
</script>
