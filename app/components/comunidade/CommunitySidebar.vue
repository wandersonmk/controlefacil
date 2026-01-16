<template>
  <aside class="sticky top-6 h-[calc(100vh-3rem)]">
    <div class="bg-card rounded-lg border border-border shadow-sm p-4 h-full flex flex-col">
      <!-- Botão Voltar -->
      <NuxtLink
        to="/"
        class="flex items-center gap-2 px-4 py-2 mb-6 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
      >
        <Icon icon="home" :class-name="'w-4 h-4'" fallback="" />
        <span class="text-sm font-medium">← Voltar ao Dashboard</span>
      </NuxtLink>

      <!-- Título -->
      <h3 class="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-4 px-4">
        Menu da Comunidade
      </h3>

      <!-- Menu Items -->
      <nav class="space-y-1 flex-1">
        <button
          v-for="item in menuItems"
          :key="item.id"
          @click="activeItem = item.id"
          :class="[
            'w-full flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm font-medium transition-colors',
            activeItem === item.id
              ? 'bg-primary text-primary-foreground'
              : 'text-foreground hover:bg-muted'
          ]"
        >
          <span class="text-lg">{{ item.icon }}</span>
          <span>{{ item.label }}</span>
        </button>
      </nav>

      <!-- Footer Info -->
      <div class="mt-auto pt-4 border-t border-border">
        <p class="text-xs text-muted-foreground px-4">
          Conecte-se com outros empreendedores
        </p>
      </div>
    </div>
  </aside>
</template>

<script setup lang="ts">
const activeItem = ref('feed')

const menuItems = [
  { id: 'feed', label: 'Feed', icon: '🏠' },
  { id: 'start', label: 'Comece aqui', icon: '🚀' },
  { id: 'pricing', label: 'Precificação', icon: '💰' },
  { id: 'stock', label: 'Estoque', icon: '📦' },
  { id: 'profit', label: 'Lucro & Margem', icon: '📊' },
  { id: 'success', label: 'Histórias de Sucesso', icon: '⭐' }
]
</script>
