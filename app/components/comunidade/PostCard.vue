<template>
  <div class="bg-card rounded-lg border border-border shadow-sm hover:shadow-md transition-shadow">
    <!-- Header -->
    <div class="p-4 border-b border-border">
      <div class="flex items-start gap-3">
        <!-- Avatar -->
        <div class="w-12 h-12 rounded-full bg-gradient-to-r from-blue-500 to-purple-500 flex items-center justify-center text-2xl flex-shrink-0">
          {{ post.author.avatar }}
        </div>
        
        <!-- Author Info -->
        <div class="flex-1 min-w-0">
          <div class="flex items-center gap-2">
            <h3 class="font-semibold text-foreground">{{ post.author.name }}</h3>
            <span class="text-xs text-muted-foreground">• {{ post.date }}</span>
          </div>
          <p class="text-sm text-muted-foreground">{{ post.author.role }}</p>
        </div>
        
        <!-- Menu -->
        <button class="p-1 rounded-lg text-muted-foreground hover:bg-muted transition-colors">
          <span class="text-lg">⋮</span>
        </button>
      </div>
    </div>

    <!-- Content -->
    <div class="p-4">
      <!-- Category Badge -->
      <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-primary/10 text-primary mb-3">
        {{ post.category }}
      </span>
      
      <!-- Title -->
      <h4 class="text-lg font-semibold text-foreground mb-2">
        {{ post.title }}
      </h4>
      
      <!-- Content -->
      <p class="text-sm text-muted-foreground leading-relaxed">
        {{ post.content }}
      </p>
    </div>

    <!-- Footer Actions -->
    <div class="px-4 py-3 border-t border-border">
      <div class="flex items-center gap-6">
        <button class="flex items-center gap-2 text-sm text-muted-foreground hover:text-primary transition-colors">
          <span class="text-lg">❤️</span>
          <span>{{ post.likes }}</span>
        </button>
        
        <button class="flex items-center gap-2 text-sm text-muted-foreground hover:text-primary transition-colors">
          <span class="text-lg">💬</span>
          <span>{{ post.comments }}</span>
        </button>
        
        <button class="flex items-center gap-2 text-sm text-muted-foreground hover:text-primary transition-colors ml-auto">
          <span class="text-lg">🔖</span>
          <span class="hidden sm:inline">Salvar</span>
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
defineProps<{
  post: {
    id: number
    author: {
      name: string
      avatar: string
      role: string
    }
    date: string
    title: string
    content: string
    likes: number
    comments: number
    category: string
  }
}>()
</script>
